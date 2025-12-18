const { ANSWER_TYPES, SCORING_METHODS } = require('./constants');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (10-15 digits)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

/**
 * Validate attempt type and selected skill
 */
const isValidAttemptType = (attemptType, selectedSkillId) => {
  if (attemptType === 'full_exam') {
    return selectedSkillId === null || selectedSkillId === undefined;
  } else if (attemptType === 'single_skill') {
    return selectedSkillId !== null && selectedSkillId !== undefined;
  }
  return false;
};

/**
 * Validate answer based on answer type
 */
const isValidAnswer = (answer) => {
  const { answer_type, selected_option_id, answer_json, text_answer, audio_url } = answer;

  switch (answer_type) {
    case 'mcq':
    case ANSWER_TYPES.OPTION:
      return selected_option_id !== null && selected_option_id !== undefined;

    case 'text':
    case ANSWER_TYPES.TEXT:
      return text_answer !== null && text_answer !== undefined && text_answer.trim().length > 0;

    case 'audio':
    case ANSWER_TYPES.AUDIO:
      return audio_url !== null && audio_url !== undefined && audio_url.trim().length > 0;

    case 'json':
    case ANSWER_TYPES.JSON:
      try {
        if (answer_json === null || answer_json === undefined) {
          return false;
        }
        const parsed = typeof answer_json === 'string' ? JSON.parse(answer_json) : answer_json;
        return parsed !== null && typeof parsed === 'object';
      } catch (e) {
        return false;
      }

    default:
      return false;
  }
};

/**
 * Validate JSON string
 */
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validate scoring method for question type
 */
const isValidScoringMethod = (scoringMethod) => {
  return Object.values(SCORING_METHODS).includes(scoringMethod);
};

/**
 * Validate score range
 */
const isValidScore = (score, maxScore) => {
  return (
    typeof score === 'number' && typeof maxScore === 'number' && score >= 0 && score <= maxScore
  );
};

/**
 * Validate file type
 */
const isValidFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

/**
 * Validate audio file
 */
const isValidAudioFile = (mimetype) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
  return allowedTypes.includes(mimetype);
};

/**
 * Validate image file
 */
const isValidImageFile = (mimetype) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(mimetype);
};

/**
 * Validate positive integer
 */
const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

/**
 * Validate date range
 */
const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return start < end;
};

/**
 * Validate pagination parameters
 */
const isValidPagination = (page, limit) => {
  return isPositiveInteger(page) && isPositiveInteger(limit) && limit <= 100;
};

/**
 * Validate word count for text answer
 */
const isValidWordCount = (text, minWords, maxWords) => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;

  if (minWords && wordCount < minWords) {
    return false;
  }
  if (maxWords && wordCount > maxWords) {
    return false;
  }

  return true;
};

/**
 * Validate audio duration
 */
const isValidAudioDuration = (durationSeconds, minDuration, maxDuration) => {
  if (minDuration && durationSeconds < minDuration) {
    return false;
  }
  if (maxDuration && durationSeconds > maxDuration) {
    return false;
  }

  return true;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidAttemptType,
  isValidAnswer,
  isValidJSON,
  isValidScoringMethod,
  isValidScore,
  isValidFileType,
  isValidAudioFile,
  isValidImageFile,
  isPositiveInteger,
  isValidDateRange,
  isValidPagination,
  isValidWordCount,
  isValidAudioDuration,
};
