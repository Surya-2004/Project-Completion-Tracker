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

const sendInterviewInviteEmail = async (email, studentName, interviewTime, interviewType, teamDetails = null, interviewerName = null) => {
  try {
    // Verify transporter before sending
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      console.error('Email transporter not verified');
      return false;
    }

    // Create team details section if it's a team interview
    const teamSection = teamDetails ? `
      <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
        <h3 style="color: #333; margin: 0 0 15px 0;">👥 Team Details:</h3>
        <div style="color: #666; line-height: 1.6;">
          <p style="margin: 0 0 8px 0;"><strong>Team Number:</strong> ${teamDetails.teamNumber}</p>
          <p style="margin: 0 0 8px 0;"><strong>Project Title:</strong> ${teamDetails.projectTitle || 'Untitled Project'}</p>
          ${teamDetails.domain ? `<p style="margin: 0 0 8px 0;"><strong>Domain:</strong> ${teamDetails.domain}</p>` : ''}
          ${teamDetails.projectDescription ? `<p style="margin: 0 0 8px 0;"><strong>Description:</strong> ${teamDetails.projectDescription}</p>` : ''}
        </div>
      </div>
    ` : '';

    // Add interviewer section if interviewerName is provided
    const interviewerSection = interviewerName ? `
      <div style="background-color: #f0f8ff; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: left;">
        <h3 style="color: #333; margin: 0 0 10px 0;">👤 Interviewer</h3>
        <p style="color: #007bff; font-size: 16px; font-weight: bold; margin: 0;">${interviewerName}</p>
      </div>
    ` : '';

    const mailOptions = {
      from: `"Project Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Interview Invitation - Project Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center;">
            <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px;">
              <h1 style="margin: 0; font-size: 24px;">🎯 Interview Invitation</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${studentName}!</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
              <p style="color: #666; margin-bottom: 15px; font-size: 16px;">
                You have been invited for a <strong>${interviewType}</strong> interview as part of the Project Tracker evaluation process.
              </p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h3 style="color: #333; margin: 0 0 10px 0;">📅 Interview Details</h3>
                <p style="color: #007bff; font-size: 18px; font-weight: bold; margin: 0;">
                  ${interviewTime}
                </p>
              </div>
            </div>
            
            ${interviewerSection}
            ${teamSection}
            
            <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
              <h3 style="color: #333; margin: 0 0 15px 0;">📋 What to Prepare:</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Self-introduction</li>
                <li>Project understanding and your role</li>
                <li>Technical knowledge and problem-solving skills</li>
                <li>Teamwork and communication examples</li>
                <li>Questions about the project or process</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Note:</strong> Please be ready 5 minutes before the scheduled time. 
                The interview will be conducted online via the Project Tracker platform.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions or need to reschedule, please contact your project coordinator immediately.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Best regards,<br>
                Project Tracker Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Interview invite email sent successfully:', result.messageId);
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
  sendInterviewInviteEmail,
  verifyTransporter
}; 