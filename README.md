# Hệ thống thi tiếng Anh APTIS - Các chức năng chính

## Tổng quan
Hệ thống gồm 3 ứng dụng: Học sinh, Giáo viên/Admin, Backend API

---

## Chức năng HỌC SINH (frontend-student)

### Đăng nhập / Đăng ký
- Tạo tài khoản mới
- Đăng nhập vào hệ thống
- Quên mật khẩu / Đặt lại mật khẩu

### Trang chủ / Dashboard
- Xem thống kê cá nhân (số bài thi, điểm trung bình, thời gian học)
- Xem các lần thi gần đây
- Xem kỹ năng yếu cần cải thiện
- Huy hiệu thành tích

### Tìm kiếm và chọn bài thi
- Lọc bài thi theo loại APTIS (General, Advanced, cho giáo viên, cho tuổi teen)
- Lọc theo kỹ năng (Đọc, Nghe, Viết, Nói)
- Lọc theo độ khó (Dễ, Trung bình, Khó)
- Tìm kiếm bài thi theo tên
- Xem chi tiết bài thi trước khi làm

### Làm bài thi
- Làm bài thi với các loại câu hỏi:
  - **Đọc**: Chọn đáp án, điền chỗ trống, ghép cặp, sắp xếp thứ tự, ghép tiêu đề
  - **Nghe**: Chọn đáp án, ghép cặp, xác định đúng/sai, chọn nhiều đáp án
  - **Viết**: Viết ngắn, điền form, trả lời chat, viết email, viết bài
  - **Nói**: Ghi âm câu trả lời, phát lại âm thanh
- Xem bộ đếm thời gian, tự động nộp khi hết giờ
- Điều hướng giữa các câu hỏi, xem tiến độ làm bài
- Tự động lưu câu trả lời khi làm bài
- Tạm dừng hoặc tiếp tục bài thi
- Xem lại trước khi nộp bài

### Luyện tập
- Chọn kỹ năng để luyện (Nghe, Đọc, Viết, Nói)
- Chọn độ khó (Dễ, Trung bình, Khó)
- Chọn loại câu hỏi cụ thể
- Nhận phản hồi ngay sau mỗi câu hỏi
- Xem đáp án mẫu và giải thích
- Có thể làm lại câu hỏi

### Xem kết quả
- Xem danh sách tất cả các bài thi đã làm
- Lọc kết quả theo loại bài thi
- Xem điểm chi tiết từng kỹ năng (Đọc, Nghe, Viết, Nói)
- Xem phản hồi từ AI (cho bài viết và nói)
- Xem phản hồi từ giáo viên
- Tải chứng chỉ hoàn thành bài thi
- Xem biểu đồ tiến độ học tập

### Hồ sơ cá nhân
- Xem/chỉnh sửa thông tin cá nhân
- Tải ảnh đại diện
- Thay đổi mật khẩu

---

## Chức năng GIÁO VIÊN (frontend-admin-teacher)

### Quản lý câu hỏi
- Tạo câu hỏi loại: Chọn đáp án, điền chỗ trống, ghép cặp, sắp xếp, đúng/sai, etc.
- Xem danh sách tất cả câu hỏi đã tạo
- Tìm kiếm và lọc câu hỏi
- Chỉnh sửa/xóa câu hỏi
- Tải ảnh/âm thanh cho câu hỏi
- Xem xét câu hỏi (Nháp → Chờ duyệt → Đã xuất bản)
- Xem thống kê sử dụng của từng câu hỏi

### Tạo bài thi
- Nhập thông tin bài thi (tên, mô tả, thời lượng)
- Chọn loại APTIS (General, Advanced, etc.)
- Chọn kỹ năng cần có
- Chia thành các phần thi
- Kéo thả câu hỏi vào từng phần
- Cấu hình thời gian cho từng phần
- Xem trước bài thi hoàn chỉnh
- Công bố bài thi (cho phép học sinh làm bài)
- Xem thống kê: Số học sinh làm, điểm trung bình, độ khó

### Chấm bài thi
- Xem danh sách bài thi cần chấm (hàng chờ)
- Sắp xếp theo mức độ ưu tiên
- Xem chi tiết bài thi của từng học sinh
- **Chấm bài viết**: 
  - Chọn điểm từ 1-5 cho 4 tiêu chí (Thực hiện nhiệm vụ, Sự liên kết, Vốn từ, Ngữ pháp)
  - Viết nhận xét chi tiết
  - Tô sáng những phần cần chỉnh sửa
  - Xem điểm AI gợi ý
  - Chấp nhận hoặc thay đổi điểm AI
- **Chấm bài nói**: 
  - Nghe lại bài nói của học sinh
  - Chọn tốc độ phát lại
  - Chọn điểm từ 1-5 cho 4 tiêu chí (Phát âm, Lưu loát, Vốn từ, Ngữ pháp)
  - Thêm nhận xét và ghi chú
  - Xem bảng chữ của bài nói (transcript)
- Chấm hàng loạt (chấm nhiều bài thi cùng lúc)
- Xem lịch sử chấm bài

### Xem báo cáo
- **Báo cáo hiệu suất bài thi**:
  - Xem phân bố điểm (biểu đồ)
  - Xem câu hỏi nào khó nhất, dễ nhất
  - Xem thời gian trung bình làm bài
  - Tỷ lệ hoàn thành
- **Báo cáo tiến độ học sinh**:
  - Xem điểm của từng học sinh qua các bài thi
  - So sánh với trung bình lớp
  - Xem xu hướng tiến độ
  - Đề xuất cải thiện
- **Báo cáo lớp**:
  - Xem thống kê chung của cả lớp
  - Xem phân bố kỹ năng
  - Xem số lần thi
  - Tải báo cáo thành PDF/Excel

---

## Chức năng ADMIN (frontend-admin-teacher)

### Quản lý người dùng
- Xem danh sách tất cả người dùng (Học sinh, Giáo viên, Admin)
- Tạo người dùng mới (gán vai trò khi tạo)
- Chỉnh sửa thông tin người dùng
- Kích hoạt/vô hiệu hóa tài khoản người dùng
- Cấp lại mật khẩu cho người dùng
- Xóa người dùng
- Sắp xếp và lọc danh sách người dùng
- Tải danh sách người dùng thành Excel
- Lập tài khoản hàng loạt (import từ file)

### Bảng điều khiển hệ thống
- Xem tổng số người dùng theo từng vai trò
- Xem số bài thi đang hoạt động
- Xem số bài thi chờ chấm
- Xem tình trạng hệ thống (tốc độ, lỗi)
- Xem hoạt động gần đây (ai đã làm gì)
- Xem danh sách bài thi chờ duyệt từ giáo viên


## Tóm tắt các chức năng
- **Học sinh**: Làm thi, luyện tập, xem kết quả, xem phản hồi
- **Giáo viên**: Tạo câu hỏi & bài thi, chấm bài viết/nói, xem báo cáo học sinh
- **Admin**: Quản lý tài khoản, giám sát hệ thống
