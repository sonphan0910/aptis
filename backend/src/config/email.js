
// Cấu hình gửi email sử dụng nodemailer
const nodemailer = require('nodemailer');
require('dotenv').config();

// Thông tin cấu hình SMTP (lấy từ biến môi trường hoặc giá trị mặc định)
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com', // Địa chỉ SMTP server
  port: parseInt(process.env.SMTP_PORT) || 587,    // Cổng SMTP
  secure: process.env.SMTP_SECURE === 'true',      // true nếu dùng SSL (cổng 465), false nếu không
  auth: {
    user: process.env.SMTP_USER,                   // Tài khoản email
    pass: process.env.SMTP_PASSWORD,               // Mật khẩu ứng dụng/email
  },
  from: process.env.EMAIL_FROM || 'noreply@aptis.com', // Địa chỉ gửi mặc định
};

// Tạo transporter để gửi email (có thể tái sử dụng)
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  secure: EMAIL_CONFIG.secure,
  auth: EMAIL_CONFIG.auth,
});

/**
 * Hàm kiểm tra kết nối SMTP
 * Nếu thành công sẽ log ra console, nếu lỗi sẽ báo lỗi
 */
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Dịch vụ email đã sẵn sàng gửi mail');
  } catch (error) {
    console.error('❌ Lỗi dịch vụ email:', error);
  }
};

// Các mẫu email (template) sử dụng cho các chức năng hệ thống
const EMAIL_TEMPLATES = {
  // Mẫu email chào mừng tài khoản mới
  welcome: {
    subject: 'Chào mừng bạn đến với hệ thống thi APTIS',
    html: (data) => `
      <h1>Chào mừng ${data.fullName}!</h1>
      <p>Tài khoản của bạn đã được tạo thành công.</p>
      <p>Email đăng nhập: <b>${data.email}</b></p>
      <p>Mật khẩu: <b>${data.password}</b></p>
      <p>Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.</p>
    `,
  },

  // Mẫu email reset mật khẩu
  resetPassword: {
    subject: 'Yêu cầu đặt lại mật khẩu',
    html: (data) => `
      <h1>Yêu cầu đặt lại mật khẩu</h1>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
      <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
      <a href="${data.resetLink}">Đặt lại mật khẩu</a>
      <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
      <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
    `,
  },

  // Mẫu email thông báo có bài thi mới
  examPublished: {
    subject: 'Có bài thi mới được mở',
    html: (data) => `
      <h1>Bài thi mới đã được mở</h1>
      <p>Bài thi "${data.examTitle}" đã sẵn sàng cho bạn.</p>
      <p>Thời gian làm bài: ${data.duration} phút</p>
      <p>Đăng nhập để bắt đầu làm bài ngay.</p>
    `,
  },

  // Mẫu email thông báo đã chấm điểm xong
  examGraded: {
    subject: 'Bài thi của bạn đã được chấm điểm',
    html: (data) => `
      <h1>Bài thi đã được chấm điểm</h1>
      <p>Bài thi "${data.examTitle}" của bạn đã được chấm điểm.</p>
      <p>Tổng điểm: ${data.totalScore} / ${data.maxScore}</p>
      <p>Đăng nhập để xem chi tiết kết quả.</p>
    `,
  },
};

// Export các thành phần cấu hình email
module.exports = {
  EMAIL_CONFIG,           // Thông tin cấu hình SMTP
  transporter,            // Đối tượng gửi email
  verifyEmailConnection,  // Hàm kiểm tra kết nối SMTP
  EMAIL_TEMPLATES,        // Các mẫu email hệ thống
};
