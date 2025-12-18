const nodemailer = require('nodemailer');
require('dotenv').config();

// SMTP configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: process.env.EMAIL_FROM || 'noreply@aptis.com',
};

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  secure: EMAIL_CONFIG.secure,
  auth: EMAIL_CONFIG.auth,
});

// Verify transporter connection
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send messages');
  } catch (error) {
    console.error('❌ Email service error:', error);
  }
};

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to APTIS Exam System',
    html: (data) => `
      <h1>Welcome ${data.fullName}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Email: ${data.email}</p>
      <p>Password: ${data.password}</p>
      <p>Please change your password after first login.</p>
    `,
  },

  resetPassword: {
    subject: 'Reset Your Password',
    html: (data) => `
      <h1>Reset Password Request</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${data.resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  },

  examPublished: {
    subject: 'New Exam Available',
    html: (data) => `
      <h1>New Exam Published</h1>
      <p>A new exam "${data.examTitle}" is now available.</p>
      <p>Duration: ${data.duration} minutes</p>
      <p>Log in to start your attempt.</p>
    `,
  },

  examGraded: {
    subject: 'Your Exam Has Been Graded',
    html: (data) => `
      <h1>Exam Graded</h1>
      <p>Your exam "${data.examTitle}" has been graded.</p>
      <p>Total Score: ${data.totalScore} / ${data.maxScore}</p>
      <p>Log in to view detailed results.</p>
    `,
  },
};

module.exports = {
  EMAIL_CONFIG,
  transporter,
  verifyEmailConnection,
  EMAIL_TEMPLATES,
};
