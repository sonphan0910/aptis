# Hệ thống thi tiếng Anh APTIS - Nền tảng thi thử AI

## Tổng quan
Hệ thống mô phỏng bài thi APTIS chuẩn quốc tế với 3 ứng dụng: **Học sinh**, **Giáo viên/Admin**, và **Backend API**.
Điểm nổi bật là công nghệ **Hybrid AI Scoring** kết hợp giữa **Google Gemini/Groq** (chấm bài Viết) và **Azure Speech Services** (phân tích bài Nói chuyên sâu), mang lại kết quả chấm thi chính xác và chi tiết tiệm cận giám khảo con người.

---

## Tính năng nổi bật (Đã kiểm chứng)

### 1. Công nghệ Lõi
- **Hybrid AI Engine**: Sử dụng linh hoạt Google Gemini Pro hoặc Groq cho tốc độ xử lý cực nhanh.
- **Advanced Speech Analysis**: Tích hợp **Azure Speech Services** (Online) để chấm bài Nói. Không chỉ chuyển văn bản, hệ thống còn phân tích:
  - 🗣️ **Pronunciation Score** (Điểm phát âm)
  - 🌊 **Fluency & Coherence** (Độ trôi chảy)
  - 🎵 **Prosody** (Ngữ điệu)
  - ⏱️ **Pace & Pauses** (Tốc độ & Số lần ngập ngừng)
- **Local-First Architecture**: Backend Node.js chạy local, tiết kiệm chi phí hạ tầng, nhưng vẫn kết nối Cloud API khi cần thiết cho AI.

### 2. Chức năng HỌC SINH (frontend-student)
- **Chế độ thi linh hoạt**: 
  - **Full Mock Test**: Thi thử 4 kỹ năng liên tục áp lực thời gian thực.
  - **Single Skill Practice**: Luyện tập riêng lẻ từng kỹ năng (Nghe, Nói, Đọc, Viết) để cải thiện điểm yếu.
- **Phản hồi chi tiết**: 
  - Xem lỗi sai cụ thể ngay trên bài làm.
  - Nhận biểu đồ phân tích kỹ năng (Radar Chart) thay vì chỉ điểm số.
- **Trải nghiệm thi hiện đại**: Giao diện React mượt mà, tự động lưu bài làm, ghi âm trực tiếp trên trình duyệt.

### 3. Chức năng GIÁO VIÊN (frontend-admin-teacher)
- **Exam Builder Kéo-Thả**: Soạn đề thi dễ dàng bằng giao diện trực quan.
- **Human-in-the-loop Grading**:
  - AI chấm sơ bộ và đánh dấu các bài "Cần xem xét" (Needs Review).
  - Giáo viên sử dụng công cụ **Highlighter** để đánh dấu lỗi và ghi đè điểm số AI nếu cần.
- **Báo cáo lớp học**: Theo dõi tiến độ của từng học sinh với các chỉ số chi tiết từ Azure và AI.

### 4. Chức năng ADMIN
- Quản lý người dùng, phân quyền truy cập.
- Cấu hình hệ thống AI (API Keys, Prompts) mà không cần sửa code.
- Giám sát hàng đợi xử lý (Scoring Queue) của hệ thống.

---

## Cấu trúc dự án
- **backend**: Node.js, Express, MySQL, Sequelize (Core Logic).
- **frontend-student**: Next.js App Router (Giao diện thi).
- **frontend-admin-teacher**: Next.js App Router (Giao diện quản lý).
- **docs**: Tài liệu kỹ thuật chi tiết.

