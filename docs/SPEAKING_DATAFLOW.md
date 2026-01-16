# Speaking Section - Complete Flow & Verification

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND SEEDING (06-seed-exams.js)                              │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. Create 4 exam_sections with section_order 1,2,3,4            │
│    - All linked to skill_type_id = SPEAKING                     │
│    - Each has different instruction                             │
│    - Duration: 3 minutes each                                   │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. For Each Section (Section 1, 2, 3, 4):                       │
│    a) Find QuestionType (SPEAKING_INTRO, DESCRIPTION, etc)      │
│    b) Query: SELECT questions WHERE type_id = X                 │
│    c) JavaScript: allQuestions.slice(0, limitPerSection)        │
│       - Section 1: Take first 3 SPEAKING_INTRO questions        │
│       - Section 2: Take first 3 SPEAKING_DESCRIPTION questions  │
│       - Section 3: Take first 3 SPEAKING_COMPARISON questions   │
│       - Section 4: Take first 1 SPEAKING_DISCUSSION question    │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Create ExamSectionQuestion Links                             │
│    - 3 links for section_id=1 (questions 1,2,3)                │
│    - 3 links for section_id=2 (questions 4,5,6)                │
│    - 3 links for section_id=3 (questions 7,8,9)                │
│    - 1 link for section_id=4 (question 10)                     │
└─────────────────────────────────────────────────────────────────┘
              ↓
       DATABASE STATE
    ┌─────────────────────┐
    │ exam_sections: 4    │
    │ questions: 10       │
    │ section_questions:10│
    └─────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: EXAM ATTEMPT START                                    │
│ 1. User clicks "Full Exam"                                      │
│ 2. Backend creates ExamAttempt record                           │
│ 3. Backend creates 10 AttemptAnswer records (one per question)  │
│    - Each links to a Question                                   │
│    - Each has attempt_id, question_id, status='pending'         │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: LOAD QUESTIONS                                        │
│ API: GET /student/attempts/{attemptId}/questions?limit=999      │
│                                                                 │
│ Response: List of 29+ AttemptAnswer objects (for full exam):    │
│ - 5 Reading sections (different question types)                 │
│ - 4 Listening sections (different question types)               │
│ - 4 Writing sections (different question types)                 │
│ - 4 Speaking sections (different question types) ← THIS IS US   │
│                                                                 │
│ Each answer object contains:                                    │
│ {                                                               │
│   id: <attemptAnswerId>,                                        │
│   attempt_id: <attemptId>,                                      │
│   question_id: <questionId>,                                    │
│   status: 'pending',                                            │
│   question: {                                                   │
│     id: <questionId>,                                           │
│     content: "Tell me about yourself...",                       │
│     media_url: null or "https://picsum.photos/640/480?random=1" │
│     questionType: {                                             │
│       id: X,                                                    │
│       code: "SPEAKING_INTRO",                                   │
│       skill_type_id: <SPEAKING_SKILL_ID>  ← KEY FIELD          │
│     }                                                           │
│   }                                                             │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ REDUX STORE                                                     │
│ state.attempts = {                                              │
│   questions: [                                                  │
│     ... 5-10 READING questions ...,                             │
│     ... 5-10 LISTENING questions ...,                           │
│     ... 4-10 WRITING questions ...,                             │
│     ... 10 SPEAKING questions ← OUR 10 QUESTIONS               │
│   ]                                                             │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FILTER IN page.jsx: getCurrentSkillData()                       │
│                                                                 │
│ Input: All 29+ questions from Redux state                       │
│ Filter: questions.filter(q =>                                   │
│   q.question?.questionType?.skill_type_id === SPEAKING_ID       │
│ )                                                               │
│ Output: 10 questions (ONLY THE SPEAKING ONES) ✓                 │
└─────────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ DISPLAY LOGIC                                                   │
│                                                                 │
│ displayQuestions = currentSkillData.questions                   │
│ displayQuestions.length = 10 ✓                                   │
│                                                                 │
│ For each render:                                                │
│ - currentQuestionIndex = 0 → Show Q1 (Personal Intro)           │
│ - currentQuestionIndex = 1 → Show Q2 (Personal Routine)         │
│ - ...                                                           │
│ - currentQuestionIndex = 9 → Show Q10 (Discussion) ← LAST       │
│                                                                 │
│ Navigation Buttons:                                             │
│ - Prev: enabled when currentQuestionIndex > 0                   │
│ - Next: When at Q9:                                             │
│   - If (currentSkillIndex < totalSkills-1):                     │
│     "Next Skill" button                                         │
│   - Else:                                                       │
│     "Submit" button                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Question Data Structure

### Complete Question Object
```javascript
{
  // AttemptAnswer record
  id: 1,
  attempt_id: 123,
  question_id: 1,
  answer_type: null,  // 'audio' after recording
  selected_option_id: null,
  text_answer: null,
  answer_json: null,
  marked_for_review: false,
  flagged: false,
  status: 'pending',  // changes to 'answered' after save
  
  // Nested Question object
  question: {
    id: 1,
    question_type_id: 7,  // SPEAKING_INTRO
    aptis_type_id: 1,
    difficulty: 'easy',
    content: "Tell me about yourself:\n- Name and where you're from\n- What you do (work or studies)\n- Your hobbies and interests\n\n30 seconds to prepare, 1 minute to speak.",
    media_url: null,  // No image for intro
    duration_seconds: 90,
    status: 'active',
    
    // Nested QuestionType
    questionType: {
      id: 7,
      code: 'SPEAKING_INTRO',
      question_type_name: 'Speaking Introduction',
      skill_type_id: 4,  // SPEAKING
      scoring_method: 'cefr_based'
    },
    
    // Empty arrays (not needed for speaking)
    items: [],
    options: []
  },
  
  // Answer data (after student responds)
  answer_data: {
    answer_type: 'audio',
    audio_url: '/uploads/audio/speaking_q1_123456.webm',
    duration: 45,  // seconds
    transcribed_text: null,  // optional
    answered_at: '2026-01-16T10:30:00Z'
  }
}
```

## The Problem (BEFORE FIX)

### Database State After Seed
```sql
-- What was being created (BROKEN):
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, max_score)
SELECT section.id, null, 1, 5 FROM exam_sections section
WHERE section.section_order = 2  -- Section 2
-- Because: SELECT FROM questions WHERE type_id=X LIMIT 3 OFFSET 3
--          Got 0 results (only 3 SPEAKING_DESCRIPTION questions exist)
```

### Frontend Result
```
displayQuestions = [
  { question: { id: 1, type: SPEAKING_INTRO } },
  { question: { id: 2, type: SPEAKING_INTRO } },
  { question: { id: 3, type: SPEAKING_INTRO } }
  // ❌ Missing 7 more questions!
]

displayQuestions.length = 3  ❌ (Should be 10)
currentQuestionIndex = 2 (last question of 3)

Button Logic:
if (currentQuestionIndex === displayQuestions.length - 1) {
  if (currentSkillIndex < availableSkills.length - 1) {
    Show "Next Skill"
  } else {
    Show "Submit"
  }
}
// ✓ Shows "Next Skill" or "Submit" at Q3 ❌ (Should be at Q10)
```

## The Solution (AFTER FIX)

### Database State After Seed
```sql
-- What is being created (FIXED):
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, max_score)
VALUES 
  -- Section 1
  (section_1_id, q1_id, 1, 5),
  (section_1_id, q2_id, 2, 5),
  (section_1_id, q3_id, 3, 5),
  -- Section 2
  (section_2_id, q4_id, 1, 5),
  (section_2_id, q5_id, 2, 5),
  (section_2_id, q6_id, 3, 5),
  -- Section 3
  (section_3_id, q7_id, 1, 5),
  (section_3_id, q8_id, 2, 5),
  (section_3_id, q9_id, 3, 5),
  -- Section 4
  (section_4_id, q10_id, 1, 5);

-- Because: allQuestions = SELECT FROM questions WHERE type_id=X
--          then slice(0, 3) gets first 3 available
```

### Frontend Result
```
displayQuestions = [
  { question: { id: 1, type: SPEAKING_INTRO } },
  { question: { id: 2, type: SPEAKING_INTRO } },
  { question: { id: 3, type: SPEAKING_INTRO } },
  { question: { id: 4, type: SPEAKING_DESCRIPTION } },
  { question: { id: 5, type: SPEAKING_DESCRIPTION } },
  { question: { id: 6, type: SPEAKING_DESCRIPTION } },
  { question: { id: 7, type: SPEAKING_COMPARISON } },
  { question: { id: 8, type: SPEAKING_COMPARISON } },
  { question: { id: 9, type: SPEAKING_COMPARISON } },
  { question: { id: 10, type: SPEAKING_DISCUSSION } }
]

displayQuestions.length = 10  ✓

Button Logic:
if (currentQuestionIndex === 9) {  // Last question
  if (currentSkillIndex < availableSkills.length - 1) {
    Show "Next Skill"
  } else {
    Show "Submit"
  }
}
// ✓ Shows "Next Skill" or "Submit" only at Q10 ✓
```

## Verification Checklist

### After Re-seeding
```sql
-- Run these to verify the fix worked:

1. COUNT sections:
SELECT COUNT(*) FROM exam_sections 
WHERE skill_type_id = (SELECT id FROM skill_types WHERE code = 'SPEAKING');
-- Expected: 4

2. COUNT questions per section:
SELECT es.section_order, COUNT(esq.id) as question_count
FROM exam_sections es
LEFT JOIN exam_section_questions esq ON es.id = esq.exam_section_id
WHERE es.skill_type_id = (SELECT id FROM skill_types WHERE code = 'SPEAKING')
GROUP BY es.section_order
ORDER BY es.section_order;
-- Expected:
-- section_order | question_count
-- 1             | 3
-- 2             | 3
-- 3             | 3
-- 4             | 1

3. Check total speaking questions:
SELECT COUNT(*) FROM exam_section_questions esq
JOIN exam_sections es ON esq.exam_section_id = es.id
WHERE es.skill_type_id = (SELECT id FROM skill_types WHERE code = 'SPEAKING');
-- Expected: 10

4. Check question types:
SELECT qt.code, COUNT(q.id) as count
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.code LIKE 'SPEAKING_%'
GROUP BY qt.code;
-- Expected:
-- code                    | count
-- SPEAKING_INTRO          | 3
-- SPEAKING_DESCRIPTION    | 3
-- SPEAKING_COMPARISON     | 3
-- SPEAKING_DISCUSSION     | 1
```

### In Frontend Console
```javascript
// When speaking skill is loaded:
[TakeExamPage] Skill: SPEAKING (ID: 4)
[TakeExamPage] Questions found for this skill: 10  // ✓ MUST be 10!

// When at last question:
[TakeExamPage] Render state: {
  ...
  displayQuestionsLength: 10,    // ✓ MUST be 10!
  currentQuestionIndex: 9,        // ✓ (0-indexed, so 9 = 10th question)
  ...
}
```

## Summary

**Root Cause**: OFFSET query was trying to load questions beyond what existed  
**Symptom**: Only 3 speaking questions loaded, submit button appeared too early  
**Fix**: Use JavaScript array slicing instead of SQL OFFSET  
**Result**: All 10 questions now properly linked to their sections and displayed sequentially
