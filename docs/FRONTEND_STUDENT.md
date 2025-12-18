# HỆ THỐNG FRONTEND - HỌC VIÊN (MUI + Next.js)

## 1. CẤU TRÚC DỰ ÁN

```
frontend-student/
├── src/
│   ├── app/                         # App router (Next.js 13+)
│   │   ├── (auth)/                  # Các trang xác thực
│   │   │   ├── login/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   └── forgot-password/page.jsx
│   │   │
│   │   ├── (dashboard)/             # Layout dashboard
│   │   │   ├── layout.jsx           # StudentLayout (thanh dưới hoặc sidebar)
│   │   │   ├── home/page.jsx        # Trang chủ/Dashboard
│   │   │   ├── exams/page.jsx       # Danh sách bài thi
│   │   │   ├── exams/[examId]/page.jsx     # Chi tiết bài thi
│   │   │   ├── exams/[examId]/take/page.jsx # Làm bài thi
│   │   │   ├── results/page.jsx     # Lịch sử kết quả
│   │   │   ├── results/[attemptId]/page.jsx # Tóm tắt kết quả
│   │   │   ├── results/[attemptId]/[questionId]/page.jsx # Feedback câu hỏi
│   │   │   ├── progress/page.jsx    # Dashboard tiến trình
│   │   │   └── profile/page.jsx     # Hồ sơ học viên
│   │   │
│   │   └── error.jsx / not-found.jsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx, BottomNav.jsx, StudentLayout.jsx
│   │   │   ├── AuthLayout.jsx, LoadingSpinner.jsx
│   │   │   └── LoadingProgress.jsx, ConfirmDialog.jsx
│   │   │
│   │   ├── exams/
│   │   │   ├── ExamCard.jsx, ExamList.jsx, ExamFilters.jsx
│   │   │   ├── ExamDetail.jsx, StartExamDialog.jsx, AttemptHistory.jsx
│   │   │
│   │   ├── exam-taking/
│   │   │   ├── ExamHeader.jsx, ExamSidebar.jsx, QuestionDisplay.jsx
│   │   │   ├── MCQQuestion.jsx, MatchingQuestion.jsx, GapFillingQuestion.jsx
│   │   │   ├── OrderingQuestion.jsx, WritingQuestion.jsx, SpeakingQuestion.jsx
│   │   │   ├── AnswerInput.jsx, AudioRecorder.jsx, TextEditor.jsx
│   │   │   ├── SubmitExamDialog.jsx, PauseExamModal.jsx, ExamTimeout.jsx
│   │   │
│   │   ├── results/
│   │   │   ├── ResultsSummary.jsx, SkillScoreCard.jsx, RadarChart.jsx
│   │   │   ├── QuestionFeedback.jsx, WritingFeedback.jsx, SpeakingFeedback.jsx
│   │   │   ├── FeedbackTabs.jsx, DownloadCertificate.jsx
│   │   │
│   │   ├── progress/
│   │   │   ├── StatsOverview.jsx, ProgressChart.jsx, SkillBreakdown.jsx
│   │   │   ├── RecentAttempts.jsx, MilestonesList.jsx, ComparisonChart.jsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileInfo.jsx, SecuritySettings.jsx
│   │   │   ├── PreferencesSettings.jsx, AccountDeletion.jsx
│   │   │
│   │   └── forms/
│   │       ├── TextInput.jsx, PasswordInput.jsx, SelectInput.jsx
│   │       └── FormSubmitButton.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js, useFetch.js, useForm.js, useExam.js
│   │   ├── useTimer.js, useAudio.js, useNotification.js, useLocalStorage.js
│   │
│   ├── services/
│   │   ├── api.js, authService.js, studentService.js
│   │   ├── audioService.js, storageService.js
│   │
│   ├── store/
│   │   ├── slices/ (authSlice.js, examSlice.js, uiSlice.js)
│   │   └── store.js
│   │
│   ├── utils/
│   │   ├── constants.js, formatters.js, validators.js
│   │   ├── timeFormatter.js, scoreCalculator.js, helpers.js
│   │
│   ├── styles/
│   │   ├── globals.css, exam.css, theme.js, variables.css
│   │
│   └── config/
│       ├── api.config.js, app.config.js
│
├── public/ (images/, icons/, audio/)
├── .env.local, next.config.js
├── package.json, README.md
```

## 2. CÁC TRANG CHÍNH & TÍNH NĂNG

### 2.1. Trang xác thực

**Đăng nhập**: Email, mật khẩu, "Nhớ đăng nhập", "Quên mật khẩu?", Link đăng ký, Hiển thị lỗi, Loading state, Tự động chuyển hướng.

**Đăng ký**: Email, mật khẩu, xác nhận, họ tên, số điện thoại, Kiểm tra real-time, Chỉ số mức độ mật khẩu, Điều khoản dịch vụ, Tự động đăng nhập sau khi thành công.

**Quên mật khẩu**: Nhập email, gửi link, Kiểm tra email, Form đặt lại (token + mật khẩu mới), Xác nhận thành công.

### 2.2. Trang chủ/Dashboard

Các card thống kê: Tổng số bài thi, Điểm trung bình, Tiến trình học, Chuỗi ngày học. Hoạt động gần đây: 3 kết quả bài thi, Gợi ý luyện tập. Nút truy cập nhanh: Duyệt bài thi, Tiếp tục luyện tập, Xem kết quả. Xem trước tiến trình: Biểu đồ nhỏ xu hướng điểm.

**GHI CHÚ**: Học viên tự tham khảo bảng chuẩn CEFR dựa trên điểm tổng thể (không lưu trữ trong database).

### 2.3. Duyệt & chọn bài thi

**Danh sách bài thi**: Bộ lọc (APTIS type, kỹ năng, cấp độ, sắp xếp). Danh sách card: Tên, loại APTIS, thời lượng, số câu, cấp độ, nút Bắt đầu/Tiếp tục, số lần làm, điểm tối đa.

**Chi tiết bài thi**: Tiêu đề (tên, APTIS type, thời gian, số câu, kỹ năng). Tab: Tổng quan, Phần thi, Lần làm của bạn. Nút Bắt đầu/Tiếp tục.

### 2.4. Làm bài thi (Tính năng chính)

**Chọn chế độ thi** (attempt_type - lựa chọn nhị phân):
- Dialog xuất hiện: "Bạn muốn làm gì?"
  - "Làm cả bài thi" (attempt_type=full_exam) → Làm tất cả kỹ năng/sections của bài thi
  - "Luyện tập 1 kỹ năng" (attempt_type=single_skill) → Chọn skill từ dropdown → Làm tất cả sections của skill đó
  - **Lưu ý**: Không cho phép chọn kỹ năng tùy ý - chỉ full_exam hoặc single_skill duy nhất
- Nút "Bắt đầu", "Hủy"

**Giao diện**:
- Thanh tiêu đề: Đếm ngược, số câu (X/Y), Thanh tiến trình, Nút tạm dừng, Nút thoát.
- Sidebar (desktop) hoặc dưới (mobile): Danh sách câu hỏi, Trạng thái (chưa làm/đang làm/đã trả lời/bỏ qua), Vị trí cuộn.
- Vùng chính: Hiển thị câu hỏi, Nhập đáp án, Nút Trước/Tiếp theo, Checkbox đánh dấu xem lại.

**Loại câu hỏi**:
- MCQ: Nút radio cho từng tuỳ chọn.
- Matching: 2 cột (mục + tuỳ chọn), Kéo-thả hoặc nhấp để nối.
- Gap Filling: Đoạn văn với chỗ trống, Dropdown hoặc text input.
- Ordering: Danh sách kéo để sắp xếp.
- Writing: Text area lớn, Đếm từ, Thanh công cụ định dạng, Kiểm tra chính tả.
- Speaking: Ghi âm (phát hướng dẫn, bắt đầu/dừng, phát lại, xóa/ghi lại).

**Tính năng**: Tự lưu (30 giây), Cảnh báo hết giờ (5 phút, 1 phút), Cảnh báo đóng tab, Tạm dừng, Hiển thị câu chưa trả lời.

### 2.5. Nộp bài & kết quả

**Xác nhận nộp**: Hiển thị câu chưa trả lời, Hỏi muốn xem lại, Nút "Quay lại" hoặc "Nộp ngay", Xác nhận không thể thay đổi.

**Tóm tắt kết quả** (ngay sau nộp):
- Tổng điểm (to).
- 5 card kỹ năng: Điểm, % của điểm tối đa.
- Biểu đồ radar so sánh 5 kỹ năng.
- Thời gian làm, Chỉ báo lần làm, Attempt type (full_exam/single_skill).
- Tab: Tóm tắt, Phản hồi câu hỏi, So sánh tiến trình.
- Nút: Xem chi tiết, Làm lại, Quay lại.

**GHI CHÚ**: 
- MCQ/Matching/Gap Filling/Ordering: Điểm tức thì (auto_graded_at)
- Writing/Speaking: Chờ AI chấm (ai_graded_at) + có thể được giáo viên review thêm (reviewed_at)

**Phản hồi câu hỏi**: Tab/Accordion chuyển câu hỏi. 
- **MCQ/Matching/Gap Filling/Ordering**: Đáp án của bạn, Đáp án đúng, Kết quả (✓/✗), Điểm, Giải thích.
- **Writing/Speaking**: Phân chia điểm theo tiêu chí, Phản hồi AI chi tiết.

**Chi tiết Writing** (auto/AI-scored):
- Bài viết gốc.
- Điểm AI (score từ answer_ai_feedbacks, tính từ criteria scores).
- **Phân chia tiêu chí** (từ answer_ai_feedbacks): Liệt kê từng tiêu chí (Task Achievement, Vocabulary, Grammar, Coherence, v.v.), điểm từng tiêu chí, nhận xét chi tiết từng tiêu chí, điểm mạnh, đề xuất.
- Nếu `needs_review=true`: Cờ "Chờ xem xét giáo viên".
- Nếu có `reviewed_at`: Phản hồi giáo viên: Điểm cuối cùng (final_score override), Feedback thêm, Thời gian xem xét.
- Nút: Tải PDF, Chia sẻ.

**Chi tiết Speaking** (auto/AI-scored):
- Trình phát audio (audio_url).
- Phiên âm (transcribed_text từ speech-to-text).
- Điểm AI (score từ answer_ai_feedbacks).
- **Phân chia tiêu chí**: Liệt kê từng tiêu chí, điểm, nhận xét, suggestions.
- Nếu `needs_review=true`: Cờ "Chờ xem xét giáo viên".
- Nếu có `reviewed_at`: Phản hồi giáo viên: Điểm override, Nhận xét.
- So sánh với lần làm trước (nếu có).

### 2.6. Tiến trình học tập

Card tổng quan: Tổng bài thi, Điểm trung bình, Tổng thời gian, Chuỗi ngày. Biểu đồ đường: X (ngày), Y (điểm), các dòng màu khác theo kỹ năng. Biểu đồ cột: Điểm trung bình từng kỹ năng, so sánh mục tiêu. Bảng lượt thi: Ngày, Tên, Thời lượng, Điểm. Thành tích: Danh sách unlock, Tiến độ tới mốc tiếp. So sánh: Mức hiện tại vs Mục tiêu (thanh), Thời gian ước tính, Gợi ý luyện tập.

### 2.7. Hồ sơ người dùng

**Phần hồ sơ**: Tải ảnh đại diện (cắt tròn), Họ tên, Email (chỉ hiển thị), Số điện thoại, Tiểu sử (tùy chọn), Nút cập nhật.

**Cài đặt**: Thông báo (email, trong app), Quyền riêng tư.

**Bảo mật**: Đổi mật khẩu (cũ, mới, xác nhận), Trạng thái xác minh email, Danh sách phiên hoạt động (thiết bị, vị trí, lần cuối), Nút đăng xuất phiên khác.

**Nguy hiểm**: Nút xóa tài khoản (với xác nhận).

---

## 3. UI/UX COMPONENTS (MUI)

**Thành phần chung**: AppBar, BottomNav, Card, Button, Thanh tiến trình, Đếm ngược, Badge, Tab, Accordion, Bảng, Snackbar, Modal, Spinner.

**Thành phần tùy chỉnh**: ExamProgressBar, QuestionNavigator, AudioRecorder, TextEditor, Timer, FeedbackCard, RadarChart.

---

## 4. LUỒNG NGƯỜI DÙNG CHÍNH

**Làm bài thi**: Duyệt bài → Lọc/tìm → Chi tiết → Bắt đầu → Câu hỏi lần lượt → Trả lời (tự lưu) → Điều hướng → Nộp → Kết quả ngay (trừ Writing/Speaking) → Feedback từng câu.

**Xem tiến trình**: Stats → Biểu đồ → Xu hướng, phân chia → Lần làm trước → Kết quả chi tiết → Xác định yếu.

---

## 5. THÔNG BÁO

- Bài thi nộp thành công.
- Writing/Speaking chờ xem xét AI.
- Giáo viên xem xét xong.
- Điểm sẵn sàng.
- Nhắc luyện tập yếu.
- Cảnh báo hết phiên.
