/**
 * Audio Analysis Enhancement Service
 * Handles audio-based scoring adjustments and enhancements
 */

class AudioAnalysisEnhancer {
  /**
   * Apply audio analysis adjustments to AI-generated scores
   * Uses objective metrics to fine-tune subjective assessments
   */
  applyAudioAnalysisAdjustment(baseScore, criteriaName, audioAnalysis, maxScore) {
    if (!audioAnalysis) return baseScore;

    let adjustment = 0;
    const criteriaNameLower = criteriaName.toLowerCase();

    // Pronunciation criteria adjustments
    if (criteriaNameLower.includes('pronunciation') || criteriaNameLower.includes('phonology')) {
      const pronScore = (audioAnalysis.pronunciationScore || 50) / 100;
      adjustment = (pronScore - 0.5) * 0.3; // ±30% of max score
    }

    // Fluency criteria adjustments
    if (criteriaNameLower.includes('fluency') || criteriaNameLower.includes('flow')) {
      const fluencyScore = (audioAnalysis.fluencyScore || 50) / 100;
      adjustment = (fluencyScore - 0.5) * 0.25; // ±25% of max score
    }

    // Accuracy/Intelligibility criteria adjustments
    if (criteriaNameLower.includes('accuracy') || criteriaNameLower.includes('intelligibility')) {
      const accuracyScore = (audioAnalysis.accuracyScore || 50) / 100;
      const errorSeverity = this.getErrorSeverityFactor(audioAnalysis.errorAnalysis);
      adjustment = (accuracyScore - 0.5) * 0.2 - errorSeverity * 0.1;
    }

    // Prosody/Intonation criteria adjustments
    if (criteriaNameLower.includes('prosody') || criteriaNameLower.includes('intonation') || criteriaNameLower.includes('stress')) {
      const prosodyScore = (audioAnalysis.prosodyScore || 50) / 100;
      const emotionalFactor = this.getEmotionalToneFactor(audioAnalysis.emotionalTone);
      adjustment = (prosodyScore - 0.5) * 0.2 + emotionalFactor * 0.1;
    }

    // Completeness/Range criteria adjustments
    if (criteriaNameLower.includes('range') || criteriaNameLower.includes('completeness') || criteriaNameLower.includes('content')) {
      const completenessScore = (audioAnalysis.completenessScore || 50) / 100;
      const speechRateScore = this.getSpeechRateFactor(audioAnalysis.audioQualityMetrics?.speechRate);
      adjustment = (completenessScore - 0.5) * 0.15 + speechRateScore * 0.1;
    }

    // Apply confidence factor
    const confidenceFactor = (audioAnalysis.confidence || 0.5) - 0.5; // -0.5 to +0.5
    adjustment += confidenceFactor * 0.1;

    // Apply accent strength factor
    if (audioAnalysis.accentAnalysis?.strength === 'strong') {
      adjustment -= 0.05; // Slight penalty for very strong accent
    }

    // Convert adjustment to score points (proportional to max score)
    const scoreAdjustment = adjustment * maxScore;
    const finalAdjustedScore = baseScore + scoreAdjustment;

    console.log(`[applyAudioAnalysisAdjustment] ${criteriaName}: ${baseScore} + ${scoreAdjustment.toFixed(2)} = ${finalAdjustedScore.toFixed(2)}`);

    return finalAdjustedScore;
  }

  /**
   * Get error severity factor from error analysis
   */
  getErrorSeverityFactor(errorAnalysis) {
    if (!errorAnalysis) return 0;
    
    const severityMap = {
      'minimal': 0.0,
      'low': 0.1,
      'moderate': 0.3,
      'high': 0.5
    };
    
    return severityMap[errorAnalysis.severity] || 0.2;
  }

  /**
   * Get emotional tone factor for scoring
   */
  getEmotionalToneFactor(emotionalTone) {
    const toneMap = {
      'confident': 0.15,
      'engaged': 0.10,
      'neutral': 0.0,
      'hesitant': -0.1,
      'nervous': -0.15
    };
    
    return toneMap[emotionalTone] || 0;
  }

  /**
   * Get speech rate factor for scoring
   */
  getSpeechRateFactor(speechRate) {
    if (!speechRate) return 0;
    
    const rateMap = {
      'very_slow': -0.2,
      'slow': -0.1,
      'normal': 0.1,
      'fast': 0.0,
      'very_fast': -0.1
    };
    
    return rateMap[speechRate.rateAssessment] || 0;
  }

  /**
   * Validate if audio analysis contains required metrics
   */
  validateAudioAnalysis(audioAnalysis) {
    if (!audioAnalysis) return false;
    
    const requiredMetrics = [
      'pronunciationScore',
      'accuracyScore', 
      'fluencyScore',
      'confidence'
    ];
    
    return requiredMetrics.every(metric => 
      audioAnalysis[metric] !== undefined && audioAnalysis[metric] !== null
    );
  }

  /**
   * Get comprehensive audio enhancement summary
   */
  getAudioEnhancementSummary(audioAnalysis) {
    if (!audioAnalysis) return 'No audio analysis available';
    
    const summary = [];
    
    // Main metrics summary
    summary.push(`Pronunciation: ${audioAnalysis.pronunciationScore || 'N/A'}/100`);
    summary.push(`Fluency: ${audioAnalysis.fluencyScore || 'N/A'}/100`);
    summary.push(`Accuracy: ${audioAnalysis.accuracyScore || 'N/A'}/100`);
    
    // Quality indicators
    if (audioAnalysis.emotionalTone) {
      summary.push(`Tone: ${audioAnalysis.emotionalTone}`);
    }
    
    if (audioAnalysis.errorAnalysis?.severity) {
      summary.push(`Error Severity: ${audioAnalysis.errorAnalysis.severity}`);
    }
    
    if (audioAnalysis.audioQualityMetrics?.speechRate?.rateAssessment) {
      summary.push(`Speech Rate: ${audioAnalysis.audioQualityMetrics.speechRate.rateAssessment}`);
    }
    
    return summary.join(', ');
  }
}

module.exports = new AudioAnalysisEnhancer();