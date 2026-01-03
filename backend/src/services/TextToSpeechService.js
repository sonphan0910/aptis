const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Google Cloud Text-to-Speech Service
 * 
 * Requires:
 * - GOOGLE_CLOUD_PROJECT_ID env variable
 * - GOOGLE_CLOUD_TTS_API_KEY env variable (or use Application Default Credentials)
 */
class TextToSpeechService {
  constructor() {
    this.apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    this.baseUrl = 'https://texttospeech.googleapis.com/v1';
    this.audioCache = {}; // Cache để tránh generate lại
  }

  /**
   * Generate audio URL từ text bằng Google TTS
   * @param {string} text - Text cần convert sang audio
   * @param {string} languageCode - Language code (en-US, vi-VN, etc.)
   * @param {string} voiceName - Voice name (en-US-Neural2-C, vi-VN-Neural2-A, etc.)
   * @returns {Promise<string>} Audio content URL hoặc base64 data
   */
  async generateAudio(text, languageCode = 'en-US', voiceName = 'en-US-Neural2-C') {
    try {
      // Check cache
      const cacheKey = `${text}_${languageCode}_${voiceName}`;
      if (this.audioCache[cacheKey]) {
        console.log(`[TTS] Using cached audio for: ${text.substring(0, 50)}...`);
        return this.audioCache[cacheKey];
      }

      if (!this.apiKey) {
        console.warn('[TTS] GOOGLE_CLOUD_TTS_API_KEY not set. Using mock audio URL.');
        return this.getMockAudioUrl(text);
      }

      const response = await axios.post(
        `${this.baseUrl}/text:synthesize?key=${this.apiKey}`,
        {
          input: { text },
          voice: { 
            languageCode,
            name: voiceName 
          },
          audioConfig: { 
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 1.0
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data.audioContent) {
        // Convert to data URL
        const audioDataUrl = `data:audio/mp3;base64,${response.data.audioContent}`;
        
        // Cache it
        this.audioCache[cacheKey] = audioDataUrl;
        
        console.log(`[TTS] Generated audio for: ${text.substring(0, 50)}...`);
        return audioDataUrl;
      }

      throw new Error('No audio content in response');
    } catch (error) {
      console.error('[TTS] Error generating audio:', error.message);
      // Fallback to mock
      return this.getMockAudioUrl(text);
    }
  }

  /**
   * Generate audio URLs cho multiple texts
   */
  async generateMultipleAudios(texts, languageCode = 'en-US', voiceName = 'en-US-Neural2-C') {
    console.log(`[TTS] Generating ${texts.length} audio files...`);
    
    const results = [];
    for (let i = 0; i < texts.length; i++) {
      const audioUrl = await this.generateAudio(texts[i], languageCode, voiceName);
      results.push(audioUrl);
      
      // Delay to avoid rate limiting
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Mock audio URL - dùng khi không có API key
   */
  getMockAudioUrl(text) {
    // Tạo một mock URL có thể stream từ web
    // Trong production, có thể dùng librosa hoặc các tool khác
    const encoded = encodeURIComponent(text);
    return `https://api.voicerss.org/?key=testing&hl=en-us&src=${encoded}&f=16khz_16bit_mono&ssml=false`;
  }

  /**
   * Danh sách voice available
   */
  getAvailableVoices() {
    return {
      // English
      'en-US': [
        'en-US-Neural2-A', // Male
        'en-US-Neural2-C', // Female
        'en-US-Neural2-D', // Male
        'en-US-Neural2-E', // Female
      ],
      'en-GB': [
        'en-GB-Neural2-A', // Female
        'en-GB-Neural2-B', // Male
        'en-GB-Neural2-C', // Female
        'en-GB-Neural2-D', // Male
      ],
      // Vietnamese
      'vi-VN': [
        'vi-VN-Neural2-A', // Female
        'vi-VN-Neural2-B', // Male
      ],
    };
  }
}

module.exports = new TextToSpeechService();
