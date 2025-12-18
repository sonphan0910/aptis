const { getGroqModel, GROQ_CONFIG } = require('../config/ai');
const {
  AttemptAnswer,
  AiScoringCriteria,
  AnswerAiFeedback,
  Question,
  QuestionSampleAnswer,
} = require('../models');
const { AI_SCORING_CONFIG } = require('../utils/constants');
const { delay } = require('../utils/helpers');
const { BadRequestError } = require('../utils/errors');

/**
 * AiScoringService - Handles AI-powered scoring for Writing and Speaking
 */
class AiScoringService {
  /**
   * Score writing answer using AI
   */
  async scoreWriting(answerId) {
    console.log(`[scoreWriting] Starting to score Writing answer ${answerId}`);

    const answer = await AttemptAnswer.findByPk(answerId, {
      include: [
        {
          model: Question,
          as: 'question',
          include: [
            {
              model: QuestionSampleAnswer,
              as: 'sampleAnswer',
            },
          ],
        },
      ],
    });

    if (!answer) {
      throw new BadRequestError('Answer not found');
    }

    if (!answer.text_answer) {
      throw new BadRequestError('No text answer provided');
    }

    console.log(`[scoreWriting] Answer ID ${answerId}: Text length = ${answer.text_answer.length} chars`);

    // Get AI scoring criteria for this question type
    const criteria = await AiScoringCriteria.findAll({
      where: {
        aptis_type_id: answer.question.aptis_type_id,
        question_type_id: answer.question.question_type_id,
      },
    });

    if (!criteria || criteria.length === 0) {
      throw new BadRequestError('No AI scoring criteria found for this question type');
    }

    console.log(
      `[scoreWriting] Found ${criteria.length} criteria for APTIS type ${answer.question.aptis_type_id}, question type ${answer.question.question_type_id}`
    );

    // Build prompt and score
    const result = await this.scoreWithCriteria(answer.text_answer, answer.question, criteria);

    // Save AI feedback for each criterion
    await this.createAnswerAiFeedbacks(answerId, result.criteriaScores);

    // Update answer with AI score and feedback
    await answer.update({
      score: result.totalScore,
      ai_feedback: result.overallFeedback,
      ai_graded_at: new Date(),
    });

    console.log(
      `[scoreWriting] Answer ${answerId} scored successfully: ${result.totalScore}/${result.totalMaxScore}`
    );

    return result;
  }

  /**
   * Score speaking answer using AI (from transcribed text)
   */
  async scoreSpeaking(answerId) {
    console.log(`[scoreSpeaking] Starting to score Speaking answer ${answerId}`);

    const answer = await AttemptAnswer.findByPk(answerId, {
      include: [
        {
          model: Question,
          as: 'question',
          include: [
            {
              model: QuestionSampleAnswer,
              as: 'sampleAnswer',
            },
          ],
        },
      ],
    });

    if (!answer) {
      throw new BadRequestError('Answer not found');
    }

    // If no transcription yet, do it first
    if (!answer.transcribed_text && answer.audio_url) {
      console.log(`[scoreSpeaking] Transcribing audio first for answer ${answerId}`);
      const SpeechToTextService = require('./SpeechToTextService');
      
      // Convert relative URL to absolute path
      const audioPath = answer.audio_url.startsWith('/uploads') 
        ? path.join(require('../config/storage').STORAGE_CONFIG.basePath, answer.audio_url.replace('/uploads', ''))
        : answer.audio_url;
      
      const transcription = await SpeechToTextService.convertAudioToText(audioPath, 'vi');
      
      // Update answer with transcription
      await answer.update({ transcribed_text: transcription });
      answer.transcribed_text = transcription; // Update local object
      
      console.log(`[scoreSpeaking] Transcription complete: ${transcription.substring(0, 100)}...`);
    }

    if (!answer.transcribed_text || answer.transcribed_text.trim() === '') {
      throw new BadRequestError('Transcription failed or is empty');
    }

    console.log(
      `[scoreSpeaking] Answer ID ${answerId}: Transcribed text length = ${answer.transcribed_text.length} chars`
    );

    // Get AI scoring criteria
    const criteria = await AiScoringCriteria.findAll({
      where: {
        aptis_type_id: answer.question.aptis_type_id,
        question_type_id: answer.question.question_type_id,
      },
    });

    if (!criteria || criteria.length === 0) {
      throw new BadRequestError('No AI scoring criteria found for this question type');
    }

    console.log(
      `[scoreSpeaking] Found ${criteria.length} criteria for APTIS type ${answer.question.aptis_type_id}, question type ${answer.question.question_type_id}`
    );

    // Score transcribed text
    const result = await this.scoreWithCriteria(answer.transcribed_text, answer.question, criteria);

    // Save AI feedback
    await this.createAnswerAiFeedbacks(answerId, result.criteriaScores);

    // Update answer
    await answer.update({
      score: result.totalScore,
      ai_feedback: result.overallFeedback,
      ai_graded_at: new Date(),
    });

    console.log(
      `[scoreSpeaking] Answer ${answerId} scored successfully: ${result.totalScore}/${result.totalMaxScore}`
    );

    return result;
  }

  /**
   * Score answer against multiple criteria
   */
  async scoreWithCriteria(answerText, question, criteria) {
    if (!criteria || criteria.length === 0) {
      throw new BadRequestError('No scoring criteria provided');
    }

    const criteriaScores = [];
    let totalScore = 0;
    let totalMaxScore = 0;

    console.log(`[scoreWithCriteria] Scoring answer with ${criteria.length} criteria`);

    // Score each criterion
    for (let i = 0; i < criteria.length; i++) {
      const criterion = criteria[i];
      try {
        const prompt = this.buildScoringPrompt(answerText, question, criterion);
        const aiResponse = await this.callAiWithRetry(prompt);
        const parsed = this.parseAiResponse(aiResponse, criterion.max_score);

        // Validate score is within bounds
        if (parsed.score < 0 || parsed.score > criterion.max_score) {
          console.warn(
            `[scoreWithCriteria] Score ${parsed.score} out of bounds [0, ${criterion.max_score}], clamping`
          );
          parsed.score = Math.max(0, Math.min(parsed.score, criterion.max_score));
        }

        const criteriaScore = {
          criteria_id: criterion.id,
          criteria_name: criterion.criteria_name,
          score: parsed.score,
          max_score: criterion.max_score,
          weight: criterion.weight,
          comment: parsed.comment,
          suggestions: parsed.suggestions,
          strengths: parsed.strengths,
          weaknesses: parsed.weaknesses,
        };

        criteriaScores.push(criteriaScore);

        // Apply weight (weight is already a decimal 0-1)
        totalScore += parsed.score * criterion.weight;
        totalMaxScore += criterion.max_score * criterion.weight;

        console.log(
          `[scoreWithCriteria] Criterion ${i + 1}/${criteria.length} "${criterion.criteria_name}": ${parsed.score}/${criterion.max_score}`
        );
      } catch (error) {
        console.error(
          `[scoreWithCriteria] Error scoring criterion "${criterion.criteria_name}":`,
          error.message
        );
        throw error;
      }
    }

    // Generate overall feedback
    const overallFeedback = this.generateOverallFeedback(criteriaScores);

    const result = {
      totalScore: Math.round(totalScore * 100) / 100,
      totalMaxScore: Math.round(totalMaxScore * 100) / 100,
      criteriaScores,
      overallFeedback,
    };

    console.log(`[scoreWithCriteria] Final score: ${result.totalScore}/${result.totalMaxScore}`);

    return result;
  }

  /**
   * Build scoring prompt for AI
   */
  buildScoringPrompt(answerText, question, criterion) {
    const sampleAnswer = question.sampleAnswer?.sample_answer || 'N/A';
    const keyPoints = question.sampleAnswer?.answer_key_points
      ? JSON.parse(question.sampleAnswer.answer_key_points).join(', ')
      : 'N/A';

    return `
You are an expert APTIS English language examiner. Your task is to score a student's answer based on a specific criterion.

CONTEXT:
=========
Question Type: APTIS Writing/Speaking Assessment
Question: ${question.content}

Sample Answer: ${sampleAnswer}

Key Points Expected: ${keyPoints}

STUDENT'S ANSWER:
=================
${answerText}

SCORING CRITERION:
==================
Criterion Name: ${criterion.criteria_name}
Description: ${criterion.description || 'N/A'}
Maximum Score: ${criterion.max_score} points
Weight: ${(criterion.weight * 100).toFixed(0)}%

RUBRIC FOR SCORING:
====================
${criterion.rubric_prompt}

SCORING INSTRUCTIONS:
=====================
1. Carefully evaluate the student's answer ONLY based on the criterion above.
2. Award a score from 0 to ${criterion.max_score} (decimals allowed, e.g., 3.5).
3. Provide honest, constructive feedback.
4. Be consistent with APTIS standards.

RESPONSE FORMAT - MUST BE VALID JSON:
====================================
Return EXACTLY this JSON format. ALL text fields MUST be strings with escaped newlines:
- Use literal \\n for line breaks (not actual newlines)
- Each bullet point should be on a separate line in the string
- Use proper JSON escaping for special characters

{
  "score": 8.5,
  "comment": "Brief explanation of score (1-2 sentences)",
  "strengths": "• Strength 1\\n• Strength 2\\n• Strength 3",
  "weaknesses": "• Weakness 1\\n• Weakness 2",
  "suggestions": "• Suggestion 1\\n• Suggestion 2\\n• Suggestion 3"
}

CRITICAL REQUIREMENTS:
======================
- score MUST be a number (e.g., 7.5, not "7.5")
- All text fields MUST be valid JSON strings with proper escaping
- Use \\n (escaped) to separate bullet points, NOT actual newlines
- Ensure valid JSON that can be parsed by JSON.parse()
- Return ONLY the JSON object, no markdown, no code blocks, no extra text

Example of correct format:
{
  "score": 8,
  "comment": "Good work with clear structure.",
  "strengths": "• Clear ideas\\n• Good grammar",
  "weaknesses": "• Could add more examples",
  "suggestions": "• Try using advanced structures\\n• Add specific examples"
}
`.trim();
  }

  /**
   * Call Groq AI with retry logic
   */
  async callAiWithRetry(prompt, maxRetries = AI_SCORING_CONFIG.MAX_RETRIES) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[callAiWithRetry] Attempt ${attempt}/${maxRetries} - Calling Groq API`);

        const groqClient = getGroqModel();
        const result = await groqClient.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: GROQ_CONFIG.model,
          temperature: GROQ_CONFIG.temperature,
          max_tokens: GROQ_CONFIG.max_tokens,
        });

        // Extract text from Groq response
        const response = result.choices[0]?.message?.content || '';

        if (!response || response.length === 0) {
          throw new Error('Empty response from Groq API');
        }

        console.log(
          `[callAiWithRetry] Success - Response length: ${response.length} chars`
        );

        return response;
      } catch (error) {
        lastError = error;
        console.error(
          `[callAiWithRetry] Attempt ${attempt} failed:`,
          error.message
        );

        if (attempt < maxRetries) {
          const delayMs = AI_SCORING_CONFIG.RETRY_DELAY * attempt;
          console.log(`[callAiWithRetry] Retrying in ${delayMs}ms...`);
          await delay(delayMs);
        }
      }
    }

    throw new Error(
      `AI scoring failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Parse AI response - handle both valid JSON and escaped newlines
   */
  parseAiResponse(responseText, maxScore) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = responseText.trim();

      // Remove markdown code blocks if present
      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      // Try to extract JSON object if wrapped in text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      // First attempt: parse as-is (strict JSON)
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e1) {
        // Second attempt: clean up unescaped newlines
        console.warn('[parseAiResponse] Strict JSON failed, attempting cleanup:', e1.message);
        
        // Replace actual newlines with escaped newlines in string values
        jsonText = jsonText.replace(/\n/g, '\\n');
        // Remove any double backslashes that might have been created
        jsonText = jsonText.replace(/\\\\\n/g, '\\n');
        
        try {
          parsed = JSON.parse(jsonText);
        } catch (e2) {
          console.error('[parseAiResponse] Cleanup attempt also failed:', e2.message);
          throw e2;
        }
      }

      // Validate required fields
      if (typeof parsed.score === 'undefined') {
        throw new Error('Missing score field in response');
      }

      // Ensure score is within bounds
      let score = parseFloat(parsed.score);
      if (isNaN(score)) {
        throw new Error(`Invalid score value: ${parsed.score}`);
      }
      score = Math.max(0, Math.min(score, maxScore));

      // Convert array/object fields to strings, handle escaped newlines
      const convertToString = (value, defaultValue = '') => {
        if (typeof value === 'string') {
          // Handle escaped newlines - convert \n string to actual newlines for display
          return value.trim() || defaultValue;
        }
        if (Array.isArray(value)) {
          // Join array items with newline and bullet points
          return value.map(item => `• ${String(item).trim()}`).join('\n') || defaultValue;
        }
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value, null, 2);
        }
        return String(value || defaultValue);
      };

      const result = {
        score: Math.round(score * 100) / 100,
        comment: convertToString(parsed.comment, 'No comment provided'),
        strengths: convertToString(parsed.strengths, 'None identified'),
        weaknesses: convertToString(parsed.weaknesses, 'None identified'),
        suggestions: convertToString(parsed.suggestions, 'No suggestions'),
      };

      console.log('[parseAiResponse] Successfully parsed response');

      return result;
    } catch (error) {
      console.error('[parseAiResponse] JSON parsing error:', error.message);
      console.error('[parseAiResponse] Response text (first 300 chars):', responseText.substring(0, 300));

      // Fallback: try to extract score using regex
      const scoreMatch = responseText.match(/"score"\s*:\s*(\d+\.?\d*)/);
      const score = scoreMatch ? Math.min(parseFloat(scoreMatch[1]), maxScore) : 0;

      console.warn(`[parseAiResponse] Using fallback score: ${score}`);

      return {
        score: Math.round(score * 100) / 100,
        comment: 'Feedback formatting issue - please check raw feedback',
        strengths: 'N/A',
        weaknesses: 'N/A',
        suggestions: 'N/A',
      };
    }
  }

  /**
   * Create answer AI feedback records
   */
  async createAnswerAiFeedbacks(answerId, criteriaScores) {
    if (!criteriaScores || criteriaScores.length === 0) {
      console.warn(`[createAnswerAiFeedbacks] No criteria scores to save for answer ${answerId}`);
      return;
    }

    console.log(
      `[createAnswerAiFeedbacks] Creating ${criteriaScores.length} feedback records for answer ${answerId}`
    );

    for (const cs of criteriaScores) {
      // Validate data
      if (!cs.criteria_id || !cs.score || !cs.max_score) {
        console.error('[createAnswerAiFeedbacks] Invalid criteria score:', cs);
        continue;
      }

      try {
        const feedback = await AnswerAiFeedback.create({
          answer_id: answerId,
          criteria_id: cs.criteria_id,
          score: cs.score,
          max_score: cs.max_score,
          comment: cs.comment || '',
          suggestions: cs.suggestions || '',
          strengths: cs.strengths || '',
          weaknesses: cs.weaknesses || '',
        });

        console.log(
          `[createAnswerAiFeedbacks] Saved feedback for criteria ${cs.criteria_id}: score ${cs.score}/${cs.max_score}`
        );
      } catch (error) {
        console.error(
          `[createAnswerAiFeedbacks] Error creating feedback for criteria ${cs.criteria_id}:`,
          error.message
        );
        throw error;
      }
    }
  }

  /**
   * Generate overall feedback summary
   */
  generateOverallFeedback(criteriaScores) {
    if (!criteriaScores || criteriaScores.length === 0) {
      return 'Overall Performance: No feedback available';
    }

    // Calculate percentage based on weighted scores
    let totalWeightedScore = 0;
    let totalWeightedMax = 0;

    criteriaScores.forEach((cs) => {
      if (cs.weight) {
        totalWeightedScore += cs.score * cs.weight;
        totalWeightedMax += cs.max_score * cs.weight;
      }
    });

    const avgPercentage =
      totalWeightedMax > 0 ? (totalWeightedScore / totalWeightedMax) * 100 : 0;

    let level = 'Needs Improvement';
    let description = 'The answer needs significant improvement in multiple areas';

    if (avgPercentage >= 90) {
      level = 'Excellent';
      description = 'Exceptional performance across all criteria';
    } else if (avgPercentage >= 80) {
      level = 'Very Good';
      description = 'Strong performance with minor areas for improvement';
    } else if (avgPercentage >= 70) {
      level = 'Good';
      description = 'Solid performance with some areas to develop';
    } else if (avgPercentage >= 60) {
      level = 'Satisfactory';
      description = 'Acceptable but needs improvement in several areas';
    } else if (avgPercentage >= 50) {
      level = 'Weak';
      description = 'Below satisfactory; significant improvements needed';
    }

    return `Overall Performance: ${level} (${Math.round(avgPercentage)}%). ${description}.`;
  }
}

module.exports = new AiScoringService();
