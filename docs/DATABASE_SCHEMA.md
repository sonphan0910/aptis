# DATABASE SCHEMA - HỆ THỐNG APTIS

## 1. QUẢN LÝ NGƯỜI DÙNG

### users
Lưu thông tin tài khoản người dùng
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
email: VARCHAR(255) UNIQUE NOT NULL
password_hash: VARCHAR(255) NOT NULL
full_name: VARCHAR(255) NOT NULL
role: ENUM('admin', 'teacher', 'student') NOT NULL
phone: VARCHAR(20)
avatar_url: VARCHAR(500)
status: ENUM('active', 'inactive', 'banned') DEFAULT 'active'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
last_login: TIMESTAMP NULL
```


**Quên mật khẩu:**
- Khi người dùng yêu cầu quên mật khẩu, hệ thống sẽ generate một mật khẩu tạm thời, gửi vào email cho người dùng.
- Người dùng đăng nhập bằng mật khẩu tạm thời này và được yêu cầu đổi mật khẩu mới ngay sau khi đăng nhập.


## 2. QUẢN LÝ LOẠI APTIS VÀ CẤU TRÚC THI

### aptis_types
Các loại kỳ thi APTIS
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
code: VARCHAR(50) UNIQUE NOT NULL -- Mã định danh loại kỳ thi (VD: aptis_general, aptis_advanced)
aptis_type_name: VARCHAR(255) NOT NULL -- Tên loại kỳ thi
description: TEXT
is_active: BOOLEAN DEFAULT TRUE
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**GHI CHÚ:**
- aptis_types là **dữ liệu seed mặc định**, không thể thêm/sửa qua API.
- Các loại kỳ thi được cấu hình cứng khi khởi tạo database và không thể modify qua giao diện quản trị.

**Danh sách aptis_types (Seed Data):**
- `aptis_general` | Aptis General
- `aptis_advanced` | Aptis Advanced
- `aptis_for_teachers` | Aptis for Teachers
- `aptis_for_teens` | Aptis for Teens

### skill_types
Các kỹ năng chính trong APTIS
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
code: VARCHAR(50) UNIQUE NOT NULL -- Mã định danh kỹ năng (VD: grammar_vocabulary, reading)
skill_type_name: VARCHAR(100) NOT NULL -- Tên kỹ năng
description: TEXT
display_order: INT
```

**GHI CHÚ:**
- skill_types là **dữ liệu seed mặc định**, không thể thêm/sửa qua API. Mỗi kỹ năng cần xử lý riêng trên backend + frontend.
- Nếu cần bổ sung kỹ năng mới, phải thiết kế:
  - Backend: Logic tính điểm kỹ năng, xử lý dữ liệu
  - Frontend: Component hiển thị kỹ năng, biểu đồ, thống kê
  - Hàm helper tính toán điểm
  - Tiêu chí chấm điểm AI (nếu dùng AI)

**Danh sách skill_types (Seed Data):**
- `grammar_vocabulary` | Grammar & Vocabulary
- `reading` | Reading
- `writing` | Writing
- `listening` | Listening
- `speaking` | Speaking

### question_types
Các dạng câu hỏi trong APTIS (dùng chung cho tất cả loại APTIS - toàn cục)
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
skill_type_id: INT NOT NULL -> skill_types(id)
code: VARCHAR(100) UNIQUE NOT NULL -- Mã định danh dạng câu hỏi (VD: mcq_grammar, fill_blanks)
question_type_name: VARCHAR(255) NOT NULL -- Tên dạng câu hỏi
description: TEXT
instruction_template: TEXT -- Hướng dẫn mẫu cho dạng câu hỏi
scoring_method: ENUM('auto', 'ai', 'manual') NOT NULL
```

**GHI CHÚ:**
- question_types là **dữ liệu seed mặc định**, không thể thêm/sửa qua API. Mỗi dạng câu hỏi cần logic xử lý riêng trên backend + frontend.
- Nếu cần bổ sung dạng câu hỏi mới, phải thiết kế:
  - Backend: Logic chấm điểm, chuyển đổi dạng dữ liệu
  - Frontend: Component hiển thị, input xử lý
  - Hàm helper xử lý data, gửi/nhận từ API
  - Tiêu chí chấm điểm AI (nếu dùng AI)
- Tiêu chí chấm điểm riêng cho từng loại APTIS được định nghĩa ở bảng `ai_scoring_criteria`

**Danh sách question_types chi tiết (Seed Data):**

**Grammar & Vocabulary:**
- `mcq_grammar` | Multiple Choice
- `fill_blanks` | Fill in the Blanks
- `sentence_transform` | Sentence Transformation
- `word_matching` | Word Matching

**Reading:**
- `matching_headings` | Matching Headings
- `multiple_choice_reading` | Multiple Choice
- `gap_filling_reading` | Gap Filling
- `ordering_paragraphs` | Ordering Paragraphs

**Listening:**
- `conversation_mcq` | Conversation - Multiple Choice
- `listening_note_completion` | Note Completion
- `matching_info_listening` | Matching Information
- `long_monologue` | Long Monologue

**Writing:**
- `short_sentence` | Short Sentence
- `email_writing` | Email Writing
- `opinion_essay` | Opinion Essay
- `situation_response` | Situation Response

**Speaking:**
- `personal_question` | Personal Question
- `describe_image` | Describe Image
- `express_opinion` | Express Opinion
- `compare_analyze` | Compare & Analyze

## 3. NGÂN HÀNG CÂU HỎI

### questions
Câu hỏi tổng quát
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
question_type_id: INT NOT NULL -> question_types(id)
aptis_type_id: INT NOT NULL -> aptis_types(id)
difficulty: ENUM('easy', 'medium', 'hard') NOT NULL
content: TEXT NOT NULL -- Nội dung câu hỏi (text, prompt)
media_url: VARCHAR(500) NULL -- Audio/image URL nếu có
duration_seconds: INT NULL -- Thời gian làm bài (cho speaking/writing)
created_by: INT NOT NULL -> users(id)
status: ENUM('draft', 'active', 'archived') DEFAULT 'draft'
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### question_items
Các mục/dòng nhỏ trong câu hỏi lớn (dùng cho matching, gap filling, ordering, v.v.)
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
question_id: INT NOT NULL -> questions(id)
item_text: TEXT NULL -- Nội dung mục (từ/cụm từ/câu/đoạn văn)
item_order: INT NOT NULL -- Thứ tự mục trong câu hỏi
correct_option_id: INT NULL -> question_options(id) -- Đáp án đúng (dùng cho matching)
answer_text: TEXT NULL -- Đáp án dạng text (dùng cho gap filling/cloze)
UNIQUE(question_id, item_order)
```

### question_options
Các lựa chọn cho câu hỏi (MCQ, matching, fill blanks)
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
question_id: INT NOT NULL -> questions(id)
item_id: INT NULL -> question_items(id) -- NULL nếu là tùy chọn chung; NOT NULL nếu là cho mục cụ thể
option_text: TEXT NOT NULL
option_order: INT NOT NULL
is_correct: BOOLEAN DEFAULT FALSE
```

### question_sample_answers
Đáp án mẫu/tham khảo cho câu hỏi tự luận (Writing, Speaking) - mỗi câu hỏi chỉ có 1 mẫu đáp án
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
question_id: INT UNIQUE NOT NULL -> questions(id)
sample_answer: TEXT NOT NULL
answer_key_points: JSON -- Các điểm chính cần có trong câu trả lời
min_words: INT NULL
max_words: INT NULL
min_duration_seconds: INT NULL -- Thời lượng tối thiểu cho Speaking
max_duration_seconds: INT NULL
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### ai_scoring_criteria
Tiêu chí chấm điểm AI cho từng loại câu hỏi và từng loại APTIS
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
aptis_type_id: INT NOT NULL -> aptis_types(id) -- Loại APTIS áp dụng
question_type_id: INT NOT NULL -> question_types(id)
criteria_name: VARCHAR(255) NOT NULL -- VD: 'task_achievement', 'grammar_accuracy'
weight: DECIMAL(5,2) NOT NULL -- Trọng số (%)
description: TEXT
rubric_prompt: TEXT NOT NULL -- Prompt cho AI Gemini
max_score: INT DEFAULT 10
created_by: INT NOT NULL -> users(id)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
UNIQUE(aptis_type_id, question_type_id, criteria_name)
```

**GHI CHÚ:**
- ai_scoring_criteria có **seed data mặc định**, nhưng **có thể thêm/sửa qua API**.
- Dùng để cấu hình prompt cho AI Gemini khi chấm bài Writing/Speaking.
- Admin có thể tạo thêm tiêu chí riêng theo nhu cầu hoặc điều chỉnh prompt để cải thiện chất lượng chấm điểm.

**Danh sách Seed Data ai_scoring_criteria:**

**Aptis General - Writing (short_sentence, email_writing, opinion_essay, situation_response):**
- Task Achievement (30%) - Hoàn thành yêu cầu, độ liên quan nội dung
- Lexical Range (20%) - Vốn từ vựng, sử dụng từ phức tạp
- Grammatical Accuracy (30%) - Chính xác ngữ pháp, cấu trúc câu
- Coherence & Cohesion (20%) - Liên kết ý tưởng, tổ chức bài viết

**Aptis General - Speaking (personal_question, describe_image, express_opinion, compare_analyze):**
- Task Achievement (30%) - Trả lời đầy đủ, đúng nội dung
- Vocabulary (20%) - Từ vựng phù hợp, đa dạng
- Grammatical Accuracy (25%) - Dùng câu đúng, không lỗi ngữ pháp
- Fluency & Coherence (15%) - Nói mượt, tự nhiên, kết nối ý
- Pronunciation (10%) - Phát âm rõ, dễ hiểu

**Aptis Advanced - Writing (opinion_essay, situation_response):**
- Task Achievement (25%) - Hoàn thành yêu cầu, phân tích sâu
- Lexical Range (25%) - Từ vựng cao cấp, chuyên ngành
- Grammatical Accuracy (30%) - Ngữ pháp phức tạp, chính xác
- Coherence & Cohesion (20%) - Tổ chức logic, luận điểm rõ ràng

**Aptis Advanced - Speaking (express_opinion, compare_analyze):**
- Task Achievement (25%) - Phân tích kỹ, lập luận convincing
- Vocabulary (25%) - Từ vựng cao cấp, thuần thục
- Grammatical Accuracy (25%) - Cấu trúc phức tạp, chính xác
- Fluency & Coherence (15%) - Nói tự nhiên, không lag
- Pronunciation (10%) - Phát âm native-like

## 4. QUẢN LÝ BÀI THI

### exams
Đề thi thử
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
aptis_type_id: INT NOT NULL -> aptis_types(id)
title: VARCHAR(255) NOT NULL
description: TEXT
duration_minutes: INT NOT NULL -- Tổng thời gian làm bài
total_score: DECIMAL(5,2) NOT NULL
status: ENUM('draft', 'published', 'archived') DEFAULT 'draft'
created_by: INT NOT NULL -> users(id)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
published_at: TIMESTAMP NULL
```

### exam_sections
Các phần thi trong 1 đề (mỗi phần ứng với 1 skill/kỹ năng, 1 skill có thể có nhiều sections)
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
exam_id: INT NOT NULL -> exams(id)
skill_type_id: INT NOT NULL -> skill_types(id) 
section_order: INT NOT NULL -- Thứ tự section của skill này trong exam
duration_minutes: INT NOT NULL
instruction: TEXT
```

**GHI CHÚ:**
- 1 skill có thể bao gồm nhiều sections. VD: Reading Section 1 (Matching Headings), Reading Section 2 (Multiple Choice), Reading Section 3 (Gap Filling)
- section_order dùng để sắp xếp các sections của cùng 1 skill trong 1 đề thi

### exam_section_questions
Câu hỏi trong từng phần thi
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
exam_section_id: INT NOT NULL -> exam_sections(id)
question_id: INT NOT NULL -> questions(id)
question_order: INT NOT NULL
max_score: DECIMAL(5,2) NOT NULL -- Điểm tối đa cho câu hỏi này
UNIQUE(exam_section_id, question_id)
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 5. BÀI LÀM VÀ KẾT QUẢ

### exam_attempts
Lượt làm bài thi của học viên (cho phép làm lại bài thi nhiều lần, chọn cả bài hoặc 1 skill duy nhất)
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
student_id: INT NOT NULL -> users(id)
exam_id: INT NOT NULL -> exams(id)
attempt_type: ENUM('full_exam', 'single_skill') NOT NULL DEFAULT 'full_exam'
selected_skill_id: INT NULL -> skill_types(id) -- NULL nếu full_exam, NOT NULL nếu single_skill
attempt_number: INT NOT NULL DEFAULT 1 -- Lần thứ bao nhiêu (1, 2, 3...)
start_time: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
end_time: TIMESTAMP NULL
status: ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress'
total_score: DECIMAL(5,2) NULL
UNIQUE(student_id, exam_id, attempt_number, attempt_type)
```

**GHI CHÚ:**
- `attempt_type` xác định học viên làm cả bài (`full_exam`) hay chỉ 1 skill (`single_skill`)
- Nếu `single_skill`: học viên phải hoàn thành TẤT CẢ sections của skill đó
- Nếu `full_exam`: học viên phải hoàn thành TẤT CẢ sections của TẤT CẢ skills
- Không cho phép chọn skill một cách tùy ý (tick vào skill A, B nhưng bỏ qua C)
- Chỉ lưu điểm số, học viên tự tham khảo bảng chuẩn CEFR để xác định level

### attempt_sections
Các phần thi mà học viên đã chọn làm trong một lượt thi (cho phép làm từng skill riêng lẻ)
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
attempt_id: INT NOT NULL -> exam_attempts(id)
exam_section_id: INT NOT NULL -> exam_sections(id)
started_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
completed_at: TIMESTAMP NULL
section_status: ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress'
section_score: DECIMAL(5,2) NULL
UNIQUE(attempt_id, exam_section_id)
```

**GHI CHÚ:**
- Bảng này cho phép học viên chọn làm từng skill/section riêng lẻ thay vì phải làm cả đề thi.
- Khi học viên làm xong 1 section, thay vì phải submit cả bài thi, họ có thể submit và qua section tiếp theo.
- Điều này hữu ích cho học viên muốn tập luyện từng kỹ năng một.

### attempt_answers
Câu trả lời của học viên cho từng câu hỏi
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
attempt_id: INT NOT NULL -> exam_attempts(id)
question_id: INT NOT NULL -> questions(id)
answer_type: ENUM('mcq', 'text', 'audio') NOT NULL
-- mcq: MCQ, Matching (word_matching, matching_headings), Ordering, Long Monologue -> selected_option_id
-- text: Writing, Gap Filling, Note Completion -> text_answer hoặc answer_json
-- audio: Speaking -> audio_url
selected_option_id: INT NULL -> question_options(id)
answer_json: JSON NULL -- Dùng cho matching, ordering: {item_id: option_id, ...}
text_answer: TEXT NULL -- Dùng cho Writing, Gap Filling, Note Completion
audio_url: VARCHAR(500) NULL -- Dùng cho Speaking
transcribed_text: TEXT NULL -- Text từ speech-to-text cho Speaking
score: DECIMAL(5,2) NULL -- Điểm tự động hoặc AI tính
max_score: DECIMAL(5,2) NOT NULL -- Điểm tối đa (lấy từ exam_section_questions)
ai_feedback: JSON NULL -- Feedback tóm tắt từ AI Gemini
manual_feedback: TEXT NULL -- Feedback thủ công từ giáo viên
graded_by: ENUM('auto', 'ai', 'teacher') NULL -- Ai chấm bài
auto_graded_at: TIMESTAMP NULL -- Khi nào auto-grading hoàn thành
ai_graded_at: TIMESTAMP NULL -- Khi nào AI chấm xong
needs_review: BOOLEAN DEFAULT FALSE -- AI gắn cờ cần review thủ công
reviewed_by: INT NULL -> users(id) -- Giáo viên review (nếu có)
reviewed_at: TIMESTAMP NULL -- Khi nào xem xét
final_score: DECIMAL(5,2) NULL -- Điểm cuối cùng sau khi review (nếu có) hoặc điểm auto/AI
answered_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
UNIQUE(attempt_id, question_id)
```

### answer_ai_feedbacks
Phản hồi chi tiết từ AI cho từng tiêu chí chấm điểm (chỉ cho Writing và Speaking)
```sql
id: INT PRIMARY KEY AUTO_INCREMENT
answer_id: INT NOT NULL -> attempt_answers(id)
criteria_id: INT NOT NULL -> ai_scoring_criteria(id)
score: DECIMAL(5,2) NOT NULL
max_score: DECIMAL(5,2) NOT NULL
comment: TEXT
suggestions: TEXT
strengths: TEXT
weaknesses: TEXT
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**GHI CHÚ:**
- Bảng này chỉ áp dụng cho Writing và Speaking (những câu hỏi có `scoring_method = 'ai'`).
- Các câu hỏi tự động chấm (Grammar, Reading, Listening) không có feedback AI chi tiết.
- Khi tìm criteria để chấm, cần kết hợp: `answer_ai_feedbacks.criteria_id` -> `ai_scoring_criteria(id)` -> kiểm tra `(aptis_type_id, question_type_id)`

---

## 6. TỔNG HỢP LIÊN KẾT NGOẠI KHÓA (Foreign Keys Summary)

**Tổng cộng: 30 Foreign Key relationships**

### Liên kết từ bảng người dùng:
- `users` -> PK của các bảng config

### Liên kết từ bảng cấu hình (Immutable Seed):
- `question_types.skill_type_id` -> `skill_types(id)` [5 question_types]
- `questions.aptis_type_id` -> `aptis_types(id)` [N questions]
- `questions.question_type_id` -> `question_types(id)` [N questions]
- `questions.created_by` -> `users(id)` [N questions]
- `ai_scoring_criteria.aptis_type_id` -> `aptis_types(id)` [seed data]
- `ai_scoring_criteria.question_type_id` -> `question_types(id)` [seed data]
- `ai_scoring_criteria.created_by` -> `users(id)` [seed data]
- `exams.aptis_type_id` -> `aptis_types(id)` [N exams]
- `exams.created_by` -> `users(id)` [N exams]

### Liên kết từ bảng ngân hàng câu hỏi:
- `question_items.question_id` -> `questions(id)` [N items]
- `question_items.correct_option_id` -> `question_options(id)` [N items, optional]
- `question_options.question_id` -> `questions(id)` [N options]
- `question_options.item_id` -> `question_items(id)` [N options, optional]
- `question_sample_answers.question_id` -> `questions(id)` [unique, for Writing/Speaking]

### Liên kết từ bảng quản lý bài thi:
- `exam_sections.exam_id` -> `exams(id)` [N sections]
- `exam_sections.skill_type_id` -> `skill_types(id)` [N sections]
- `exam_section_questions.exam_section_id` -> `exam_sections(id)` [N questions]
- `exam_section_questions.question_id` -> `questions(id)` [N questions]

### Liên kết từ bảng bài làm của học viên:
- `exam_attempts.student_id` -> `users(id)` [N attempts]
- `exam_attempts.exam_id` -> `exams(id)` [N attempts]
- `exam_attempts.selected_skill_id` -> `skill_types(id)` [optional, nếu single_skill]
- `attempt_sections.attempt_id` -> `exam_attempts(id)` [N sections]
- `attempt_sections.exam_section_id` -> `exam_sections(id)` [N sections]
- `attempt_answers.attempt_id` -> `exam_attempts(id)` [N answers]
- `attempt_answers.question_id` -> `questions(id)` [N answers]
- `attempt_answers.selected_option_id` -> `question_options(id)` [optional, for MCQ]
- `attempt_answers.reviewed_by` -> `users(id)` [optional, nếu có teacher review]
- `answer_ai_feedbacks.answer_id` -> `attempt_answers(id)` [N feedbacks]
- `answer_ai_feedbacks.criteria_id` -> `ai_scoring_criteria(id)` [N feedbacks]

**Tổng: 30 FK relationships (tất cả đều được validate)**

---

## 7. CẤU TRÚC DỮ LIỆU CHI TIẾT

### Luồng dữ liệu khi học viên làm bài:

1. **Chọn bài thi:**
   - exam -> exam_attempts (tạo lượt thi với attempt_type=full_exam hoặc single_skill)
   
2. **Làm từng phần thi:**
   - exam_attempts -> attempt_sections (khởi tạo sections theo attempt_type)
   - attempt_sections trỏ đến exam_sections của skill được chọn

3. **Trả lời câu hỏi:**
   - Mỗi câu hỏi trong exam_section_questions được hiển thị
   - exam_section_questions.max_score được dùng để init attempt_answers.max_score
   - attempt_answers lưu answer_type và data tương ứng

4. **Chấm điểm:**
   - Auto: grammar/reading/listening -> attempt_answers.score (auto_graded_at)
   - AI: writing/speaking -> AI chấm + answer_ai_feedbacks (ai_graded_at)
   - Manual: teacher có thể review và cập nhật final_score

5. **Tính tổng điểm:**
   - exam_attempts.total_score = SUM(attempt_answers.final_score hoặc score)
   - Status thay đổi: in_progress -> submitted -> graded

````
