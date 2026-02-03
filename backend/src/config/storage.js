// Cấu hình lưu trữ file sử dụng multer
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Thông tin cấu hình lưu trữ
const STORAGE_CONFIG = {
  type: process.env.STORAGE_TYPE || 'local',                 // Loại lưu trữ (local/cloud...)
  basePath: process.env.STORAGE_PATH || 'uploads',           // Thư mục gốc lưu file

  // Giới hạn file upload
  limits: {
    fileSize: 500 * 1024 * 1024, // Dung lượng tối đa 500MB (increased from 50MB)
    files: 10,                   // Tối đa 10 file mỗi lần upload (increased from 1)
  },

  // Các loại file được phép upload
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
};

// Đảm bảo các thư mục upload tồn tại
const ensureUploadDirs = () => {
  const dirs = [
    path.join(STORAGE_CONFIG.basePath, 'avatars'),
    path.join(STORAGE_CONFIG.basePath, 'questions'),
    path.join(STORAGE_CONFIG.basePath, 'answers'),
    path.join(STORAGE_CONFIG.basePath, 'audio'),
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Cấu hình nơi lưu file upload với multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = STORAGE_CONFIG.basePath;

    // Dynamic subfolder based on route or field
    if (req.route && (req.route.path.includes('/questions/upload-image') ||
      req.route.path.includes('/questions/:questionId/upload-images'))) {
      uploadDir = path.join(STORAGE_CONFIG.basePath, 'questions');
    } else if (file.fieldname === 'avatar') {
      uploadDir = path.join(STORAGE_CONFIG.basePath, 'avatars');
    } else if (file.fieldname === 'audio' || file.fieldname === 'mainAudio' || file.fieldname === 'speakerAudios') {
      uploadDir = path.join(STORAGE_CONFIG.basePath, 'audio');
    } else if (file.fieldname === 'images') {
      // For question images
      uploadDir = path.join(STORAGE_CONFIG.basePath, 'questions');
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Đặt tên file: <fieldname>-<timestamp>-<random>.<ext>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const finalFilename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, finalFilename);
  },
});

// Hàm kiểm tra loại file hợp lệ khi upload (DISABLED - allow all file types for audio)
const fileFilter = (req, file, cb) => {
  // ✅ Allow all file types for audio uploads
  // For audio: no MIME type restriction
  if (req.route && req.route.path.includes('upload-audios')) {
    // Allow any file type for audio upload endpoint
    cb(null, true);
  } else if (req.route && req.route.path.includes('upload-audio')) {
    // Allow any file type for audio upload endpoint
    cb(null, true);
  } else {
    // For other endpoints, enforce MIME type checking
    const allAllowedTypes = [
      ...STORAGE_CONFIG.allowedTypes.image,
      ...STORAGE_CONFIG.allowedTypes.audio,
      ...STORAGE_CONFIG.allowedTypes.document,
    ];
    if (allAllowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Không hỗ trợ loại file này'), false);
    }
  }
};

// Khởi tạo middleware upload với cấu hình ở trên
const upload = multer({
  storage,
  fileFilter,
  limits: STORAGE_CONFIG.limits,
});

// Đảm bảo các thư mục upload tồn tại khi khởi động
ensureUploadDirs();

// Export các thành phần cấu hình lưu trữ
module.exports = {
  STORAGE_CONFIG,    // Thông tin cấu hình lưu trữ
  ensureUploadDirs,  // Hàm đảm bảo thư mục upload tồn tại
  storage,           // Cấu hình storage cho multer
  upload,            // Middleware upload file
};
