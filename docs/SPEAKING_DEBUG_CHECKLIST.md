# Speaking Section - Debugging Checklist

## Database Verification Commands

### 1. Check Speaking Skill Exists
```sql
SELECT id, code, skill_type_name FROM skill_types WHERE code = 'SPEAKING';
```

### 2. Check Speaking Sections Created
```sql
SELECT id, exam_id, section_order, skill_type_id, instruction 
FROM exam_sections 
WHERE skill_type_id = (SELECT id FROM skill_types WHERE code = 'SPEAKING')
ORDER BY section_order;
-- Expected: 4 rows (Section 1, 2, 3, 4)
```

### 3. Check Questions Exist
```sql
SELECT id, question_type_id, difficulty, content 
FROM questions 
WHERE question_type_id IN (
  SELECT id FROM question_types 
  WHERE code IN ('SPEAKING_INTRO', 'SPEAKING_DESCRIPTION', 'SPEAKING_COMPARISON', 'SPEAKING_DISCUSSION')
)
LIMIT 10;
-- Expected: 10 rows
```

### 4. Check Exam Section Questions Linked
```sql
SELECT esq.id, esq.exam_section_id, esq.question_id, es.section_order
FROM exam_section_questions esq
JOIN exam_sections es ON esq.exam_section_id = es.id
WHERE es.skill_type_id = (SELECT id FROM skill_types WHERE code = 'SPEAKING')
ORDER BY es.section_order, esq.question_order;
-- Expected: 10 rows with proper section_order assignment
```

### 5. Check Attempt Answers
For a specific attempt, check if all 10 speaking questions are created:
```sql
SELECT COUNT(*) as total_answers,
       COUNT(CASE WHEN qt.code LIKE 'SPEAKING_%' THEN 1 END) as speaking_answers
FROM attempt_answers aa
JOIN questions q ON aa.question_id = q.id
JOIN question_types qt ON q.question_type_id = qt.id
WHERE aa.attempt_id = <ATTEMPT_ID>;
-- Expected: total_answers >= 10, speaking_answers = 10
```

## Frontend Console Debugging

When taking an exam, check the console for these logs:

### Expected Output When Loading Speaking Section
```
[TakeExamPage] Getting skill data for index: 3, skill: SPEAKING
[TakeExamPage] Total questions loaded: 29  (or higher, depending on exam type)
[TakeExamPage] Skill: SPEAKING (ID: X)
[TakeExamPage] Questions found for this skill: 10
```

### Problem Indicators
```
[TakeExamPage] Questions found for this skill: 3  ❌ Should be 10
[TakeExamPage] WARNING: No questions found for skill SPEAKING ❌
[TakeExamPage] Available skill types in questions: READING, LISTENING, WRITING ❌ Should include SPEAKING
```

## API Endpoint Testing

### Test Getting Attempt Questions
```bash
curl -X GET "http://localhost:3000/api/student/attempts/{attemptId}/questions?limit=999" \
  -H "Authorization: Bearer {token}"
```

### Expected Response
- Should contain 29 or more answers (depending on full/partial exam)
- Of those, 10 should have `question.questionType.code` starting with "SPEAKING_"
- All 10 should have `question.questionType.skill_type_id` pointing to the same SPEAKING skill id

## Common Issues & Fixes

### Issue: Only 3 Questions Shown
**Cause**: Backend might only return 3 questions  
**Fix**: 
1. Check if there's a limit parameter defaulting to 3
2. Verify loadQuestions calls with `limit: 999`
3. Check if section_id filtering is active

### Issue: Questions Missing skill_type_id
**Cause**: Question structure missing questionType.skill_type_id  
**Fix**:
1. Ensure Question includes QuestionType association
2. Verify QuestionType includes skill_type_id field
3. Check backend's getAttemptQuestions query includes questionType

### Issue: Section Order Wrong
**Cause**: Exam sections created in wrong order  
**Fix**:
1. Verify exam_sections has correct section_order (1,2,3,4)
2. Check ExamSectionQuestion question_order within each section
3. Ensure questions loaded and sorted by section_order

## Temporary Fix (If Needed)

If issues persist, manually verify by:
1. Going to database and running verification queries above
2. Checking raw API response in Network tab of browser dev tools
3. Adding temporary console logs in getCurrentSkillData() function
4. Verifying Redux state contains all 10 questions

## Success Indicators

Once fixed, you should see:
- ✓ 10 questions loaded for Speaking skill
- ✓ Questions displayed sequentially (Q1→Q2→...→Q10)
- ✓ "Next Question" button enabled for Q1-Q9
- ✓ "Next Skill" or "Submit" button on Q10
- ✓ No gaps or missing sections
- ✓ All 4 section types represented (Intro, Description, Comparison, Discussion)
