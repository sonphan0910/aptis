import * as Yup from 'yup';

// Validation cho email
export const emailValidator = Yup.string()
  .email('Email không hợp lệ')
  .required('Email là bắt buộc');

// Validation cho mật khẩu
export const passwordValidator = Yup.string()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  .required('Mật khẩu là bắt buộc');

// Validation cho họ tên
export const nameValidator = Yup.string()
  .min(2, 'Họ tên phải có ít nhất 2 ký tự')
  .required('Họ tên là bắt buộc');

// Validation cho số điện thoại
export const phoneValidator = Yup.string()
  .matches(/^[0-9+\-\s]+$/, 'Số điện thoại không hợp lệ')
  .min(10, 'Số điện thoại phải có ít nhất 10 số')
  .max(15, 'Số điện thoại không quá 15 số');

// Schema cho đăng nhập
export const loginSchema = Yup.object().shape({
  email: emailValidator,
  password: Yup.string().required('Mật khẩu là bắt buộc')
});

// Schema cho quên mật khẩu
export const forgotPasswordSchema = Yup.object().shape({
  email: emailValidator
});

// Schema cho reset mật khẩu
export const resetPasswordSchema = Yup.object().shape({
  password: passwordValidator,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Xác nhận mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc')
});

// Schema cho người dùng
export const userSchema = Yup.object().shape({
  email: emailValidator,
  full_name: nameValidator,
  phone: phoneValidator.optional(),
  role: Yup.string()
    .oneOf(['admin', 'teacher', 'student'], 'Vai trò không hợp lệ')
    .required('Vai trò là bắt buộc'),
  password: Yup.string().when('$isEdit', {
    is: false,
    then: () => passwordValidator,
    otherwise: () => Yup.string().optional()
  })
});

// Schema cho câu hỏi
export const questionSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .required('Tiêu đề là bắt buộc'),
  description: Yup.string().optional(),
  aptis_type: Yup.string()
    .oneOf(['general', 'advanced'], 'Loại APTIS không hợp lệ')
    .required('Loại APTIS là bắt buộc'),
  skill: Yup.string()
    .oneOf(['listening', 'reading', 'writing', 'speaking'], 'Kỹ năng không hợp lệ')
    .required('Kỹ năng là bắt buộc'),
  difficulty: Yup.string()
    .oneOf(['easy', 'medium', 'hard'], 'Độ khó không hợp lệ')
    .required('Độ khó là bắt buộc'),
  question_type: Yup.string()
    .oneOf(['mcq', 'matching', 'gap_filling', 'ordering', 'writing', 'speaking'], 'Loại câu hỏi không hợp lệ')
    .required('Loại câu hỏi là bắt buộc'),
  content: Yup.object().required('Nội dung câu hỏi là bắt buộc')
});

// Schema cho bài thi
export const examSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Tên bài thi phải có ít nhất 5 ký tự')
    .required('Tên bài thi là bắt buộc'),
  description: Yup.string().optional(),
  aptis_type: Yup.string()
    .oneOf(['general', 'advanced'], 'Loại APTIS không hợp lệ')
    .required('Loại APTIS là bắt buộc'),
  primary_skill: Yup.string()
    .oneOf(['listening', 'reading', 'writing', 'speaking'], 'Kỹ năng chính không hợp lệ')
    .required('Kỹ năng chính là bắt buộc'),
  duration_minutes: Yup.number()
    .min(1, 'Thời lượng phải lớn hơn 0')
    .required('Thời lượng là bắt buộc'),
  instructions: Yup.string().optional()
});

// Schema cho tiêu chí chấm điểm
export const criteriaSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Tên tiêu chí phải có ít nhất 3 ký tự')
    .required('Tên tiêu chí là bắt buộc'),
  description: Yup.string().optional(),
  question_type: Yup.string()
    .oneOf(['writing', 'speaking'], 'Loại câu hỏi không hợp lệ')
    .required('Loại câu hỏi là bắt buộc'),
  aptis_type: Yup.string()
    .oneOf(['general', 'advanced'], 'Loại APTIS không hợp lệ')
    .required('Loại APTIS là bắt buộc'),
  max_score: Yup.number()
    .min(1, 'Điểm tối đa phải lớn hơn 0')
    .required('Điểm tối đa là bắt buộc')
});

// Custom validators
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Ít nhất 6 ký tự, có chữ hoa, chữ thường, và số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return passwordRegex.test(password);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Kiểm tra kích thước file
export const validateFileSize = (file, maxSizeInMB = 10) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Kiểm tra loại file
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Kiểm tra URL
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Kiểm tra JSON
export const validateJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

// Kiểm tra số nguyên dương
export const validatePositiveInteger = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// Kiểm tra khoảng giá trị
export const validateRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Kiểm tra ngày hợp lệ
export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Kiểm tra ngày trong tương lai
export const validateFutureDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return validateDate(dateString) && date > now;
};

// Kiểm tra ngày trong quá khứ
export const validatePastDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return validateDate(dateString) && date < now;
};