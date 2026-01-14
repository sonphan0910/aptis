const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
const { BadRequestError } = require('../utils/errors');
const { UPLOAD_LIMITS } = require('../utils/constants');

class AzureSpeechService {
  constructor() {
    this.endpoint = process.env.AZURE_SPEECH_ENDPOINT || 'https://southeastasia.stt.speech.microsoft.com/';
    this.apiKey = process.env.AZURE_SPEECH_KEY;
    this.region = process.env.AZURE_SPEECH_REGION || 'southeastasia';
  }

  /**
   * Convert audio to WAV format for Azure Speech Service
   */
  async convertToWav(audioFilePath) {
    const outputPath = audioFilePath.replace(/\.[^/.]+$/, '_converted.wav');
    
    return new Promise((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegStatic, [
        '-i', audioFilePath,
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        '-y', // Overwrite output file
        outputPath
      ]);

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`Audio conversion failed with code: ${code}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });

      ffmpegProcess.stderr.on('data', (data) => {
        // Log errors if needed
        if (data.toString().includes('Error')) {
          console.error('[FFmpeg]', data.toString());
        }
      });
    });
  }

  /**
   * Call Azure Speech Service API for transcription
   */
  async transcribeWithAzure(audioFilePath, language = 'en-US') {
    try {
      if (!this.apiKey) {
        throw new Error('AZURE_SPEECH_KEY not configured');
      }

      console.log(`[Azure Speech] Converting audio for Azure Speech Service...`);
      const wavPath = await this.convertToWav(audioFilePath);

      console.log(`[Azure Speech] Calling Azure Speech API (${this.region})...`);
      
      // Read the audio file
      const audioData = await fs.readFile(wavPath);
      
      // Azure Speech Service REST API call - Simple subscription key method
      const speechApiUrl = `${this.endpoint}speech/recognition/conversation/cognitiveservices/v1?language=${language}`;
      console.log(`[Azure Speech] Calling: ${speechApiUrl}`);
      
      const response = await fetch(speechApiUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'audio/wav',
          'Accept': 'application/json'
        },
        body: audioData,
        timeout: 60000 // 60 second timeout
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Azure Speech API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      // Clean up converted file
      try {
        await fs.unlink(wavPath);
      } catch (cleanupError) {
        console.warn('[Azure Speech] Failed to cleanup converted file:', cleanupError.message);
      }

      return {
        text: result.DisplayText || result.RecognitionStatus === 'Success' ? result.DisplayText : '',
        confidence: result.Confidence || 0.9,
        offset: result.Offset || 0,
        duration: result.Duration || 0,
        recognitionStatus: result.RecognitionStatus || 'Unknown'
      };

    } catch (error) {
      console.error('[Azure Speech] ❌ Transcription failed:', error.message);
      throw error;
    }
  }

  /**
   * Enhanced pronunciation assessment using Azure Speech Service
   */
  async assessPronunciation(audioFilePath, referenceText = '', language = 'en-US') {
    try {
      if (!this.apiKey) {
        throw new Error('AZURE_SPEECH_KEY not configured');
      }

      console.log(`[Azure Speech] Performing pronunciation assessment...`);
      const wavPath = await this.convertToWav(audioFilePath);
      const audioData = await fs.readFile(wavPath);

      // Pronunciation Assessment API - Fixed format
      const assessmentParams = {
        ReferenceText: referenceText,
        GradingSystem: 'HundredMark',
        Dimension: 'Comprehensive',
        EnableMiscue: true
      };

      const speechApiUrl = `${this.endpoint}speech/recognition/conversation/cognitiveservices/v1?language=${language}&format=detailed`;
      console.log(`[Azure Speech] Assessment URL: ${speechApiUrl}`);
      
      const response = await fetch(speechApiUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'audio/wav',
          'Pronunciation-Assessment': JSON.stringify(assessmentParams),
          'Accept': 'application/json'
        },
        body: audioData,
        timeout: 60000
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Azure Pronunciation API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      // Clean up converted file
      try {
        await fs.unlink(wavPath);
      } catch (cleanupError) {
        console.warn('[Azure Speech] Failed to cleanup converted file:', cleanupError.message);
      }

      return this.parseAzurePronunciationResult(result);

    } catch (error) {
      console.error('[Azure Speech] ❌ Pronunciation assessment failed:', error.message);
      throw error;
    }
  }

  /**
   * Parse Azure Speech pronunciation assessment result
   */
  parseAzurePronunciationResult(result) {
    try {
      const pronunciationAssessment = result.NBest?.[0]?.PronunciationAssessment || {};
      const words = result.NBest?.[0]?.Words || [];
      
      // Extract overall scores
      const pronunciationScore = pronunciationAssessment.PronScore || 50;
      const accuracyScore = pronunciationAssessment.AccuracyScore || 50;
      const fluencyScore = pronunciationAssessment.FluencyScore || 50;
      const completenessScore = pronunciationAssessment.CompletenessScore || 50;
      const prosodyScore = Math.min(100, (pronunciationScore + fluencyScore) / 2); // Estimate prosody
      
      // Extract word-level details
      const wordDetails = words.map(word => ({
        word: word.Word || '',
        pronunciationScore: word.PronunciationAssessment?.AccuracyScore || 50,
        errorType: this.getErrorType(word.PronunciationAssessment),
        confidence: word.Confidence || 0.5,
        syllables: word.Syllables || []
      }));

      // Detect emotional tone based on fluency and accuracy
      const emotionalTone = this.detectEmotionalToneFromScores(fluencyScore, pronunciationScore, accuracyScore);
      
      // Accent analysis based on accuracy patterns
      const accentAnalysis = this.analyzeAccentFromWords(wordDetails);

      return {
        text: result.NBest?.[0]?.Display || result.DisplayText || '',
        pronunciationScore: Math.round(pronunciationScore),
        accuracyScore: Math.round(accuracyScore),
        fluencyScore: Math.round(fluencyScore),
        completenessScore: Math.round(completenessScore),
        prosodyScore: Math.round(prosodyScore),
        confidence: pronunciationAssessment.PronScore ? pronunciationAssessment.PronScore / 100 : 0.8,
        wordDetails,
        emotionalTone,
        accentAnalysis,
        
        // Additional metrics for AI scoring integration
        audioQualityMetrics: {
          voiceActivityRatio: completenessScore / 100,
          speechRate: this.calculateSpeechRateFromAzure(result),
          pauseAnalysis: this.analyzePauseFromFluency(fluencyScore),
          spectralQuality: this.assessSpectralQualityFromAzure(accuracyScore, pronunciationScore)
        },
        
        errorAnalysis: this.analyzeErrorsFromAzure(wordDetails),
        pronunciationDifficulty: this.assessDifficultyFromAzure(wordDetails, result.NBest?.[0]?.Display || '')
      };

    } catch (error) {
      console.error('[Azure Speech] Error parsing pronunciation result:', error.message);
      throw error;
    }
  }

  /**
   * Convert Azure error types to our format
   */
  getErrorType(pronunciationAssessment) {
    if (!pronunciationAssessment) return 'None';
    
    const accuracy = pronunciationAssessment.AccuracyScore || 100;
    const errorType = pronunciationAssessment.ErrorType;
    
    if (errorType === 'Mispronunciation') return 'Mispronunciation';
    if (errorType === 'Omission') return 'Omission';
    if (errorType === 'Insertion') return 'Insertion';
    if (accuracy < 60) return 'Mispronunciation';
    if (accuracy < 80) return 'Substitution';
    
    return 'None';
  }

  /**
   * Detect emotional tone from Azure scores
   */
  detectEmotionalToneFromScores(fluencyScore, pronunciationScore, accuracyScore) {
    const avgScore = (fluencyScore + pronunciationScore + accuracyScore) / 3;
    
    if (fluencyScore > 85 && pronunciationScore > 80) {
      return 'confident';
    } else if (avgScore < 50 || fluencyScore < 40) {
      return 'hesitant';
    } else if (avgScore > 70 && fluencyScore > 70) {
      return 'engaged';
    } else if (avgScore < 60) {
      return 'nervous';
    } else {
      return 'neutral';
    }
  }

  /**
   * Analyze accent from word-level data
   */
  analyzeAccentFromWords(wordDetails) {
    if (wordDetails.length === 0) {
      return { strength: 'unknown', region: 'general', confidence: 0.5 };
    }
    
    const avgAccuracy = wordDetails.reduce((sum, word) => sum + word.pronunciationScore, 0) / wordDetails.length;
    const errorWords = wordDetails.filter(word => word.errorType !== 'None').length;
    const errorRate = errorWords / wordDetails.length;
    
    let strength = 'light';
    if (errorRate > 0.4 || avgAccuracy < 50) {
      strength = 'strong';
    } else if (errorRate > 0.2 || avgAccuracy < 70) {
      strength = 'moderate';
    }
    
    return {
      strength,
      region: 'general', // Could be enhanced with pattern analysis
      confidence: Math.max(0.3, 1 - errorRate)
    };
  }

  /**
   * Calculate speech rate from Azure result
   */
  calculateSpeechRateFromAzure(result) {
    const words = result.NBest?.[0]?.Words || [];
    const totalDuration = result.Duration ? result.Duration / 10000000 : 1; // Convert from ticks
    const wordCount = words.length;
    const wordsPerMinute = wordCount / (totalDuration / 60);
    
    return {
      wordsPerMinute: Math.round(wordsPerMinute),
      totalWords: wordCount,
      estimatedDuration: Math.round(totalDuration),
      rateAssessment: this.assessSpeechRate(wordsPerMinute)
    };
  }

  assessSpeechRate(wpm) {
    if (wpm < 80) return 'very_slow';
    if (wpm < 120) return 'slow';
    if (wpm < 180) return 'normal';
    if (wpm < 220) return 'fast';
    return 'very_fast';
  }

  /**
   * Analyze pause patterns from fluency score
   */
  analyzePauseFromFluency(fluencyScore) {
    let frequency, length, naturalness;
    
    if (fluencyScore > 85) {
      frequency = 'natural';
      length = 'appropriate';
      naturalness = 'natural';
    } else if (fluencyScore > 70) {
      frequency = 'moderate';
      length = 'appropriate';
      naturalness = 'mostly_natural';
    } else if (fluencyScore > 50) {
      frequency = 'frequent';
      length = 'somewhat_long';
      naturalness = 'mechanical';
    } else {
      frequency = 'excessive';
      length = 'too_long';
      naturalness = 'very_mechanical';
    }
    
    return { frequency, length, naturalness };
  }

  /**
   * Assess spectral quality from Azure metrics
   */
  assessSpectralQualityFromAzure(accuracyScore, pronunciationScore) {
    const avgQuality = (accuracyScore + pronunciationScore) / 2;
    
    return {
      overall: avgQuality >= 80 ? 'high' : avgQuality >= 60 ? 'good' : avgQuality >= 40 ? 'fair' : 'poor',
      clarity: pronunciationScore >= 75 ? 'clear' : pronunciationScore >= 60 ? 'adequate' : 'unclear',
      consistency: accuracyScore >= 80 ? 'consistent' : accuracyScore >= 60 ? 'variable' : 'inconsistent',
      backgroundNoise: 'minimal' // Azure handles noise reduction
    };
  }

  /**
   * Analyze errors from Azure word details
   */
  analyzeErrorsFromAzure(wordDetails) {
    if (wordDetails.length === 0) {
      return { totalErrors: 0, errorTypes: {}, errorRate: 0, severity: 'minimal' };
    }
    
    const errorTypes = {};
    let totalErrors = 0;
    
    wordDetails.forEach(word => {
      if (word.errorType && word.errorType !== 'None') {
        errorTypes[word.errorType] = (errorTypes[word.errorType] || 0) + 1;
        totalErrors++;
      }
    });
    
    const errorRate = totalErrors / wordDetails.length;
    let primaryErrorType = 'none';
    
    if (totalErrors > 0) {
      primaryErrorType = Object.keys(errorTypes).reduce((a, b) => 
        errorTypes[a] > errorTypes[b] ? a : b
      );
    }
    
    return {
      totalErrors,
      errorTypes,
      errorRate: Math.round(errorRate * 100) / 100,
      primaryErrorType,
      severity: errorRate > 0.3 ? 'high' : errorRate > 0.15 ? 'moderate' : errorRate > 0.05 ? 'low' : 'minimal'
    };
  }

  /**
   * Assess pronunciation difficulty from Azure result
   */
  assessDifficultyFromAzure(wordDetails, transcribedText) {
    if (wordDetails.length === 0) {
      return { overall: 'unknown', difficultWordCount: 0, difficultWordRatio: 0 };
    }
    
    // Identify difficult words based on Azure scores
    const difficultWords = wordDetails.filter(word => 
      word.pronunciationScore < 60 || 
      word.errorType === 'Mispronunciation'
    ).length;
    
    const difficultWordRatio = difficultWords / wordDetails.length;
    const avgWordScore = wordDetails.reduce((sum, word) => sum + word.pronunciationScore, 0) / wordDetails.length;
    
    let overallDifficulty = 'easy';
    if (difficultWordRatio > 0.4 || avgWordScore < 50) {
      overallDifficulty = 'challenging';
    } else if (difficultWordRatio > 0.25 || avgWordScore < 65) {
      overallDifficulty = 'moderate';
    } else if (difficultWordRatio > 0.15 || avgWordScore < 75) {
      overallDifficulty = 'intermediate';
    }
    
    return {
      overall: overallDifficulty,
      difficultWordCount: difficultWords,
      difficultWordRatio: Math.round(difficultWordRatio * 100) / 100,
      avgWordScore: Math.round(avgWordScore),
      totalWords: wordDetails.length
    };
  }

  /**
   * Check if Azure Speech Service is properly configured
   */
  isConfigured() {
    return !!(this.apiKey && this.endpoint);
  }

  /**
   * Get Azure Speech Service status
   */
  getServiceStatus() {
    return {
      configured: this.isConfigured(),
      endpoint: this.endpoint,
      region: this.region,
      hasApiKey: !!this.apiKey
    };
  }
}

module.exports = new AzureSpeechService();