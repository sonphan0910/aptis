# Speaking Section Loading Issue - Diagnosis

## Problem Statement
When taking a speaking exam with 4 sections and 10 total questions (3+3+3+1):
- Only the first 3 questions (Section 1) are displayed
- Submit button appears after question 3, instead of after question 10
- All 4 sections should be shown sequentially before submit option

## Expected Behavior
1. Load all 10 speaking questions across 4 sections
2. Display questions sequentially (Q1→Q2→Q3→...→Q10)
3. Only show "Submit" button after Q10 (last question)
4. Show "Next Skill" button if more skills remain after Speaking

## Current Behavior
1. Section 1 loads 3 questions ✓
2. After Q3, submit button appears ✗ (should show "Next Skill" or continue to Q4)
3. Sections 2-4 not displayed ✗

## Data Structure Analysis

### Database Level
- ✓ Seeded data shows 4 exam_sections created for speaking
- ✓ Each section created with skill_type_id = SPEAKING
- ✓ ExamSectionQuestion links created for all 10 questions

### API Level (Backend)
- GET `/student/attempts/:attemptId/questions`
- **Limit**: 999 (should load all questions)
- **Filtering**: By section_id if provided (optional)
- **Result**: Should return all 10 AttemptAnswer records with nested Question objects

### Frontend Level

#### Data Flow
1. `useExamState` calls `dispatch(loadQuestions({ attemptId, limit: 999 }))`
2. This returns all 10 questions into Redux state
3. `page.jsx` calls `getCurrentSkillData()` to filter questions by skill
4. Filter logic: `questions.filter(q => q.question?.questionType?.skill_type_id === currentSkill.id)`

#### Suspected Issue
The `displayQuestions` variable is calculated from `getCurrentSkillData().questions`, which should have all 10 questions. But the "Next Skill" button logic shows after only 3 questions.

## Debugging Steps

### 1. Verify API Response
Check that `/student/attempts/:attemptId/questions` returns all 10 questions with proper skill_type_id mapping.

Expected response structure:
```json
{
  "data": [
    {
      "id": <attemptAnswerId>,
      "attempt_id": <attemptId>,
      "question_id": <questionId>,
      "question": {
        "id": <questionId>,
        "content": "Tell me about yourself...",
        "questionType": {
          "code": "SPEAKING_INTRO",
          "skill_type_id": <SPEAKING_SKILL_ID>
        }
      }
    },
    ... (9 more)
  ]
}
```

### 2. Console Debug Output
Frontend should show:
```
[TakeExamPage] Skill: SPEAKING (ID: x)
[TakeExamPage] Questions found for this skill: 10
```

If it shows "10" questions but only displays 3, issue is in display logic.
If it shows "3" questions, issue is in backend filtering.

### 3. Key Variables to Check
- `questions.length` - Should be 10 after loadQuestions
- `displayQuestions.length` - Should be 10 after filtering
- `availableSkills.length` - Should be 4 (Reading, Listening, Writing, Speaking)
- `currentSkillIndex` - Should be 3 (Speaking is usually 4th skill)

## Potential Causes

### Scenario 1: Section Confusion
If sections are being treated as separate "skills" in availableSkills array, then it would show only 3 questions per section. Solution: Ensure availableSkills only contains 4 skills (Reading, Listening, Writing, Speaking), not 17 sections.

### Scenario 2: Question Filtering Issue
If the filter in `getCurrentSkillData()` doesn't properly match skill_type_id, questions won't load. Solution: Verify question structure includes `questionType.skill_type_id`.

### Scenario 3: Backend Limitation
If backend only returns first N questions due to some constraint. Solution: Check if there's a default limit or pagination issue.

### Scenario 4: Section-based Loading
If questions are being loaded per section instead of per skill. Solution: Update loadQuestions to load all sections at once for a skill.

## Required Fixes

### Option A: Ensure All Questions Loaded
1. Verify backend returns all 10 questions in single request
2. Confirm Redux state has all 10 questions
3. Confirm filter returns all 10 questions

### Option B: Update Display Logic
If questions are correctly loaded but not displayed, update the navigation logic to:
1. Continue showing "Next Question" until displayQuestions.length is reached
2. Only show "Next Skill" when currentQuestionIndex === displayQuestions.length - 1

### Option C: Section to Question Mapping
Ensure the ExamSectionQuestion properly links each section to its questions, and the API correctly returns them grouped by skill (not by section).

## Testing Checklist
- [ ] Seed runs without errors
- [ ] 4 exam_sections created for Speaking
- [ ] 10 ExamSectionQuestion records created linking questions to sections
- [ ] Backend API returns all 10 questions
- [ ] Frontend loads all 10 into Redux state
- [ ] Filter returns all 10 questions for Speaking skill
- [ ] Display shows Q1→Q2→...→Q10 sequentially
- [ ] Submit button only appears after Q10
- [ ] Next Skill button shows before Q10 if more skills available

## Implementation Notes

### Seed Data Validation Query
```sql
-- Check speaking sections
SELECT id, section_order, instruction FROM exam_sections 
WHERE skill_type_id = (SELECT id FROM skill_types WHERE code = 'SPEAKING') 
ORDER BY section_order;

-- Check section questions
SELECT COUNT(*) FROM exam_section_questions 
WHERE exam_section_id IN (
  SELECT id FROM exam_sections 
  WHERE skill_type_id = (SELECT id FROM skill_types WHERE code = 'SPEAKING')
);
-- Should return 10

-- Check attempt answers for speaking
SELECT COUNT(*) FROM attempt_answers a
JOIN questions q ON a.question_id = q.id  
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.code LIKE 'SPEAKING_%' AND a.attempt_id = <attemptId>;
-- Should return 10
```
