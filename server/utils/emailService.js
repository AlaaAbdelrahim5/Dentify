const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  return transporter;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, firstName = '') => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Dentify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Dentify',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #e0f2fe 100%);
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(20, 184, 166, 0.15);
            }
            .header { 
              background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              text-align: center;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content { 
              background: white; 
              padding: 40px 30px;
            }
            .content h2 {
              color: #0f766e;
              font-size: 24px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .content p {
              color: #4b5563;
              margin-bottom: 15px;
              font-size: 15px;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .button { 
              display: inline-block; 
              padding: 16px 40px; 
              background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
              color: white; 
              text-decoration: none; 
              border-radius: 12px; 
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 10px 25px rgba(20, 184, 166, 0.3);
              transition: all 0.3s ease;
            }
            .button:hover { 
              transform: translateY(-2px);
              box-shadow: 0 15px 35px rgba(20, 184, 166, 0.4);
            }
            .link-text {
              word-break: break-all; 
              color: #0891b2;
              background: #ecfeff;
              padding: 15px;
              border-radius: 10px;
              font-size: 13px;
              border: 1px solid #cffafe;
            }
            .warning { 
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 4px solid #f59e0b; 
              padding: 20px; 
              margin: 25px 0;
              border-radius: 10px;
            }
            .warning strong {
              color: #92400e;
              display: block;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .warning ul {
              margin: 10px 0 0 20px;
              color: #78350f;
            }
            .warning li {
              margin: 8px 0;
            }
            .tips {
              background: #f0fdfa;
              padding: 20px;
              border-radius: 10px;
              border: 1px solid #99f6e4;
              margin: 20px 0;
            }
            .tips ul {
              margin: 10px 0 0 20px;
              color: #134e4a;
            }
            .tips li {
              margin: 8px 0;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              background: #f9fafb;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 5px 0;
              font-size: 13px;
            }
            .footer strong {
              color: #0f766e;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dentify</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello${firstName ? ' ' + firstName : ''}! 👋</h2>
              <p>We received a request to reset your password for your Dentify account.</p>
              <p>Click the button below to create a new password:</p>
              <div class="button-container">
                <a href="${resetUrl}" class="button">🔐 Reset My Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <div class="link-text">${resetUrl}</div>
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <div class="tips">
                <strong style="color: #0f766e; display: block; margin-bottom: 10px;">🛡️ Security Best Practices:</strong>
                <ul>
                  <li>Use a strong, unique password (at least 8 characters)</li>
                  <li>Include uppercase, lowercase, numbers, and symbols</li>
                  <li>Never share your password with anyone</li>
                  <li>Enable two-factor authentication for extra security</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p><strong>© 2025 Dentify</strong> - Your Trusted Dental Care Platform</p>
              <p>All rights reserved.</p>
              <p style="margin-top: 15px;">Need help? Contact our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0891b2; text-decoration: none;">${process.env.EMAIL_USER}</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send password changed confirmation email
const sendPasswordChangedEmail = async (email, firstName = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Dentify" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Changed Successfully - Dentify',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #e0f2fe 100%);
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(20, 184, 166, 0.15);
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 10px;
              text-align: center;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content { 
              background: white; 
              padding: 40px 30px;
            }
            .content h2 {
              color: #065f46;
              font-size: 24px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .content p {
              color: #4b5563;
              margin-bottom: 15px;
              font-size: 15px;
            }
            .success { 
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
              border-left: 4px solid #10b981; 
              padding: 20px; 
              margin: 25px 0;
              border-radius: 10px;
            }
            .success strong {
              color: #065f46;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 18px;
              margin-bottom: 5px;
            }
            .success p {
              color: #047857;
              margin: 10px 0 0 0;
            }
            .info-box {
              background: #f0fdfa;
              padding: 20px;
              border-radius: 10px;
              border: 1px solid #99f6e4;
              margin: 20px 0;
            }
            .info-box strong {
              color: #0f766e;
              display: block;
              margin-bottom: 10px;
              font-size: 15px;
            }
            .info-box p {
              color: #134e4a;
              margin: 5px 0;
            }
            .warning-box {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              border-left: 4px solid #ef4444;
              padding: 20px;
              margin: 25px 0;
              border-radius: 10px;
            }
            .warning-box strong {
              color: #991b1b;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 16px;
              margin-bottom: 10px;
            }
            .warning-box p {
              color: #7f1d1d;
              margin: 5px 0;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              background: #f9fafb;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 5px 0;
              font-size: 13px;
            }
            .footer strong {
              color: #0f766e;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .checkmark {
              font-size: 32px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dentify</h1>
              <p>Password Changed Successfully</p>
            </div>
            <div class="content">
              <h2>Hello${firstName ? ' ' + firstName : ''}! 👋</h2>
              <div class="success">
                <strong><span class="checkmark">✓</span> Success!</strong>
                <p>Your password has been changed successfully.</p>
              </div>
              <p>This is a confirmation that your Dentify account password was recently changed.</p>
              <div class="info-box">
                <strong>📅 Change Details:</strong>
                <p><strong>Date & Time:</strong> ${new Date().toLocaleString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</p>
                <p><strong>Account:</strong> ${email}</p>
              </div>
              <div class="warning-box">
                <strong>🚨 Didn't make this change?</strong>
                <p>If you did not authorize this password change, please contact our support team immediately to secure your account.</p>
                <p style="margin-top: 10px;">Contact us at: <a href="mailto:${process.env.EMAIL_USER}" style="color: #991b1b; font-weight: 600;">${process.env.EMAIL_USER}</a></p>
              </div>
              <div class="info-box">
                <strong>🔐 Security Tips:</strong>
                <p>• Keep your password secure and don't share it with anyone</p>
                <p>• Enable two-factor authentication for extra security</p>
                <p>• Use a unique password for your Dentify account</p>
                <p>• Be cautious of phishing emails asking for your password</p>
              </div>
            </div>
            <div class="footer">
              <p><strong>© 2025 Dentify</strong> - Your Trusted Dental Care Platform</p>
              <p>All rights reserved.</p>
              <p style="margin-top: 15px;">Need help? Contact our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color: #0891b2; text-decoration: none;">${process.env.EMAIL_USER}</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password changed confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangedEmail
};
