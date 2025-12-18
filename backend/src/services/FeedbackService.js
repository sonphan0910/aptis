const { AttemptAnswer } = require('../models');

/**
 * FeedbackService - Generates and manages feedback for student answers
 */
class FeedbackService {
  /**
   * Generate writing feedback summary
   */
  generateWritingFeedback(score, maxScore, criteriaFeedbacks) {
    const percentage = (score / maxScore) * 100;
    let level = '';

    if (percentage >= 90) {
      level = 'Excellent';
    } else if (percentage >= 75) {
      level = 'Very Good';
    } else if (percentage >= 60) {
      level = 'Good';
    } else if (percentage >= 50) {
      level = 'Satisfactory';
    } else {
      level = 'Needs Improvement';
    }

    const strengths = criteriaFeedbacks
      .filter((cf) => cf.strengths && cf.strengths !== 'None identified')
      .map((cf) => `**${cf.criteria_name}**: ${cf.strengths}`)
      .join('\n');

    const weaknesses = criteriaFeedbacks
      .filter((cf) => cf.weaknesses && cf.weaknesses !== 'None identified')
      .map((cf) => `**${cf.criteria_name}**: ${cf.weaknesses}`)
      .join('\n');

    const suggestions = criteriaFeedbacks
      .filter((cf) => cf.suggestions && cf.suggestions !== 'No suggestions')
      .map((cf) => `**${cf.criteria_name}**: ${cf.suggestions}`)
      .join('\n');

    return {
      level,
      percentage: Math.round(percentage),
      strengths: strengths || 'Good overall performance',
      weaknesses: weaknesses || 'Keep up the good work',
      suggestions: suggestions || 'Continue practicing',
    };
  }

  /**
   * Generate speaking feedback summary
   */
  generateSpeakingFeedback(score, maxScore, criteriaFeedbacks) {
    // Similar to writing feedback
    return this.generateWritingFeedback(score, maxScore, criteriaFeedbacks);
  }

  /**
   * Generate recommendations based on weak skills
   */
  generateRecommendations(weakSkills) {
    const recommendations = [];

    if (weakSkills.includes('grammar')) {
      recommendations.push('Review English grammar rules and practice with exercises');
      recommendations.push('Focus on verb tenses, subject-verb agreement, and sentence structure');
    }

    if (weakSkills.includes('vocabulary')) {
      recommendations.push('Expand your vocabulary by reading diverse texts');
      recommendations.push('Practice using new words in context');
    }

    if (weakSkills.includes('fluency')) {
      recommendations.push('Practice speaking regularly to improve fluency');
      recommendations.push('Try describing daily activities in English');
    }

    if (weakSkills.includes('pronunciation')) {
      recommendations.push('Listen to native speakers and practice pronunciation');
      recommendations.push('Use speech recognition tools to check your pronunciation');
    }

    if (weakSkills.includes('coherence')) {
      recommendations.push('Work on organizing your thoughts before writing/speaking');
      recommendations.push('Use linking words to connect ideas smoothly');
    }

    if (weakSkills.includes('content')) {
      recommendations.push('Develop ideas more fully with supporting details');
      recommendations.push('Address all parts of the question thoroughly');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue practicing all language skills');
      recommendations.push('Maintain your current level of proficiency');
    }

    return recommendations;
  }

  /**
   * Flag answer for manual review
   */
  async flagForManualReview(answerId, reason) {
    try {
      const answer = await AttemptAnswer.findByPk(answerId);

      if (!answer) {
        throw new Error('Answer not found');
      }

      await answer.update({
        needs_review: true,
        ai_feedback: answer.ai_feedback
          ? `${answer.ai_feedback}\n\n**Flagged for Review**: ${reason}`
          : `**Flagged for Review**: ${reason}`,
      });

      console.log(`🚩 Answer ${answerId} flagged for review: ${reason}`);

      return { success: true, answerId, reason };
    } catch (error) {
      console.error('Failed to flag answer for review:', error);
      throw error;
    }
  }

  /**
   * Get feedback summary for an attempt
   */
  async getAttemptFeedbackSummary(attemptId) {
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
      include: [
        {
          model: require('../models').AnswerAiFeedback,
          as: 'aiFeedbacks',
        },
      ],
    });

    const totalAnswers = answers.length;
    const gradedAnswers = answers.filter((a) => a.score !== null).length;
    const reviewedAnswers = answers.filter((a) => a.reviewed_at !== null).length;
    const needsReview = answers.filter((a) => a.needs_review).length;

    const totalScore = answers.reduce((sum, a) => {
      const score = a.final_score !== null ? a.final_score : a.score || 0;
      return sum + parseFloat(score);
    }, 0);

    const totalMaxScore = answers.reduce((sum, a) => sum + parseFloat(a.max_score), 0);

    return {
      totalAnswers,
      gradedAnswers,
      reviewedAnswers,
      needsReview,
      totalScore: Math.round(totalScore * 100) / 100,
      totalMaxScore: Math.round(totalMaxScore * 100) / 100,
      percentage: Math.round((totalScore / totalMaxScore) * 100),
      isComplete: gradedAnswers === totalAnswers && needsReview === 0,
    };
  }

  /**
   * Identify weak areas from criteria scores
   */
  identifyWeakAreas(criteriaFeedbacks, threshold = 60) {
    const weakAreas = criteriaFeedbacks
      .filter((cf) => (cf.score / cf.max_score) * 100 < threshold)
      .map((cf) => ({
        criteria: cf.criteria_name,
        score: cf.score,
        maxScore: cf.max_score,
        percentage: Math.round((cf.score / cf.max_score) * 100),
      }));

    return weakAreas;
  }
}

module.exports = new FeedbackService();
