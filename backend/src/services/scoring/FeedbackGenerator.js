/**
 * Feedback Generator Service
 * Handles generation of overall feedback with and without audio analysis
 */

class FeedbackGenerator {
  /**
   * Generate enhanced overall feedback incorporating audio analysis
   */
  generateEnhancedOverallFeedback(criteriaScores, audioAnalysis) {
    const baseFeedback = this.generateOverallFeedback(criteriaScores);
    
    if (!audioAnalysis) return baseFeedback;

    // Calculate objective performance summary
    const avgObjectiveScore = (
      (audioAnalysis.pronunciationScore || 0) +
      (audioAnalysis.fluencyScore || 0) +
      (audioAnalysis.accuracyScore || 0) +
      (audioAnalysis.prosodyScore || 0)
    ) / 4;

    let technicalSummary = '';
    if (avgObjectiveScore >= 80) {
      technicalSummary = ' Technical analysis shows strong overall audio quality.';
    } else if (avgObjectiveScore >= 60) {
      technicalSummary = ' Technical analysis indicates good audio performance with some areas for improvement.';
    } else {
      technicalSummary = ' Technical analysis suggests significant opportunities for improvement in speech delivery.';
    }

    // Add specific recommendations based on weakest areas
    const metrics = [
      { name: 'pronunciation', score: audioAnalysis.pronunciationScore },
      { name: 'fluency', score: audioAnalysis.fluencyScore },
      { name: 'accuracy', score: audioAnalysis.accuracyScore },
      { name: 'prosody', score: audioAnalysis.prosodyScore }
    ].filter(m => m.score).sort((a, b) => a.score - b.score);

    let recommendations = '';
    if (metrics.length > 0 && metrics[0].score < 70) {
      recommendations = ` Focus particularly on improving ${metrics[0].name} skills.`;
    }

    return `${baseFeedback}${technicalSummary}${recommendations}`;
  }

  /**
   * Generate overall feedback from criteria scores
   */
  generateOverallFeedback(criteriaScores) {
    if (!criteriaScores || criteriaScores.length === 0) {
      return 'No scoring data available for feedback generation.';
    }

    // For backward compatibility - now that we have single feedback, 
    // this method is simplified to work with individual scores
    let totalScore = 0;
    let totalMaxScore = 0;

    criteriaScores.forEach((cs) => {
      totalScore += cs.score;
      totalMaxScore += cs.maxScore;
    });

    const avgPercentage =
      totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    let level = 'Needs Improvement';
    let description = 'The answer needs significant improvement in multiple areas';

    if (avgPercentage >= 90) {
      level = 'Excellent';
      description = 'Outstanding performance demonstrating mastery of the required skills';
    } else if (avgPercentage >= 80) {
      level = 'Very Good';
      description = 'Strong performance with only minor areas for improvement';
    } else if (avgPercentage >= 70) {
      level = 'Good';
      description = 'Solid performance meeting most requirements effectively';
    } else if (avgPercentage >= 60) {
      level = 'Satisfactory';
      description = 'Acceptable performance but with room for notable improvement';
    } else if (avgPercentage >= 50) {
      level = 'Below Average';
      description = 'Performance below expected standards requiring focused improvement';
    }

    return `Overall Performance: ${level} (${Math.round(avgPercentage)}%). ${description}.`;
  }

  /**
   * Generate criterion-specific feedback based on score and audio analysis
   */
  generateCriterionFeedback(criterionName, score, maxScore, audioAnalysis = null) {
    const percentage = (score / maxScore) * 100;
    let feedback = '';

    // Base feedback
    if (percentage >= 90) {
      feedback = `Excellent ${criterionName.toLowerCase()} performance.`;
    } else if (percentage >= 80) {
      feedback = `Very good ${criterionName.toLowerCase()} with minor areas for refinement.`;
    } else if (percentage >= 70) {
      feedback = `Good ${criterionName.toLowerCase()} meeting most requirements.`;
    } else if (percentage >= 60) {
      feedback = `Satisfactory ${criterionName.toLowerCase()} with room for improvement.`;
    } else {
      feedback = `${criterionName} needs significant improvement.`;
    }

    // Add audio-specific insights if available
    if (audioAnalysis) {
      const audioInsights = this.getAudioSpecificInsights(criterionName, audioAnalysis);
      if (audioInsights) {
        feedback += ` ${audioInsights}`;
      }
    }

    return feedback;
  }

  /**
   * Get audio-specific insights for criterion feedback
   */
  getAudioSpecificInsights(criterionName, audioAnalysis) {
    const criterionLower = criterionName.toLowerCase();
    
    if (criterionLower.includes('pronunciation')) {
      const pronScore = audioAnalysis.pronunciationScore || 0;
      if (pronScore >= 85) return 'Audio analysis confirms clear pronunciation.';
      if (pronScore < 60) return 'Audio analysis suggests pronunciation practice needed.';
    }
    
    if (criterionLower.includes('fluency')) {
      const fluencyScore = audioAnalysis.fluencyScore || 0;
      if (fluencyScore >= 85) return 'Speech flow shows good natural rhythm.';
      if (fluencyScore < 60) return 'Consider working on speech flow and pacing.';
    }
    
    if (criterionLower.includes('accuracy')) {
      const errorRate = audioAnalysis.errorAnalysis?.errorRate || 0;
      if (errorRate < 0.1) return 'Audio shows consistent accuracy.';
      if (errorRate > 0.3) return 'Multiple pronunciation errors detected.';
    }

    return null;
  }

  /**
   * Generate detailed performance summary
   */
  generatePerformanceSummary(criteriaScores, audioAnalysis = null) {
    const summary = {
      overallFeedback: audioAnalysis ? 
        this.generateEnhancedOverallFeedback(criteriaScores, audioAnalysis) :
        this.generateOverallFeedback(criteriaScores),
      criteriaBreakdown: criteriaScores.map(cs => ({
        criterion: cs.criteriaName,
        score: cs.score,
        maxScore: cs.maxScore,
        percentage: Math.round((cs.score / cs.maxScore) * 100),
        feedback: this.generateCriterionFeedback(cs.criteriaName, cs.score, cs.maxScore, audioAnalysis)
      })),
      audioEnhanced: !!audioAnalysis,
      totalScore: criteriaScores.reduce((sum, cs) => sum + cs.score, 0),
      maxPossibleScore: criteriaScores.reduce((sum, cs) => sum + cs.maxScore, 0)
    };

    if (audioAnalysis) {
      summary.audioMetrics = {
        pronunciationScore: audioAnalysis.pronunciationScore,
        fluencyScore: audioAnalysis.fluencyScore,
        accuracyScore: audioAnalysis.accuracyScore,
        confidence: audioAnalysis.confidence,
        emotionalTone: audioAnalysis.emotionalTone
      };
    }

    return summary;
  }
}

module.exports = new FeedbackGenerator();