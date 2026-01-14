const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_CONFIG = require('../config/jwt');
const { UnauthorizedError, ValidationError } = require('../utils/errors');

class AuthService {
  static async register({ email, password, full_name, phone, role = 'student' }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
      email,
      password_hash,
      full_name,
      phone,
      role: role === 'admin' ? 'student' : role, 
      status: 'active',
    });

    return this.sanitizeUser(user);
  }

  static async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }
    await user.update({ last_login: new Date() });

    return this.sanitizeUser(user);
  }

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

  static async verifyToken(token, tokenType = JWT_CONFIG.tokenTypes.ACCESS) {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.secret);

      if (decoded.type !== tokenType) {
        throw new UnauthorizedError('Invalid token type');
      }

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

  static async refreshAccessToken(refreshToken) {
    const { user } = await this.verifyToken(refreshToken, JWT_CONFIG.tokenTypes.REFRESH);
    return this.generateTokens(user);
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password_hash });

    return true;
  }

  static async resetPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const tempPassword = this.generateRandomPassword(12);
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(tempPassword, saltRounds);

    await user.update({ password_hash });

    return {
      user: this.sanitizeUser(user),
      tempPassword,
    };
  }

  static generateRandomPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special

    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

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

  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static sanitizeUser(user) {
    const userData = user.toJSON ? user.toJSON() : user;
    delete userData.password_hash;
    return userData;
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7); 
  }
}

module.exports = AuthService;
