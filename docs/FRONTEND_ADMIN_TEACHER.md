# HỆ THỐNG FRONTEND - GIÁO VIÊN & QUẢN TRỊ (MUI + Next.js)

## 1. CẤU TRÚC DỰ ÁN

```
frontend-admin-teacher/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.jsx
│   │   │   └── forgot-password/page.jsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.jsx           # TeacherAdminLayout (thanh dưới/sidebar)
│   │   │   │
│   │   │   ├── dashboard/page.jsx   # Trang chủ giáo viên/quản trị
│   │   │   │
│   │   │   ├── teacher/
│   │   │   │   ├── questions/page.jsx         # Danh sách câu hỏi
│   │   │   │   ├── questions/new/page.jsx     # Tạo câu mới
│   │   │   │   ├── questions/[qId]/page.jsx  # Chỉnh sửa câu
│   │   │   │   ├── exams/page.jsx            # Danh sách bài thi
│   │   │   │   ├── exams/new/page.jsx        # Tạo bài thi
│   │   │   │   ├── exams/[examId]/page.jsx   # Chỉnh sửa bài thi (kéo-thả)
│   │   │   │   ├── criteria/page.jsx         # Tiêu chí chấm điểm
│   │   │   │   ├── submissions/page.jsx      # Xem xét nộp bài (Writing/Speaking)
│   │   │   │   ├── submissions/[attemptId]/page.jsx # Chi tiết xem xét
│   │   │   │   ├── reports/page.jsx          # Báo cáo học viên/bài thi
│   │   │   │   └── reports/[reportId]/page.jsx # Báo cáo chi tiết
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── users/page.jsx            # Quản lý người dùng
│   │   │   │   ├── users/[userId]/page.jsx  # Chỉnh sửa người dùng
│   │   │   │
│   │   │   └── profile/page.jsx      # Hồ sơ người dùng
│   │   │
│   │   └── error.jsx / not-found.jsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx, BottomNav.jsx, Layout.jsx
│   │   │   ├── RoleGuard.jsx, LoadingSpinner.jsx
│   │   │   ├── ConfirmDialog.jsx, AlertSnackbar.jsx
│   │   │   └── Breadcrumb.jsx
│   │   │
│   │   ├── teacher/
│   │   │   ├── questions/
│   │   │   │   ├── QuestionList.jsx, QuestionCard.jsx
│   │   │   │   ├── QuestionForm.jsx, MCQForm.jsx
│   │   │   │   ├── MatchingForm.jsx, GapFillingForm.jsx
│   │   │   │   ├── OrderingForm.jsx, WritingPromptForm.jsx
│   │   │   │   └── SpeakingTaskForm.jsx, QuestionPreview.jsx
│   │   │   │
│   │   │   ├── exams/
│   │   │   │   ├── ExamList.jsx, ExamCard.jsx, ExamForm.jsx
│   │   │   │   ├── ExamBuilder.jsx (Kéo-thả câu hỏi)
│   │   │   │   ├── SectionEditor.jsx, QuestionSelector.jsx
│   │   │   │   ├── ExamPreview.jsx, PublishExam.jsx
│   │   │   │
│   │   │   ├── criteria/
│   │   │   │   ├── CriteriaList.jsx, CriteriaCard.jsx
│   │   │   │   ├── CriteriaForm.jsx, CriteriaPreview.jsx
│   │   │   │   └── RubricDisplay.jsx
│   │   │   │
│   │   │   ├── submissions/
│   │   │   │   ├── SubmissionList.jsx, SubmissionFilters.jsx
│   │   │   │   ├── SubmissionCard.jsx
│   │   │   │   ├── WritingReview.jsx (Xem nộp bài viết + chấm)
│   │   │   │   ├── SpeakingReview.jsx (Xem nộp bài nói + chấm)
│   │   │   │   ├── FeedbackForm.jsx, ScoreInput.jsx
│   │   │   │   ├── TextWithMarkup.jsx (Đánh dấu lỗi trên văn bản)
│   │   │   │   └── AudioPlayer.jsx
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── ReportList.jsx, ReportCard.jsx
│   │   │       ├── StudentProgressReport.jsx
│   │   │       ├── ExamStatistics.jsx, PerformanceChart.jsx
│   │   │       └── ReportExport.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   ├── UserList.jsx, UserCard.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   └── UserStatusToggle.jsx
│   │   │
│   │   └── shared/
│   │       ├── DataTable.jsx (Bảng chủ đạo)
│   │       ├── AdvancedFilters.jsx, DateRangePicker.jsx
│   │       ├── ExportButton.jsx, ImportDialog.jsx
│   │       └── FormHelpers.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js, useFetch.js, useForm.js
│   │   ├── useDataTable.js, usePagination.js
│   │   ├── useFileUpload.js, useNotification.js
│   │   └── useLocalStorage.js
│   │
│   ├── services/
│   │   ├── api.js, authService.js
│   │   ├── teacherService.js, adminService.js
│   │   ├── fileService.js, reportService.js
│   │   └── exportService.js
│   │
│   ├── store/
│   │   ├── slices/ (authSlice.js, dataSlice.js, uiSlice.js)
│   │   └── store.js
│   │
│   ├── utils/
│   │   ├── constants.js, formatters.js, validators.js
│   │   ├── dateUtils.js, fileUtils.js, exportHelpers.js
│   │   └── helpers.js
│   │
│   ├── styles/
│   │   ├── globals.css, dashboard.css, forms.css
│   │   ├── tables.css, theme.js, variables.css
│   │
│   └── config/
│       ├── api.config.js, app.config.js
│
├── public/ (images/, icons/)
├── .env.local, next.config.js, package.json, README.md
```

---

## 2. TRANG CHÍNH - GIÁO VIÊN

### 2.1. Trang chủ giáo viên

**Phần thống kê** (card): Số học viên được dạy, Tổng bài thi, Xem xét chờ (Writing/Speaking), Bài đăng lên hôm nay. Hoạt động gần đây: Xem xét mới nhất (avatar, lần làm), Bài thi mới nhất (tên, ngày tạo), Gợi ý: "Còn X nộp bài cần xem xét", "Thêm Y bài thi vào học viên Z". Tab: Tất cả, Chờ xem xét, Hôm nay.

---

### 2.2. Quản lý câu hỏi

**Danh sách câu hỏi**: Tìm kiếm (tên), Lọc (loại APTIS, kỹ năng, loại câu, độ khó, trạng thái). Bảng: STT, Tên, Loại, Kỹ năng, Độ khó, Số lần dùng, Lần chỉnh sửa cuối, Hành động (Xem trước, Chỉnh sửa, Xóa). Phân trang.

**Xem trước**: Modal hiển thị câu đầy đủ, Đáp án, Giải thích, Loại APTIS, Kỹ năng, Độ khó. Nút Chỉnh sửa, Xóa, Đóng.

**Tạo/Chỉnh sửa câu**: Form chọn loại câu (MCQ, Matching, Gap Filling, Ordering, Writing, Speaking). Trường chung: Tên câu, Loại APTIS (dropdown), Kỹ năng (dropdown), Độ khó (easy/medium/hard), Mô tả, Hình ảnh (tùy chọn). Trường loại riêng:

- **MCQ**: Văn bản câu, 4 tuỳ chọn (A/B/C/D), Radio chọn đáp án, Giải thích, Nút thêm tuỳ chọn.
- **Matching**: Bảng (Trái, Phải), 4-6 hàng, Nút thêm/xóa hàng, Giải thích.
- **Gap Filling**: Văn bản (dùng [1], [2] cho chỗ trống), 4-6 tuỳ chọn, Giải thích.
- **Ordering**: Danh sách (drag để sắp xếp), 4-6 item, Chỉ mục đúng, Giải thích.
- **Writing**: Prompt (văn bản), Từ tối thiểu, Từ tối đa, Gợi ý, Tiêu chí chấm điểm (link), Giải thích.
- **Speaking**: Task (text), Thời gian ghi lên, Hướng dẫn, Tiêu chí chấm (link), Giải thích.

Nút: Lưu, Lưu & tiếp, Huỷ Xem trước cạnh.

---

### 2.3. Quản lý bài thi

**Danh sách bài thi**: Tìm kiếm, Lọc (APTIS, kỹ năng, ngày tạo, trạng thái). Bảng: Tên, Loại, Kỹ năng, Thời lượng, Số phần, Số câu, Trạng thái (Bản nháp/Công khai), Hành động (Xem, Chỉnh sửa, Xóa). Phân trang.

**Tạo/Chỉnh sửa bài thi**: Form (Tên, APTIS, Thời lượng, Mô tả). Kéo-thả phần thi:

**Kéo-thả giao diện**: 
- **Bên trái**: Danh sách phần (Part 1, Part 2, v.v.), Nút thêm phần, Chỉnh sửa (tên, mô tả).
- **Giữa**: Trường chủ yếu, Danh sách câu trong phần (kéo để thay đổi vị trí), Nút xóa khỏi bài.
- **Bên phải**: Danh sách câu sẵn có (search, lọc), Kéo vào bên giữa để thêm.
- Chi tiết: Số lượng, Điểm tối đa/câu (tùy chỉnh), Thể hiện đầu cục (Part header, Hướng dẫn).

**Xem trước bài**: Hiển thị layout, Thời lượng, Số câu, Phần. Nút chỉnh sửa, công khai, tạo.

---

### 2.4. Quản lý tiêu chí chấm điểm

**Danh sách tiêu chí**: Lọc (loại câu, APTIS, kỹ năng). Bảng: Tên, Loại câu, Loại APTIS, Điểm tối đa, Bản mô tả ngắn, Hành động (Xem, Chỉnh sửa, Xóa).

**Tạo/Chỉnh sửa tiêu chí**: Chọn loại câu (Writing, Speaking). Form: Tên, APTIS, Kỹ năng, Điểm tối đa. Rubric bảng: Tiêu chí, Mô tả (3-5 mức), Điểm trên mức. Ví dụ:

| Tiêu chí | Yếu (0) | Trung bình (1) | Tốt (2) |
| --- | --- | --- | --- |
| Văn pháp | Lỗi nhiều | 1-2 lỗi | Không lỗi |
| Từ vựng | Đơn giản | Phù hợp | Tinh tế |

Nút: Lưu, Xem trước, Hủy.

---

### 2.5. Xem xét nộp bài (Writing & Speaking)

**Danh sách xem xét**: Lọc (loại kỹ năng, học viên, bài thi, trạng thái). Bảng: Học viên, Bài thi, Kỹ năng, Ngày nộp, Điểm AI, Trạng thái (Chờ, Xong, Ghi đè), Hành động (Xem, Xóa). Phân trang.

**Chi tiết xem xét Writing**:
- **Bên trái**: Bài viết (read-only), Phiên âm nếu có lỗi chính tả.
- **Trung tâm**: Điểm AI (từng tiêu chí), Thẻ phát hiện lỗi, Bình luận AI.
- **Bên phải**: Form chấm (điểm/tiêu chí input), Feedback text area (lỡi ngôn ngữ, điểm mạnh), Nút ghi đè điểm, Nút gửi.

**Đánh dấu lỗi trên văn bản**: Chọn text → Chọn loại lỗi (từ vựng, ngữ pháp, v.v.) → Thêm bình luận → Lưu. Hiển thị lỗi dưới dạng highlight.

**Chi tiết xem xét Speaking**: 
- Trình phát audio (hiển thị đoạn), Phiên âm, Điểm AI.
- Form chấm, Feedback, Ghi đè, Gửi (giống Writing).

---

### 2.6. Báo cáo

**Danh sách báo cáo** (Auto-generated): Lọc (học viên, bài thi). Bảng: Tên, Loại, Học viên/Bài thi, Ngày tạo, Hành động (Xem, Tải). Phân trang. Chỉ xem và tải, không tạo mới hoặc xóa.

**Báo cáo học viên** (Auto-generated từ dữ liệu attempt): Tên học viên, Tổng lượt làm, Điểm trung bình. Biểu đồ đường (xu hướng điểm). Bảng: Bài thi, Ngày, Điểm.

**Báo cáo bài thi** (Auto-generated từ dữ liệu exam attempt): Tên bài, Tổng lần làm, Điểm trung bình, Phân chia điểm từng phần. Biểu đồ cột (điểm từng kỹ năng). Bảng: Học viên, Điểm.

**Tải xuống**: PDF, Excel, CSV.

---

## 3. TRANG CHÍNH - QUẢN TRỊ

### 3.1. Quản lý người dùng

**Danh sách người dùng**: Tìm kiếm (email, họ tên), Lọc (vai trò: admin/giáo viên/học viên, trạng thái: hoạt động/tạm khóa). Bảng: Email, Họ tên, Vai trò, Ngày tạo, Trạng thái, Hành động (Xem, Chỉnh sửa, Xóa). Phân trang.

**Tạo/Chỉnh sửa người dùng**: Form (Email, Họ tên, Vai trò, Mật khẩu tạm, Trạng thái, Ghi chú). Nút: Lưu, Xóa, Hủy.

## 4. CHI TIẾT - XEM XÉT NỘP BÀI (WRITING & SPEAKING)

### Danh sách xem xét

**Danh sách xem xét

**Danh sách**: Lọc (loại kỹ năng: writing/speaking, học viên, bài thi, trạng thái). Bảng: Học viên, Bài thi, Kỹ năng, Ngày nộp, Điểm AI, Trạng thái (Chờ review/Đã xem xét/Ghi đè), Hành động (Xem, Xóa). Phân trang.

**GHI CHÚ:** 
- Danh sách chỉ hiển thị bài nộp có needs_review=true (AI đánh dấu cần xem xét hoặc học viên submit Writing/Speaking)
- Không bao gồm MCQ, Matching, Gap Filling (vì được auto-score ngay)

**Chi tiết xem xét Writing**:
- **Bên trái**: Bài viết (read-only), Font readable, Thể hiện vùng đã được AI đánh dấu.
- **Trung tâm**: 
  - Điểm AI (mỗi tiêu chí - từ answer_ai_feedbacks table): Tiêu chí, Điểm, Max điểm, Feedback
  - Thẻ phát hiện lỗi từ AI: Loại lỗi, Vị trí, Gợi ý
  - Bình luận AI tổng hợp
- **Bên phải**: 
  - Form chấm: Điểm từng tiêu chí (input), Điểm cuối cùng (tự động tính)
  - Feedback text area (giáo viên bình luận)
  - Nút ghi đè điểm, Nút gửi

**Đánh dấu lỗi trên văn bản**: Chọn text → Chọn loại lỗi (từ vựng, ngữ pháp, v.v.) → Thêm bình luận → Lưu. Hiển thị lỗi dưới dạng highlight (màu sắc theo loại).

**Chi tiết xem xét Speaking**: 
- Trình phát audio (hiển thị đoạn), Phiên âm từ transcribed_text
- Điểm AI (mỗi tiêu chí)
- Form chấm, Feedback, Ghi đè, Gửi (giống Writing)

---

## 5. UI/UX COMPONENTS (MUI)

**Thành phần chung**: AppBar, Drawer (sidebar), Card, Button, Bảng (DataTable), Dialog, TextField, Select, DatePicker, FileUpload, ProgressBar, Chip, Badge, Snackbar, Alert.

**Thành phần tùy chỉnh**: DragDropBuilder (kéo-thả), TextWithMarkup (đánh dấu), AudioPlayer, RichTextEditor, CriteriaRubric, ReportChart.

---

## 6. LUỒNG CHÍNH & SCORING LOGIC

**Giáo viên - Tạo bài thi**:
1. Tạo câu → Nhập khối câu hoặc tạo từng câu (chọn loại, nhập nội dung, chọn độ khó).
2. Tạo bài thi → Kéo-thả câu vào phần (mỗi phần có kỹ năng riêng).
3. Công khai bài thi → Học viên thấy và bắt đầu làm (full_exam hoặc single_skill).
4. Nhận nộp bài → Auto-scoring cho MCQ/Matching, AI-scoring cho Writing/Speaking (bất đồng bộ qua Bull queue).
5. Xem xét Writing/Speaking → Đánh dấu lỗi, chỉnh sửa feedback, ghi đè điểm.
6. Gửi kết quả → Học viên nhận thông báo.

**Giáo viên - Xem xét & Chấm điểm**:
1. Danh sách chờ xem xét (needs_review=true từ AI).
2. Chọn bài nộp (Writing/Speaking).
3. Xem điểm AI (từ answer_ai_feedbacks), Phản hồi AI.
4. Đánh dấu lỗi / Thêm feedback cá nhân.
5. Ghi đè điểm (final_score), Gửi → Học viên nhận thông báo.

**Quản trị - Quản lý người dùng**:
1. Tạo, chỉnh sửa, xóa tài khoản người dùng (admin, teacher, student).
2. Cấp quyền và quản lý trạng thái người dùng.

### Quy trình Scoring chi tiết:

**Auto-Scoring (MCQ, Matching, Gap Filling, Ordering)**:
1. Học viên submit → Backend gọi ScoringService
2. Tính điểm tự động → Cập nhật attempt_answers (score, auto_graded_at='NOW', graded_by='auto')
3. Tổng điểm tự động cập nhật (nếu tất cả câu hoàn thành)

**AI-Scoring (Writing, Speaking)**:
1. Học viên submit → Backend push job vào Bull queue (score-writing hoặc score-speaking)
2. Background job lấy tiêu chí từ ai_scoring_criteria (filter: aptis_type, question_type)
3. Gọi Gemini API để chấm theo từng criterion
4. Lưu kết quả: answer_ai_feedbacks (chi tiết từng criterion) + attempt_answers (tổng score, ai_graded_at)
5. Nếu cần review → flags needs_review=true
6. Giáo viên xem xét → Ghi đè final_score hoặc giữ score từ AI
7. Tổng điểm cập nhật khi tất cả câu hoàn thành

**Total Score Calculation**:
- exam_attempts.total_score = SUM(attempt_answers.final_score hoặc score)
- Chỉ tính khi tất cả câu hỏi của attempt_type (full_exam hoặc single_skill) hoàn thành

---

## 7. THIẾT KẾ RESPONSIVE

- **Desktop**: Drawer, Bảng rộng, Biểu đồ lớn, Kéo-thả.
- **Tablet**: Drawer thu gọn, Bảng cuộn ngang, Bố cục vừa.
- **Mobile**: Drawer (collapse/drawer modal), Bảng collapse thành card, Dialog kéo-thả.

---

## 8. THÔNG BÁO
- Tạo/cập nhật câu/bài thi thành công.