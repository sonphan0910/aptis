# Hướng dẫn Seed lại Database cho Listening Questions

## 📋 Tổng quan thay đổi

Đã cập nhật cấu trúc Listening section theo đúng cấu trúc thực tế của APTIS:

### Cấu trúc Listening mới (17 câu = 50 điểm):
- **Part 1**: 5 MCQ × 3 điểm = 15 điểm
- **Part 2**: 4 Speaker Matching × 3 điểm = 12 điểm  
- **Part 3**: 4 Statement Matching × 3 điểm = 12 điểm
- **Part 4**: 4 Multi-question MCQ × 3 điểm = 12 điểm
- **Tổng**: 17 items = 51 điểm (làm tròn 50 điểm)

## 🔧 Files đã được cập nhật

### Backend:
1. **02-seed-types.js**: Xóa duplicate LISTENING_STATEMENT_MATCHING
2. **05-seed-questions.js**: Đã có đầy đủ 17 listening questions
3. **06-seed-exams.js**: Cập nhật exam structure để match với question types

### Frontend:
1. **listening/ListeningMCQQuestion.jsx**: MCQ đơn với 1 audio
2. **listening/ListeningMatchingQuestion.jsx**: Speaker matching với audio riêng cho mỗi speaker
3. **listening/ListeningStatementMatchingQuestion.jsx**: Statement matching với 1 audio chung
4. **listening/ListeningMultiMCQQuestion.jsx**: **MỚI** - MCQ với nhiều sub-questions chia sẻ 1 audio
5. **QuestionDisplay.jsx**: Thêm logic phân biệt MCQ thường vs Multi-MCQ

## 🚀 Các bước Seed lại Database

### Bước 1: Di chuyển vào thư mục backend
```bash
cd backend
```

### Bước 2: Xóa database cũ (nếu cần reset hoàn toàn)
```bash
# Option 1: Drop và tạo lại database (MySQL)
# Chạy trong MySQL client:
# DROP DATABASE IF EXISTS aptis_db;
# CREATE DATABASE aptis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Option 2: Chỉ xóa data trong bảng questions và exams
# Có thể dùng MySQL Workbench hoặc command line
```

### Bước 3: Chạy seed hoàn chỉnh
```bash
npm run seed:complete
```

Lệnh này sẽ chạy theo thứ tự:
1. `seed:init` - Khởi tạo database schema
2. `seed:types` - Seed APTIS types, Skill types, Question types (đã fix duplicate)
3. `seed:users` - Seed users
4. `seed:ai` - Seed AI criteria
5. `seed:questions` - Seed 17 listening questions + reading + writing + speaking
6. `seed:exams` - Tạo exam với đúng cấu trúc

### Bước 4 (Alternative): Chạy từng bước riêng lẻ
```bash
# Nếu muốn kiểm soát từng bước:
npm run seed:init
npm run seed:types
npm run seed:users
npm run seed:ai
npm run seed:questions
npm run seed:exams
```

## ✅ Kiểm tra kết quả

### 1. Kiểm tra Question Types
```sql
SELECT code, question_type_name 
FROM question_types 
WHERE code LIKE 'LISTENING%';
```

Kết quả mong đợi:
- LISTENING_MCQ
- LISTENING_GAP_FILL
- LISTENING_MATCHING
- LISTENING_STATEMENT_MATCHING (chỉ 1, không duplicate)

### 2. Kiểm tra Questions
```sql
SELECT 
  qt.code,
  COUNT(*) as question_count
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.code LIKE 'LISTENING%'
GROUP BY qt.code;
```

Kết quả mong đợi:
- LISTENING_MCQ: 7 questions (5 đơn + 2 multi)
- LISTENING_MATCHING: 1 question (4 speakers)
- LISTENING_STATEMENT_MATCHING: 1 question (4 statements)

### 3. Kiểm tra Exam Structure
```sql
SELECT 
  es.id,
  st.skill_type_name,
  COUNT(esq.id) as question_count,
  SUM(esq.max_score) as total_score
FROM exam_sections es
JOIN skill_types st ON es.skill_type_id = st.id
LEFT JOIN exam_section_questions esq ON es.exam_section_id = esq.exam_section_id
WHERE st.code = 'LISTENING'
GROUP BY es.id, st.skill_type_name;
```

Kết quả mong đợi:
- Listening section: 9 items (5 MCQ + 1 Speaker Matching + 1 Statement Matching + 2 Multi-MCQ)
- Total score: 50-51 điểm

## 📝 Lưu ý quan trọng

### 1. Multi-question MCQ Logic
- Questions có field `additional_media` chứa thông tin về nhiều audio
- Questions có `items` array (QuestionItem) chứa các sub-questions
- Frontend sẽ tự động detect và dùng `ListeningMultiMCQQuestion` component

### 2. Speaker Matching
- Mỗi speaker (QuestionItem) có `media_url` riêng
- Frontend component `ListeningMatchingQuestion` sẽ render audio player riêng cho mỗi speaker

### 3. Statement Matching
- 1 audio chính trong Question.media_url
- Nhiều statements trong QuestionItem
- Options là ["Man", "Woman", "Both"]

## 🐛 Troubleshooting

### Lỗi: "Duplicate entry for key 'code'"
- Database chưa được xóa sạch
- Chạy: `npm run seed:init` để drop và tạo lại tables

### Lỗi: "Cannot find module"
- Chạy: `npm install` để cài dependencies

### Questions không hiển thị đúng
- Kiểm tra QuestionType codes trong database
- Kiểm tra QuestionDisplay.jsx mapping

## 🎯 Kết quả cuối cùng

Sau khi seed xong, bạn sẽ có:
- ✅ 17 Listening questions đầy đủ
- ✅ 5 Reading questions
- ✅ 4 Writing questions  
- ✅ 4 Speaking questions
- ✅ 1 Full APTIS exam với 200 điểm (4 skills)
- ✅ Frontend components sẵn sàng cho từng loại câu hỏi

## 📞 Support
Nếu gặp vấn đề, kiểm tra:
1. Backend logs: `backend/logs/`
2. Seed output trong terminal
3. Database structure bằng MySQL Workbench
