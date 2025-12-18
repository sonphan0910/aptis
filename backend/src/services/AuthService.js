const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_CONFIG = require('../config/jwt');
const { UnauthorizedError, ValidationError } = require('../utils/errors');

/**
 * Authentication Service
 * Handles user authentication logic
 */
class AuthService {
  /**
   * Register new user
   */
  static async register({ email, password, full_name, phone, role = 'student' }) {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      full_name,
      phone,
      role: role === 'admin' ? 'student' : role, // Prevent admin creation via public register
      status: 'active',
    });

    return this.sanitizeUser(user);
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check user status
    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    return this.sanitizeUser(user);
  }

  /**
   * Generate JWT tokens
   */
  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      { ...payload, type: JWT_CONFIG.tokenTypes.ACCESS },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.accessExpiresIn },
    );

    const refreshToken = jwt.sign(
      { ...payload, type: JWT_CONFIG.tokenTypes.REFRESH },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.refreshExpiresIn },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: JWT_CONFIG.accessExpiresIn,
    };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token, tokenType = JWT_CONFIG.tokenTypes.ACCESS) {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.secret);

      if (decoded.type !== tokenType) {
        throw new UnauthorizedError('Invalid token type');
      }

      // Get fresh user data
      const user = await User.findByPk(decoded.userId);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedError('User not found or inactive');
      }

      return {
        user: this.sanitizeUser(user),
        payload: decoded,
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Invalid or expired token');
      }
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken) {
    const { user } = await this.verifyToken(refreshToken, JWT_CONFIG.tokenTypes.REFRESH);
    return this.generateTokens(user);
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await user.update({ password_hash });

    return true;
  }

  /**
   * Reset password (forgot password)
   */
  static async resetPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists for security
      return true;
    }

    // Generate temporary password
    const tempPassword = this.generateRandomPassword(12);
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(tempPassword, saltRounds);

    // Update password
    await user.update({ password_hash });

    // Return temp password for email service
    return {
      user: this.sanitizeUser(user),
      tempPassword,
    };
  }

  /**
   * Generate random password
   */
  static generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special

    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Hash password
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password
   */
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Remove sensitive fields from user object
   */
  static sanitizeUser(user) {
    const userData = user.toJSON ? user.toJSON() : user;
    delete userData.password_hash;
    return userData;
  }

  /**
   * Extract JWT payload from request
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}

module.exports = AuthService;
