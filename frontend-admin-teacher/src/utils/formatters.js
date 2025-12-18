// Format ngày giờ
export const formatDate = (dateString, locale = 'vi-VN') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatDateTime = (dateString, locale = 'vi-VN') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString(locale);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
};

export const formatTime = (dateString, locale = 'vi-VN') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale);
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateString;
  }
};

// Format thời gian tương đối
export const formatRelativeTime = (dateString, locale = 'vi-VN') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return formatDate(dateString, locale);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};

// Format số
export const formatNumber = (number, locale = 'vi-VN') => {
  if (number == null) return '';
  
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return number.toString();
  }
};

// Format phần trăm
export const formatPercentage = (value, decimals = 1, locale = 'vi-VN') => {
  if (value == null) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value}%`;
  }
};

// Format tiền tệ
export const formatCurrency = (amount, currency = 'VND', locale = 'vi-VN') => {
  if (amount == null) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} ${currency}`;
  }
};

// Format kích thước file
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format thời lượng (giây -> phút:giây)
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format trạng thái
export const formatStatus = (status) => {
  const statusLabels = {
    active: 'Hoạt động',
    inactive: 'Tạm dừng',
    draft: 'Bản nháp',
    published: 'Đã xuất bản',
    pending: 'Chờ xử lý',
    completed: 'Hoàn thành',
    graded: 'Đã chấm điểm'
  };
  
  return statusLabels[status] || status;
};

// Format loại câu hỏi
export const formatQuestionType = (type) => {
  const typeLabels = {
    mcq: 'Trắc nghiệm',
    matching: 'Ghép đôi',
    gap_filling: 'Điền chỗ trống',
    ordering: 'Sắp xếp',
    writing: 'Viết',
    speaking: 'Nói'
  };
  
  return typeLabels[type] || type;
};

// Format kỹ năng
export const formatSkill = (skill) => {
  const skillLabels = {
    listening: 'Nghe',
    reading: 'Đọc',
    writing: 'Viết',
    speaking: 'Nói'
  };
  
  return skillLabels[skill] || skill;
};

// Format vai trò
export const formatRole = (role) => {
  const roleLabels = {
    admin: 'Quản trị viên',
    teacher: 'Giáo viên',
    student: 'Học viên'
  };
  
  return roleLabels[role] || role;
};

// Format độ khó
export const formatDifficulty = (difficulty) => {
  const difficultyLabels = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó'
  };
  
  return difficultyLabels[difficulty] || difficulty;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
};

// Format email (che giấu một phần)
export const formatEmail = (email, maskLength = 3) => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= maskLength) return email;
  
  const maskedLocal = localPart.slice(0, -maskLength) + '*'.repeat(maskLength);
  return `${maskedLocal}@${domain}`;
};

// Format phone number
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Loại bỏ tất cả ký tự không phải số
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format cho số điện thoại Việt Nam (10 số)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phoneNumber;
};