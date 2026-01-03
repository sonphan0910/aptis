const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Storage configuration
const STORAGE_CONFIG = {
  type: process.env.STORAGE_TYPE || 'local',
  basePath: process.env.STORAGE_PATH || 'uploads',

  // File limits
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 1, // Max 1 file per request
  },

  // Allowed file types
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

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    path.join(STORAGE_CONFIG.basePath, 'avatars'),
    path.join(STORAGE_CONFIG.basePath, 'questions'),
    path.join(STORAGE_CONFIG.basePath, 'answers'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = STORAGE_CONFIG.basePath;

    console.log('[MULTER] Determining upload directory:');
    console.log('[MULTER]   - file.fieldname:', file.fieldname);
    console.log('[MULTER]   - base path:', STORAGE_CONFIG.basePath);

    // Determine upload directory based on file field
    if (file.fieldname === 'avatar') {
      uploadDir = path.join(STORAGE_CONFIG.basePath, 'avatars');
      console.log('[MULTER]   → Using avatars directory');
    } else if (file.fieldname === 'questionMedia') {
      uploadDir = path.join(STORAGE_CONFIG.basePath, 'questions');
      console.log('[MULTER]   → Using questions directory');
    } else if (file.fieldname === 'audio' || file.fieldname === 'answerAudio') {
      // Support both 'audio' (new) and 'answerAudio' (old) field names
      uploadDir = path.join(STORAGE_CONFIG.basePath, 'answers');
      console.log('[MULTER]   → Using answers directory');
    } else {
      console.log('[MULTER]   → Using root upload directory (unknown fieldname)');
    }

    console.log('[MULTER]   - final uploadDir:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const finalFilename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('[MULTER]   - saving as:', finalFilename);
    cb(null, finalFilename);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allAllowedTypes = [
    ...STORAGE_CONFIG.allowedTypes.image,
    ...STORAGE_CONFIG.allowedTypes.audio,
    ...STORAGE_CONFIG.allowedTypes.document,
  ];

  console.log('[MULTER] File received in filter:');
  console.log('[MULTER]   - fieldname:', file.fieldname);
  console.log('[MULTER]   - originalname:', file.originalname);
  console.log('[MULTER]   - mimetype:', file.mimetype);
  console.log('[MULTER]   - size:', file.size, 'bytes');
  console.log('[MULTER]   - allowed?', allAllowedTypes.includes(file.mimetype));

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error('[MULTER] ❌ File type not allowed:', file.mimetype);
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: STORAGE_CONFIG.limits,
});

// Initialize upload directories
ensureUploadDirs();

module.exports = upload;
module.exports.STORAGE_CONFIG = STORAGE_CONFIG;
module.exports.ensureUploadDirs = ensureUploadDirs;
