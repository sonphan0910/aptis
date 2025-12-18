require('dotenv').config();

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // JWT token type
  tokenTypes: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
  },

  // Cookie options for refresh token
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

module.exports = JWT_CONFIG;
