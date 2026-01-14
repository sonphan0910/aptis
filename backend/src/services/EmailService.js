const { transporter, EMAIL_TEMPLATES, EMAIL_CONFIG } = require('../config/email');

class EmailService {
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(user, temporaryPassword) {
    const { subject, html } = EMAIL_TEMPLATES.welcome;

    const emailHtml = html({
      fullName: user.full_name,
      email: user.email,
      password: temporaryPassword,
    });

    return await this.sendEmail(user.email, subject, emailHtml);
  }

  async sendResetPasswordEmail(user, resetToken) {
    const { subject, html } = EMAIL_TEMPLATES.resetPassword;

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const emailHtml = html({
      fullName: user.full_name,
      resetLink,
    });

    return await this.sendEmail(user.email, subject, emailHtml);
  }

  async sendExamPublishedEmail(studentEmail, exam) {
    const { subject, html } = EMAIL_TEMPLATES.examPublished;

    const emailHtml = html({
      examTitle: exam.title,
      duration: exam.duration_minutes,
    });

    return await this.sendEmail(studentEmail, subject, emailHtml);
  }

  async sendExamGradedEmail(student, exam, totalScore, maxScore) {
    const { subject, html } = EMAIL_TEMPLATES.examGraded;

    const emailHtml = html({
      fullName: student.full_name,
      examTitle: exam.title,
      totalScore,
      maxScore,
    });

    return await this.sendEmail(student.email, subject, emailHtml);
  }

  async sendBulkEmails(recipients, subject, htmlTemplate, data) {
    const results = [];

    for (const recipient of recipients) {
      try {
        const emailHtml =
          typeof htmlTemplate === 'function'
            ? htmlTemplate({ ...data, ...recipient })
            : htmlTemplate;

        const result = await this.sendEmail(recipient.email, subject, emailHtml);
        results.push({ email: recipient.email, success: true, messageId: result.messageId });
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        results.push({ email: recipient.email, success: false, error: error.message });
      }
    }

    return results;
  }

  async testConnection() {
    try {
      await transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('Email service connection failed:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
