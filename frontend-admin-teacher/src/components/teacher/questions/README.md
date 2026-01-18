# APTIS Question Components Structure

Cấu trúc components đã được tổ chức lại theo từng skill type để dễ quản lý và phát triển.

## 📁 Cấu trúc thư mục

```
questions/
├── reading/                 # Reading skill components (29 câu, 50 điểm)
│   ├── ReadingGapFillingForm.jsx           # Part 1: 5 câu, 10 điểm
│   ├── ReadingOrderingForm.jsx             # Part 2: 5 câu, 5 điểm
│   ├── ReadingMatchingForm.jsx             # Part 3: 5 câu, 5 điểm
│   ├── ReadingMatchingHeadingsForm.jsx     # Part 4: 7 câu, 16 điểm
│   ├── ReadingShortTextForm.jsx            # Part 5: 7 câu, 14 điểm ✓ NEW
│   └── index.js                            # Exports
│
├── listening/              # Listening skill components (25 câu, 50 điểm)
│   ├── ListeningMCQForm.jsx                # Part 1: 13 câu, 26 điểm
│   ├── ListeningGapFillingForm.jsx         # Parts 2-4: 12 câu, 24 điểm
│   ├── ListeningMatchingForm.jsx           # Parts 2-4: Speaker/Statement Matching ✓ NEW
│   └── index.js                            # Exports
│
├── speaking/               # Speaking skill components (50 điểm, AI scoring)
│   ├── SpeakingPersonalIntroForm.jsx       # Task 1: A2, 0-5 scale
│   ├── SpeakingDescriptionForm.jsx         # Task 2: B1, 0-5 scale
│   ├── SpeakingComparisonForm.jsx          # Task 3: B1, 0-5 scale ✓ NEW
│   ├── SpeakingTopicDiscussionForm.jsx     # Task 4: B2, 0-6 scale ✓ NEW
│   └── index.js                            # Exports
│
├── writing/                # Writing skill components (50 điểm, AI scoring)
│   ├── WritingShortResponseForm.jsx        # Task 1: A1, 0-4 scale
│   ├── WritingFormFillingForm.jsx          # Task 2: A2, 0-5 scale ✓ NEW
│   ├── WritingChatResponsesForm.jsx        # Task 3: B1, 0-5 scale ✓ NEW
│   ├── WritingEmailForm.jsx                # Task 4: B2, 0-6 scale
│   └── index.js                            # Exports
│
├── common/                 # Shared components
│   ├── QuestionCard.jsx
│   ├── QuestionList.jsx
│   ├── QuestionPreview.jsx
│   ├── QuestionStructureGuide.jsx
│   └── index.js
│
├── QuestionForm.jsx        # Main form với smart routing
├── index.js               # Main exports
└── [legacy components]    # Backward compatibility
```

## 🎯 APTIS Test Structure (200 điểm)

### Reading (50 điểm - 29 câu)
- **Part 1**: Gap Filling - 5 câu = 10 điểm (2đ/câu)
- **Part 2**: Ordering - 5 câu = 5 điểm (1đ/câu)  
- **Part 3**: Matching - 5 câu = 5 điểm (1đ/câu)
- **Part 4**: Matching Headings - 7 câu = 16 điểm (~2.29đ/câu)
- **Part 5**: Short Text Matching - 7 câu = 14 điểm (2đ/câu) ✅ COMPLETED

### Listening (50 điểm - 25 câu) 
- **Part 1**: Multiple Choice - 13 câu = 26 điểm (2đ/câu) ✅ COMPLETED
- **Parts 2-4**: Gap Filling - 12 câu = 24 điểm (2đ/câu) ✅ COMPLETED
- **Parts 2-4**: Speaker/Statement Matching ✅ COMPLETED

### Speaking (50 điểm - AI scoring)
- **Task 1**: Personal Introduction (A2) - 0-5 scale ✅ COMPLETED
- **Task 2**: Picture Description (B1) - 0-5 scale ✅ COMPLETED  
- **Task 3**: Comparison (B1) - 0-5 scale ✅ COMPLETED
- **Task 4**: Topic Discussion (B2) - 0-6 scale with C1/C2 extension ✅ COMPLETED

### Writing (50 điểm - AI scoring)
- **Task 1**: Short Response (A1) - 0-4 scale ✅ COMPLETED 
- **Task 2**: Form Filling (A2) - 0-5 scale ✅ COMPLETED
- **Task 3**: Chat Responses (B1) - 0-5 scale ✅ COMPLETED
- **Task 4**: Email Writing (B2) - 0-6 scale with C1/C2 extension ✅ COMPLETED

## 🔧 Usage

### Import components theo skill

```jsx
// Reading components
import { ReadingGapFillingForm, ReadingOrderingForm } from '@/components/teacher/questions/reading';

// Listening components  
import { ListeningMCQForm } from '@/components/teacher/questions/listening';

// Speaking components
import { SpeakingPersonalIntroForm } from '@/components/teacher/questions/speaking';

// Writing components
import { WritingEmailForm } from '@/components/teacher/questions/writing';

// Common components
import { QuestionPreview, QuestionCard } from '@/components/teacher/questions/common';
```

### QuestionForm tự động routing

QuestionForm.jsx sẽ tự động chọn component phù hợp dựa trên:
- `skillType.code` (READING, LISTENING, SPEAKING, WRITING)
- `questionType.code` (READING_GAP_FILL, LISTENING_MCQ, v.v.)

## 📝 Component Structure

Mỗi skill-specific component có cấu trúc chung:

```jsx
export default function SkillTypeForm({ content, onChange }) {
  // State management
  // Validation logic  
  // Auto-save và update parent
  // Render UI với validation feedback
}
```

### Props chung:
- `content`: Nội dung câu hỏi (JSON string hoặc object)
- `onChange`: Callback để update parent component
- `skillType`, `questionType`: Metadata
- `aptisData`, `skillData`, `questionTypeData`: Reference data

### Features:
- ✅ Real-time validation
- ✅ Auto-save 
- ✅ Error handling
- ✅ Preview mode
- ✅ Structured data output

## 🚀 Migration Plan

1. **Phase 1** ✅: Core components (đã hoàn thành)
   - Reading: Gap Filling, Ordering, Matching, Matching Headings
   - Listening: MCQ, Gap Filling
   - Speaking: Personal Intro, Description  
   - Writing: Short Response, Email

2. **Phase 2** 🔄: Remaining components
   - Reading Part 5: Short Text Matching
   - Listening: Speaker Matching, Statement Matching
   - Speaking Tasks 3-4: Comparison, Discussion
   - Writing Tasks 2-3: Form Filling, Chat Responses

3. **Phase 3** 📋: Enhancement
   - Advanced validation
   - Question templates
   - Bulk import/export
   - AI-powered suggestions

## 🔄 Backward Compatibility

Legacy components vẫn được giữ lại để tương thích:
- MCQForm.jsx
- MatchingForm.jsx  
- GapFillingForm.jsx
- OrderingForm.jsx
- WritingPromptForm.jsx
- SpeakingTaskForm.jsx

QuestionForm.jsx có fallback logic để sử dụng legacy components khi cần.