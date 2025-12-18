# HỆ THỐNG BACKEND - NODE.JS EXPRESS.JS (CHẠY LOCAL)

## 1. CẤU TRÚC DỰ ÁN

```
backend/
├── src/
│   ├── config/                      # Cấu hình hệ thống
│   │   ├── database.js              # Kết nối MySQL
│   │   ├── ai.js                    # Cấu hình Gemini API
│   │   ├── jwt.js                   # Token JWT
│   │   ├── storage.js               # Cấu hình lưu trữ local (chỉ chạy local, không cloud)
│   │   └── email.js                 # Cấu hình gửi email
│   │
│   ├── models/                      # Database models (Sequelize/Prisma)
│   │   ├── User.js                  # Người dùng (admin, teacher, student)
│   │   ├── AptisType.js             # Loại APTIS (General, Advanced, for Teachers, for Teens)
│   │   ├── SkillType.js             # Kỹ năng (Grammar & Vocabulary, Reading, Writing, Listening, Speaking)
│   │   ├── QuestionType.js          # Dạng câu hỏi (MCQ, Gap filling, Matching, v.v.)
│   │   ├── Question.js              # Câu hỏi (ngân hàng câu hỏi)
│   │   ├── QuestionItem.js          # Mục trong câu hỏi (dùng cho matching, gap filling, ordering)
│   │   ├── QuestionOption.js        # Lựa chọn trả lời
│   │   ├── QuestionSampleAnswers.js # Đáp án mẫu cho Writing/Speaking
│   │   ├── AiScoringCriteria.js     # Tiêu chí chấm điểm AI
│   │   ├── Exam.js                  # Bài thi
│   │   ├── ExamSection.js           # Phần thi (Grammar, Reading, Writing, v.v.) - một phần của một skill
│   │   ├── ExamSectionQuestion.js   # Câu hỏi trong phần thi (1 skill của một bài thi có nhiều phần thi)
│   │   ├── ExamAttempt.js           # Lượt làm bài thi (full_exam hoặc single_skill)
│   │   ├── AttemptSection.js        # Các phần thi trong một lượt làm
│   │   ├── AttemptAnswer.js         # Câu trả lời của học viên
│   │   └── AnswerAiFeedback.js      # Phản hồi chi tiết từ AI (chỉ Writing/Speaking)
│   │
│   ├── routes/                      # Định tuyến API
│   │   ├── auth.routes.js           # Xác thực (đăng ký, đăng nhập, reset password)
│   │   ├── users.routes.js          # Quản lý tài khoản người dùng
│   │   ├── student.routes.js        # API cho học viên
│   │   ├── teacher.routes.js        # API cho giáo viên
│   │   ├── admin.routes.js          # API cho quản trị viên
│   │   └── public.routes.js         # API công khai (danh sách đề thi, v.v.)
│   │
│   ├── controllers/                 # Logic xử lý request
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── studentController.js
│   │   │   ├── examController.js    # Danh sách bài thi, chi tiết
│   │   │   ├── attemptController.js # Bắt đầu, nộp bài thi
│   │   │   ├── answerController.js  # Lưu câu trả lời
│   │   │   └── resultController.js  # Xem kết quả
│   │   │
│   │   ├── teacherController.js
│   │   │   ├── questionController.js    # CRUD câu hỏi
│   │   │   ├── examController.js        # Tạo/sửa đề thi
│   │   │   ├── criteriaController.js    # Quản lý tiêu chí AI
│   │   │   ├── reviewController.js      # Xem xét bài nộp
│   │   │   └── reportController.js      # Thống kê
│   │   │
│   │   └── adminController.js
│   │       ├── userManagement.js        # CRUD người dùng
│   │       ├── systemConfig.js          # Cấu hình hệ thống
│   │       ├── aiManagement.js          # Giám sát AI queue
│   │       └── reportController.js      # Báo cáo toàn hệ thống
│   │
│   ├── services/                    # Logic nghiệp vụ
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── examService.js
│   │   ├── scoringService.js        # Chấm điểm tự động (MCQ, gap filling, matching)
│   │   ├── aiScoringService.js      # Chấm điểm AI (Writing, Speaking)
│   │   ├── feedbackService.js       # Tạo phản hồi
│   │   ├── emailService.js          # Gửi email
│   │   ├── storageService.js        # Quản lý file upload (lưu local, không cloud)
│   │   ├── speechToTextService.js   # Chuyển âm thanh → văn bản (Whisper.js - offline, không Google)
│   │   └── notificationService.js   # Gửi thông báo
│   │
│   ├── jobs/                        # Background jobs (Bull queue)
│   │   ├── scoringQueue.js          # Hàng đợi chấm điểm AI (Writing/Speaking)
│   │   ├── emailQueue.js            # Hàng đợi gửi email
│   │   ├── speechQueue.js           # Hàng đợi chuyển âm thanh thành văn bản
│   │   └── cleanupQueue.js          # Dọn dẹp dữ liệu cũ
│   │
│   ├── middleware/                  # Middleware
│   │   ├── auth.js                  # Xác thực JWT
│   │   ├── errorHandler.js          # Xử lý lỗi toàn cục
│   │   ├── validation.js            # Kiểm tra dữ liệu input
│   │   ├── roleCheck.js             # Kiểm tra vai trò (admin, teacher, student)
│   │   └── rateLimiter.js           # Giới hạn số lượng request
│   │
│   ├── utils/                       # Hàm tiện ích
│   │   ├── validators.js            # Hàm kiểm tra dữ liệu
│   │   ├── helpers.js               # Hàm helper
│   │   ├── constants.js             # Hằng số
│   │   ├── errors.js                # Custom error classes
│   │   └── logger.js                # Logging utility
│   │
│   ├── seeds/                       # Seed scripts (tạo table + data)
│   │   ├── init-database.js         # Tạo tất cả tables từ models
│   │   ├── seed-aptis-types.js      # Seed 4 loại APTIS (read-only)
│   │   ├── seed-skill-types.js      # Seed 5 kỹ năng (read-only)
│   │   ├── seed-question-types.js   # Seed 20+ dạng câu hỏi (read-only)
│   │   └── seed-ai-criteria.js      # Seed tiêu chí AI ban đầu (modifiable)
│   │
│   └── app.js                       # Khởi tạo Express app
│
├── tests/                           # Unit tests, Integration tests
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example                     # Mẫu biến môi trường
├── .env.local                       # Biến môi trường cục bộ (git ignored)
├── package.json
├── package-lock.json
└── README.md
```

## 2. CÁC ENDPOINT API

### 2.1. Xác thực (Public)

**POST /auth/register**
- Đăng ký tài khoản mới
- Body: email, password, full_name, phone
- Response: user object, token

**POST /auth/login**
- Đăng nhập
- Body: email, password
- Response: user object, token

**POST /auth/refresh-token**
- Làm mới token
- Body: refresh_token
- Response: new token

**POST /auth/logout**
- Đăng xuất
- Body: (trống)
- Response: success

**POST /auth/forgot-password**
- Yêu cầu đặt lại mật khẩu
- Body: email
- Response: success

**POST /auth/reset-password**
- Đặt lại mật khẩu
- Body: token, new_password
- Response: success

---

### 2.2. Quản lý người dùng

**GET /users/profile**
- Xem hồ sơ cá nhân
- Response: user object

**PUT /users/profile**
- Cập nhật hồ sơ
- Body: full_name, phone, avatar_url
- Response: updated user

**POST /users/change-password**
- Đổi mật khẩu
- Body: old_password, new_password
- Response: success

**GET /admin/users** (Admin only)
- Danh sách tất cả người dùng
- Query: page, limit, role, status
- Response: users array, total count

**POST /admin/users** (Admin only)
- Tạo tài khoản người dùng
- Body: email, password, full_name, role
- Response: user object

**PUT /admin/users/:userId** (Admin only)
- Cập nhật người dùng
- Body: full_name, phone, role, status
- Response: updated user

**DELETE /admin/users/:userId** (Admin only)
- Xóa người dùng
- Response: success

**POST /admin/users/:userId/reset-password** (Admin only)
- Đặt lại mật khẩu cho người dùng
- Body: temp_password
- Response: success

---

### 2.3. Bài thi của học viên

**GET /student/exams**
- Danh sách bài thi
- Query: page, limit, aptis_type, skill, difficulty, sort
- Response: exams array

**GET /student/exams/:examId**
- Chi tiết bài thi
- Response: exam object with sections and questions count

**POST /student/attempts**
- Bắt đầu thi (full_exam hoặc single_skill)
- Body: exam_id, attempt_type ('full_exam' hoặc 'single_skill'), selected_skill_id (nếu single_skill)
- Response: attempt object with sections and questions

**GET /student/attempts/:attemptId**
- Lấy thông tin lượt thi (để tiếp tục làm)
- Response: attempt with current questions

**POST /student/attempts/:attemptId/answers**
- Lưu câu trả lời
- Body: question_id, answer_type, selected_option_id/answer_json/text_answer/audio_url
- Response: success

**POST /student/attempts/:attemptId/submit**
- Nộp bài thi
- Body: (trống)
- Response: attempt with total_score

**GET /student/attempts/:attemptId/results**
- Xem kết quả thi
- Response: attempt with total_score, attempt_sections (section_score tính từ attempt_answers)

**GET /student/attempts/:attemptId/answers/:answerId/feedback**
- Xem phản hồi chi tiết cho câu hỏi
- Response: answer with feedback, ai_detailed_feedback

**GET /student/attempts**
- Danh sách lượt thi của học viên
- Query: page, limit, sort
- Response: attempts array

---

### 2.5. Câu hỏi của giáo viên

**POST /teacher/questions**
- Tạo câu hỏi mới
- Body: question_type_id, aptis_type_id, difficulty (easy/medium/hard), content, media_url, duration_seconds
- Response: question object

**GET /teacher/questions**
- Danh sách câu hỏi
- Query: page, limit, skill, question_type, difficulty (easy/medium/hard), status, search
- Response: questions array

**GET /teacher/questions/:questionId**
- Chi tiết câu hỏi
- Response: question with items, options, answers

**PUT /teacher/questions/:questionId**
- Chỉnh sửa câu hỏi
- Body: tất cả fields
- Response: updated question

**DELETE /teacher/questions/:questionId**
- Xóa câu hỏi
- Response: success

**GET /teacher/questions/:questionId/usage**
- Xem câu hỏi được dùng ở bài thi nào
- Response: list of exams using this question

---

### 2.6. Bài thi của giáo viên

**POST /teacher/exams**
- Tạo bài thi
- Body: aptis_type_id, title, description, duration_minutes, total_score
- Response: exam object

**PUT /teacher/exams/:examId**
- Chỉnh sửa bài thi (chỉ bản nháp)
- Body: title, description, duration_minutes
- Response: updated exam

**POST /teacher/exams/:examId/sections**
- Thêm phần thi
- Body: skill_type_id, section_order, duration_minutes, instruction
- Response: section object

**POST /teacher/exams/:examId/sections/:sectionId/questions**
- Thêm câu hỏi vào phần thi
- Body: question_id, question_order, max_score
- Response: section_question object

**DELETE /teacher/exams/:examId/sections/:sectionId/questions/:questionId**
- Xóa câu hỏi khỏi phần thi
- Response: success

**PUT /teacher/exams/:examId/sections/:sectionId/questions/:questionId**
- Cập nhật thứ tự, điểm tối đa câu hỏi
- Body: question_order, max_score
- Response: success

**POST /teacher/exams/:examId/publish**
- Xuất bản bài thi
- Body: (trống)
- Response: success (hoặc errors nếu validation fail)

**GET /teacher/exams**
- Danh sách bài thi của giáo viên
- Query: page, limit, status, sort
- Response: exams array

---

### 2.7. Tiêu chí chấm điểm AI

**POST /teacher/criteria**
- Tạo tiêu chí chấm điểm
- Body: aptis_type_id, question_type_id, criteria_name, weight, description, rubric_prompt, max_score
- Response: criteria object

**GET /teacher/criteria**
- Danh sách tiêu chí
- Query: page, limit, question_type_id, aptis_type_id
- Response: criteria array

**PUT /teacher/criteria/:criteriaId**
- Chỉnh sửa tiêu chí
- Body: criteria_name, weight, description, rubric_prompt, max_score
- Response: updated criteria

**DELETE /teacher/criteria/:criteriaId**
- Xóa tiêu chí
- Response: success

**GET /teacher/criteria/:criteriaId/preview**
- Xem preview tiêu chí (cho chỉnh sửa prompt)
- Response: criteria object

---

### 2.8. Xem xét bài nộp

**GET /teacher/review/pending**
- Danh sách bài cần xem xét
- Query: page, limit, sort, exam_id
- Response: student_answers array with needs_review=true

**GET /teacher/review/answers/:answerId**
- Chi tiết bài cần xem xét
- Response: student_answer with ai_feedback, ai_detailed_feedback, question details

**PUT /teacher/review/answers/:answerId**
- Xem xét bài (ghi đè điểm, thêm phản hồi)
- Body: final_score, manual_feedback
- Response: updated answer object

**GET /teacher/review/exam/:examId**
- Xem xét chi tiết theo bài thi
- Query: page, limit
- Response: student_answers array for this exam

---

### 2.9. Báo cáo của giáo viên

**GET /teacher/reports/exam-statistics/:examId**
- Thống kê bài thi
- Response: { avg_score, pass_rate, score_by_section, question_difficulty_analysis }

**GET /teacher/reports/student-statistics**
- Thống kê học viên
- Query: page, limit, sort, exam_id
- Response: students with their stats (attempts, avg_score, progress)

**GET /teacher/reports/student/:studentId**
- Báo cáo cá nhân học viên
- Response: student object with detailed stats and progress

**GET /teacher/reports/export**
- Xuất báo cáo
- Query: format (excel/pdf/csv), type (student_stats/exam_stats), date_range
- Response: file download

---

### 2.10. API công khai

**GET /public/aptis-types**
- Danh sách loại APTIS (công khai)
- Response: aptis_types array

**GET /public/exams**
- Danh sách bài thi công khai
- Query: aptis_type, page, limit
- Response: exams array

---

## 3. LUỒNG DỮ LIỆU CHÍNH

**Người dùng học viên - Làm bài thi**:
1. Duyệt danh sách bài thi (lọc theo APTIS, kỹ năng, độ khó).
2. Chọn bài thi → Xem chi tiết (phần thi, số câu, thời gian).
3. Bắt đầu bài thi → Nhận `ExamAttempt` với attempt_type (full_exam/single_skill).
4. Làm từng câu → Lưu `AttemptAnswer` (tự động lưu 30 giây).
5. Nộp bài thi → `ExamAttempt` chuyển trạng thái, chấm điểm tự động cho MCQ/Matching, gửi Writing/Speaking tới queue AI.
6. Xem kết quả → Điểm tức thì (MCQ/Matching), chờ Writing/Speaking (AI scoring + giáo viên review).

**Giáo viên - Quản lý bài thi**:
1. Tạo bài thi → Cấu hình `Exam`, `ExamSection` (phần thi).
2. Thêm câu hỏi từ ngân hàng → `ExamSectionQuestion`.
3. Xuất bản bài thi → Học viên thấy, có thể làm.
4. Nhận Writing/Speaking từ queue → Review, ghi đè điểm, thêm feedback → Học viên nhận thông báo.



---

## 4. DỊCH VỤ & LOGIC NGHIỆP VỤ

### 4.1. ScoringService (Chấm điểm tự động)

- `scoreMultipleChoice(selectedOptionId, correctOptionId)` → Boolean
- `scoreMatching(answerJson, correctMapping)` → Score
- `scoreGapFilling(answer, correctAnswers)` → Score
- `scoreOrdering(itemOrder, correctOrder)` → Score
- `calculateAttemptScore(attemptId)` → void (tính tổng từ tất cả attempt_answers, lưu exam_attempts.total_score)

### 4.2. AiScoringService (Chấm điểm AI)

- `scoreWriting(answer, aiScoringCriteria)` → Promise { score, criteriaScores[], feedback, suggestions, strengths, weaknesses }
- `scoreSpeaking(transcribedText, aiScoringCriteria)` → Promise { score, criteriaScores[], feedback, suggestions, strengths, weaknesses }
- `buildScoringPrompt(question, answer, criteria)` → String
- `parseAiResponse(response)` → { score, criteria_scores[], feedback, suggestions, strengths, weaknesses }
- `retryWithBackoff(fn, maxRetries)` → Promise
- `createAnswerAiFeedbacks(answerId, criteriaScores[])` → void (lưu chi tiết từng tiêu chí vào answer_ai_feedbacks)

### 4.3. FeedbackService (Tạo phản hồi)

- `generateWritingFeedback(score, criteria_feedback)` → String
- `generateSpeakingFeedback(score, criteria_feedback)` → String
- `generateRecommendations(weakSkills)` → String[]
- `flagForManualReview(answerId, reason)` → void

### 4.4. SpeechToTextService (Whisper.js - Offline)

- `convertAudioToText(audioBuffer, language)` → Promise String (dùng Whisper.js chạy local)
- `uploadAudioFile(file)` → Promise { url, duration } (lưu file local)
- `deleteAudioFile(url)` → Promise void
- Lưu ý: Chạy hoàn toàn offline, không cần API key Google, model Whisper.js load một lần lúc khởi động

### 4.5. EmailService

- `sendRegistrationEmail(user)` → Promise void
- `sendPasswordResetEmail(user, resetToken)` → Promise void
- `sendExamResultsEmail(student, results)` → Promise void
- `sendTeacherNotification(teacher, message)` → Promise void

### 4.6. StorageService

- `uploadFile(file, folder)` → Promise { url, fileKey }
- `deleteFile(fileKey)` → Promise void
- `getDownloadUrl(fileKey)` → String

---

### 5. BACKGROUND JOBS (In-Memory Queue)
### 5.1. Scoring Queue

**Job: score-writing**
- Input: { answerId, questionId, textAnswer, aptisTypeId, questionTypeId }
- Process: Gọi AI để chấm theo criteria của (aptis_type, question_type), lưu score + answer_ai_feedbacks
- Updates: attempt_answers (score, ai_feedback, ai_graded_at, graded_by='ai') + answer_ai_feedbacks records
- Retry: 3 lần
- Timeout: 30 giây

**Job: score-speaking**
- Input: { answerId, questionId, audioUrl, aptisTypeId, questionTypeId }
- Process: Chuyển âm thanh → transcribed_text, chấm điểm theo criteria, lưu kết quả
- Updates: attempt_answers (transcribed_text, score, ai_feedback, ai_graded_at, graded_by='ai') + answer_ai_feedbacks records
- Retry: 3 lần
- Timeout: 60 giây

### 5.2. Email Queue

**Job: send-email**
- Input: { templateId, recipientEmail, templateData }
- Process: Gửi email
- Retry: 5 lần

### 5.3. Speech-to-Text Queue

**Job: convert-speech**
- Input: { answerId, audioUrl, language='en' }
- Process: Dùng Whisper.js chuyển âm thanh → văn bản (offline, không cần internet), lưu transcribed_text vào attempt_answers
- Updates: attempt_answers (transcribed_text=result)
- Retry: 3 lần
- Timeout: 120 giây (Whisper xử lý offline nên có thể chậm hơn, tùy độ dài audio)
- Lưu ý: Whisper model load một lần ở memory, không load lại cho mỗi job

### 5.4. Cleanup Queue

**Job: cleanup-old-data**
- Chạy hàng ngày: Xóa file tạm, dữ liệu session cũ
- Retention policy: Giữ dữ liệu 90 ngày

---

## 6. SCORING LOGIC DETAIL

### Auto-Scoring (MCQ, Matching, Gap Filling, Ordering)
1. Khi học viên submit câu trả lời
2. System gọi ScoringService để tính điểm
3. Cập nhật: `attempt_answers` (score, max_score, graded_by='auto', auto_graded_at=NOW)
4. Không cần answer_ai_feedbacks

### AI-Scoring (Writing, Speaking)
1. Khi học viên submit câu trả lời Writing/Speaking
2. System push job vào Bull queue (score-writing hoặc score-speaking)
3. Background job gọi AiScoringService:
   - Lấy criteria từ ai_scoring_criteria filter (aptis_type_id, question_type_id)
   - Gọi Gemini API để chấm theo từng criteria
   - Nhận lại score + feedback từ AI
4. Cập nhật:
   - `attempt_answers` (score, ai_feedback, ai_graded_at=NOW, graded_by='ai', needs_review=true/false)
   - Tạo records trong `answer_ai_feedbacks` cho mỗi criterion
5. Giáo viên xem và có thể ghi đè:
   - `attempt_answers` (final_score, manual_feedback, reviewed_by=teacher_id, reviewed_at=NOW)

### Total Score Calculation
- exam_attempts.total_score = SUM(attempt_answers.final_score hoặc score) 
- Chỉ tính khi tất cả câu hỏi của attempt_type đó hoàn thành

---

## 7. SECURITY & AUTHENTICATION

- **JWT**: Token dùng để auth, expires trong 24h
- **Refresh Token**: Dùng để lấy token mới, expires trong 7 ngày
- **Password**: Hash với bcrypt (salt rounds: 12)
- **Rate Limiting**: 100 requests/15 phút cho login, 5 requests/phút cho upload
- **CORS**: Chỉ allow domain của frontend
- **HTTPS**: Bắt buộc trong production

---

## 8. ENVIRONMENT VARIABLES

```
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aptis_db
DB_USER=root
DB_PASSWORD=123456

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# AI (Gemini)
GOOGLE_AI_API_KEY=AIzaSyDoHZX6dGZRKlcgWFK1GuHmsnmgZF5tBjQ
AI_MODEL=gemini-2.0-flash

# Storage (chỉ lưu local, không cloud)
STORAGE_TYPE=local
STORAGE_PATH=uploads

# Speech-to-Text (Whisper.js - Offline)
WHISPER_MODEL=tiny  # or small/medium/large (small = ~500MB, medium = ~1.5GB, large = ~2.9GB)
WHISPER_DEVICE=cpu  # or cuda/metal nếu có GPU

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=huynguyendev18012003@gmail.com
SMTP_PASSWORD=ltjp nfcz pwil rvdl
EMAIL_FROM=noreply@aptis.com

# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001,http://localhost:3002,http://localhost:3003
# 3001: Admin/Teacher Frontend
# 3002: Student Frontend  
# 3003: Public Frontend (tùy chọn)
```

---

## 9. ERROR HANDLING

- Centralized error handler middleware
- Custom error classes: ValidationError, AuthError, NotFoundError, ServerError
- Consistent error response format: { status, message, errors: [] }

---

## 10. DEPLOYMENT

**Chạy local:**
- Node.js chạy trực tiếp trên máy local (không cloud, không docker)
- MySQL 8.0+ cài local
- Chạy lệnh: `npm install && npm run dev`

**Lưu ý:**
- Không hỗ trợ cloud storage, cloud hosting, docker.
- Tất cả dữ liệu và file upload đều lưu trên máy local.
- Background jobs (Writing/Speaking scoring) sử dụng hàng đợi in-memory (không dùng Redis/Bull).
- Speech-to-Text dùng Whisper.js chạy offline, model load một lần ở memory → không cần Google API, hoàn toàn free.
- Lần đầu chạy sẽ download model (~100-2900MB tùy model size) → lưu vào cache.

---

## 11. SEED DATA INITIALIZATION

### Tổng quan

Khi chạy `npm run seed`, hệ thống sẽ:
1. **Tạo tất cả tables** từ models (Sequelize)
2. **Seed dữ liệu mặc định** (4 loại APTIS, 5 kỹ năng, 20+ dạng câu hỏi)
3. **Seed 3 bài thi mẫu** đầy đủ với tất cả câu hỏi, phần thi, tùy chọn, đáp án
4. **Seed tiêu chí chấm điểm AI** cho các loại APTIS khác nhau
5. **Seed 2 tài khoản admin** và **3 tài khoản teacher** để test

### Danh sách Scripts

**init-database.js**
- Tạo tất cả 20 tables từ models Sequelize
- Drop existing tables (nếu có) để reset database
- Tạo indexes, foreign keys

**seed-aptis-types.js**
- Seed 4 loại APTIS (immutable):
  - `aptis_general` | Aptis General
  - `aptis_advanced` | Aptis Advanced
  - `aptis_for_teachers` | Aptis for Teachers
  - `aptis_for_teens` | Aptis for Teens

**seed-skill-types.js**
- Seed 5 kỹ năng (immutable):
  - Grammar & Vocabulary
  - Reading
  - Writing
  - Listening
  - Speaking

**seed-question-types.js**
- Seed 20+ dạng câu hỏi (immutable), phân loại theo skill:
  - Grammar: MCQ, Fill Blanks, Sentence Transform, Word Matching
  - Reading: Matching Headings, MCQ, Gap Filling, Ordering Paragraphs
  - Listening: Conversation MCQ, Note Completion, Matching Info, Long Monologue
  - Writing: Short Sentence, Email Writing, Opinion Essay, Situation Response
  - Speaking: Personal Question, Describe Image, Express Opinion, Compare & Analyze

**seed-ai-criteria.js**
- Seed tiêu chí chấm điểm AI (modifiable)
- Tạo ~30 criteria cho Writing/Speaking:
  - **Aptis General - Writing**: Task Achievement (30%), Lexical Range (20%), Grammar (30%), Coherence (20%)
  - **Aptis General - Speaking**: Task Achievement (30%), Vocabulary (20%), Grammar (25%), Fluency (15%), Pronunciation (10%)
  - **Aptis Advanced - Writing**: Task Achievement (25%), Lexical Range (25%), Grammar (30%), Coherence (20%)
  - **Aptis Advanced - Speaking**: Task Achievement (25%), Vocabulary (25%), Grammar (25%), Fluency (15%), Pronunciation (10%)

### 3 Bài Thi Mẫu Đầy Đủ

Mỗi bài thi sẽ bao gồm:
- 5 sections (1 cho mỗi skill: Grammar, Reading, Writing, Listening, Speaking)
- ~50-80 câu hỏi tổng cộng
- Tất cả question_items, question_options, question_sample_answers

**Exam 1: Aptis General - Full Test**
- 5 sections: Grammar, Reading, Writing, Listening, Speaking
- ~60 câu hỏi
- Bao gồm: MCQ, Gap Filling, Matching, Writing prompt, Speaking prompt
- Duration: ~140 phút

**Exam 2: Aptis General - Reading & Writing Focus**
- 3 sections: Reading, Writing, Speaking
- ~40 câu hỏi
- Dành cho học viên muốn tập từng skill
- Duration: ~90 phút

**Exam 3: Aptis Advanced - Full Test**
- 5 sections với độ khó cao
- ~70 câu hỏi
- Duration: ~160 phút

### Dữ Liệu Người Dùng Mẫu

**Admin Accounts (2 accounts):**
- admin@aptis.local / password123 (Quản trị viên chính)
- admin2@aptis.local / password123

**Teacher Accounts (3 accounts):**
- teacher1@aptis.local / password123 (Giáo viên 1)
- teacher2@aptis.local / password123 (Giáo viên 2)
- teacher3@aptis.local / password123 (Giáo viên 3)

**Notes:**
- Tất cả passwords đều hash với bcrypt trước khi lưu
- Không seed student accounts (học viên tự đăng ký)

### Các Hằng Số Chính (Constants)

**JWT Configuration:**
- JWT_EXPIRES_IN: 24 giờ
- REFRESH_TOKEN_EXPIRES_IN: 7 ngày
- JWT_SECRET: (từ env)

**Scoring Constants:**
- Max score cho câu hỏi: 10 điểm (mặc định)
- Passing score: 60% của total_score
- Timeout auto-grading: 5 giây
- Timeout AI grading: 30 giây

**Email Configuration:**
- SMTP_PORT: 587
- SMTP_SECURE: false (dùng STARTTLS)
- Retry: 5 lần

**Whisper Configuration:**
- Model size: tiny (để test nhanh, ~100MB)
- Device: cpu
- Languages: en, vi (English + Vietnamese)

**Storage Configuration:**
- Max file size: 50MB
- Allowed types: audio/mpeg, audio/wav, image/jpeg, image/png, text/plain
- Cleanup retention: 90 ngày

**Rate Limiting:**
- Login: 100 requests/15 phút
- Upload: 5 requests/phút
- API general: 1000 requests/giờ

### Lệnh Chạy

```bash
# Khởi tạo database (tạo tables + seed tất cả data)
npm run seed

# Hoặc từng bước:
npm run seed:init        # Tạo tables
npm run seed:types       # Seed aptis_types, skill_types, question_types
npm run seed:exams       # Seed 3 bài thi mẫu
npm run seed:criteria    # Seed AI criteria
npm run seed:users       # Seed admin & teacher accounts

# Reset database (xóa tất cả, seed lại)
npm run seed:reset
```

### Xác Minh Data

Sau khi seed hoàn thành, kiểm tra:
- `SELECT COUNT(*) FROM users;` → 5 (2 admin + 3 teacher)
- `SELECT COUNT(*) FROM exams;` → 3
- `SELECT COUNT(*) FROM exam_section_questions;` → 50-80
- `SELECT COUNT(*) FROM ai_scoring_criteria;` → ~30
- `SELECT COUNT(*) FROM question_types;` → 20+

### Ghi Chú Quan Trọng

1. **Immutable Seed Data**: `aptis_types`, `skill_types`, `question_types` không thể thay đổi qua API.
2. **Modifiable Seed Data**: `ai_scoring_criteria` có thể được teacher thêm/sửa qua API.
3. **Sample Data**: Tất cả câu hỏi, bài thi, tài khoản đều là dữ liệu mẫu, có thể xóa bất kỳ lúc nào.
4. **Production**: Trước khi deploy production, cần:
   - Thay đổi passwords mặc định
   - Tạo bài thi thực tế thay vì sample
   - Xóa test accounts
   - Cấu hình email từ production account (không dùng test Gmail)

