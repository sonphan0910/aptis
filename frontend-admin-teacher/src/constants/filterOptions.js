/**
 * Frontend constants for filter options
 * These constants serve as fallback when API is unavailable
 * In production, these should be fetched from /public/aptis-types, /public/skill-types, /public/question-types
 */

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Question status
export const QUESTION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

/**
 * FALLBACK APTIS Types (from database seed)
 * Source: GET /public/aptis-types
 * Used as fallback when API is unavailable
 */
export const DEFAULT_APTIS_TYPES = [
  { value: 1, label: 'APTIS General', code: 'aptis_general' },
  { value: 2, label: 'APTIS Advanced', code: 'aptis_advanced' },
  { value: 3, label: 'APTIS for Teachers', code: 'aptis_for_teachers' },
  { value: 4, label: 'APTIS for Teens', code: 'aptis_for_teens' },
];

/**
 * FALLBACK Skill Types (from database seed)
 * Source: GET /public/skill-types
 * Used as fallback when API is unavailable
 */
export const DEFAULT_SKILLS = [
  { value: 1, label: 'Grammar & Vocabulary', code: 'grammar_vocabulary' },
  { value: 2, label: 'Reading', code: 'reading' },
  { value: 3, label: 'Writing', code: 'writing' },
  { value: 4, label: 'Listening', code: 'listening' },
  { value: 5, label: 'Speaking', code: 'speaking' },
];

/**
 * FALLBACK Question Types (from database seed)
 * Source: GET /public/question-types
 * Used as fallback when API is unavailable
 * 
 * Writing question types:
 * - value: 13, label: 'Short Sentence', code: 'short_sentence'
 * - value: 14, label: 'Email Writing', code: 'email_writing'
 * - value: 15, label: 'Opinion Essay', code: 'opinion_essay'
 * - value: 16, label: 'Situation Response', code: 'situation_response'
 * 
 * Speaking question types:
 * - value: 17, label: 'Personal Question', code: 'personal_question'
 * - value: 18, label: 'Describe Image', code: 'describe_image'
 * - value: 19, label: 'Express Opinion', code: 'express_opinion'
 * - value: 20, label: 'Compare & Analyze', code: 'compare_analyze'
 */
export const DEFAULT_QUESTION_TYPES = [
  // Grammar & Vocabulary
  { value: 1, label: 'Multiple Choice', code: 'mcq_grammar', skillId: 1 },
  { value: 2, label: 'Fill in the Blanks', code: 'fill_blanks', skillId: 1 },
  { value: 3, label: 'Sentence Transformation', code: 'sentence_transform', skillId: 1 },
  { value: 4, label: 'Word Matching', code: 'word_matching', skillId: 1 },
  
  // Reading
  { value: 5, label: 'Matching Headings', code: 'matching_headings', skillId: 2 },
  { value: 6, label: 'Multiple Choice', code: 'multiple_choice_reading', skillId: 2 },
  { value: 7, label: 'Gap Filling', code: 'gap_filling_reading', skillId: 2 },
  { value: 8, label: 'Ordering Paragraphs', code: 'ordering_paragraphs', skillId: 2 },
  
  // Listening
  { value: 9, label: 'Conversation - Multiple Choice', code: 'conversation_mcq', skillId: 4 },
  { value: 10, label: 'Note Completion', code: 'listening_note_completion', skillId: 4 },
  { value: 11, label: 'Matching Information', code: 'matching_info_listening', skillId: 4 },
  { value: 12, label: 'Long Monologue', code: 'long_monologue', skillId: 4 },
  
  // Writing
  { value: 13, label: 'Short Sentence', code: 'short_sentence', skillId: 3 },
  { value: 14, label: 'Email Writing', code: 'email_writing', skillId: 3 },
  { value: 15, label: 'Opinion Essay', code: 'opinion_essay', skillId: 3 },
  { value: 16, label: 'Situation Response', code: 'situation_response', skillId: 3 },
  
  // Speaking
  { value: 17, label: 'Personal Question', code: 'personal_question', skillId: 5 },
  { value: 18, label: 'Describe Image', code: 'describe_image', skillId: 5 },
  { value: 19, label: 'Express Opinion', code: 'express_opinion', skillId: 5 },
  { value: 20, label: 'Compare & Analyze', code: 'compare_analyze', skillId: 5 },
];

// Default filter options with Vietnamese labels
export const DEFAULT_FILTER_OPTIONS = {
  aptisTypes: DEFAULT_APTIS_TYPES,
  skills: DEFAULT_SKILLS,
  questionTypes: DEFAULT_QUESTION_TYPES,
  difficulties: [
    { value: DIFFICULTY_LEVELS.EASY, label: 'Dễ' },
    { value: DIFFICULTY_LEVELS.MEDIUM, label: 'Trung bình' },
    { value: DIFFICULTY_LEVELS.HARD, label: 'Khó' }
  ],
  statuses: [
    { value: QUESTION_STATUS.DRAFT, label: 'Bản nháp' },
    { value: QUESTION_STATUS.ACTIVE, label: 'Hoạt động' },
    { value: QUESTION_STATUS.INACTIVE, label: 'Không hoạt động' }
  ],
};

// Helper function to get difficulty label
export const getDifficultyLabel = (difficulty) => {
  const labels = {
    [DIFFICULTY_LEVELS.EASY]: 'Dễ',
    [DIFFICULTY_LEVELS.MEDIUM]: 'Trung bình',
    [DIFFICULTY_LEVELS.HARD]: 'Khó'
  };
  return labels[difficulty] || difficulty;
};

// Helper function to get status label
export const getStatusLabel = (status) => {
  const labels = {
    [QUESTION_STATUS.DRAFT]: 'Bản nháp',
    [QUESTION_STATUS.ACTIVE]: 'Hoạt động',
    [QUESTION_STATUS.INACTIVE]: 'Không hoạt động'
  };
  return labels[status] || status;
};

// Helper to get difficulty color
export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return 'success';
    case DIFFICULTY_LEVELS.MEDIUM:
      return 'warning';
    case DIFFICULTY_LEVELS.HARD:
      return 'error';
    default:
      return 'default';
  }
};

// Helper to get status color
export const getStatusColor = (status) => {
  switch (status) {
    case QUESTION_STATUS.ACTIVE:
      return 'success';
    case QUESTION_STATUS.DRAFT:
      return 'warning';
    case QUESTION_STATUS.INACTIVE:
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Utility function to transform API data to filter options format
 * Converts array of objects with {id, code, name} to {value, label, code}
 */
export const transformApiDataToFilterOptions = (apiData, labelField = 'aptis_type_name') => {
  if (!Array.isArray(apiData)) return [];
  return apiData.map(item => ({
    value: item.id,
    label: item[labelField] || item.code,
    code: item.code
  }));
};

