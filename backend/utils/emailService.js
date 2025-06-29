const nodemailer = require('nodemailer');

// Create transporter with better Gmail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify transporter configuration
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('Email transporter is ready');
    return true;
  } catch (error) {
    console.error('Email transporter verification failed:', error);
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    // Verify transporter before sending
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      console.error('Email transporter not verified');
      return false;
    }

    const mailOptions = {
      from: `"Project Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Project Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; margin-bottom: 20px;">You requested a password reset for your Project Tracker account.</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #007bff; font-size: 12px; background-color: #f1f3f4; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This link will expire in 1 hour.<br>
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your email credentials.');
    } else if (error.code === 'ESOCKET') {
      console.error('Connection timeout. Please check your internet connection.');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed. Please check your email settings.');
    }
    
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  verifyTransporter
}; 