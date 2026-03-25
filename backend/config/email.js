const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code email
const sendVerificationEmail = async (email, fullName, code) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Verify Your CTU Account - Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .code-box { background: #f0f4ff; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0; }
          .code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verify Your Account</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName}! 👋</h2>
            <p>Thank you for registering with <strong>CTU Daanbantayan Campus Admission Portal</strong>.</p>
            
            <p>To complete your registration, please use the verification code below:</p>
            
            <div class="code-box">
              <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Verification Code</div>
              <div class="code">${code}</div>
              <div style="font-size: 12px; color: #999; margin-top: 10px;">Valid for 10 minutes</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. CTU staff will never ask for your verification code.
            </div>
            
            <p>If you didn't request this code, please ignore this email.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>CTU Daanbantayan Campus</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CTU Daanbantayan Campus. All rights reserved.</p>
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, fullName) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Welcome to CTU Daanbantayan Campus! 🎓',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to CTU!</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName}! 👋</h2>
            <p>Your account has been successfully verified! Welcome to <strong>CTU Daanbantayan Campus Admission Portal</strong>.</p>
            
            <div class="highlight">
              <strong>✨ What's Next?</strong>
              <ul>
                <li>Complete your admission form</li>
                <li>Take the pre-assessment test</li>
                <li>Track your application status</li>
                <li>Receive course recommendations</li>
              </ul>
            </div>
            
            <p>You can now access all features of the admission portal.</p>
            
            <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our admissions team.</p>
            
            <p style="margin-top: 20px;">Best regards,<br><strong>CTU Daanbantayan Campus</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CTU Daanbantayan Campus. All rights reserved.</p>
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error - welcome email is not critical
  }
};

// Send application submission confirmation email
const sendApplicationSubmittedEmail = async (email, fullName, trackingCode) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Application Submitted Successfully - CTU Daanbantayan Campus',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .tracking-box { background: #f0f4ff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0; }
          .tracking-code { font-size: 28px; font-weight: bold; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Application Submitted!</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName}! 👋</h2>
            
            <div class="highlight">
              <strong>🎉 Congratulations!</strong> Your application to <strong>CTU Daanbantayan Campus</strong> has been successfully submitted.
            </div>
            
            <p>Your application is now being reviewed by our team. You can track the status of your application using the tracking code below:</p>
            
            <div class="tracking-box">
              <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Tracking Code</div>
              <div class="tracking-code">${trackingCode}</div>
              <div style="font-size: 12px; color: #999; margin-top: 10px;">Keep this code safe for future reference</div>
            </div>
            
            <div class="info-box">
              <strong>📋 What's Next?</strong>
              <ul style="margin: 10px 0;">
                <li>Our team will review your application</li>
                <li>You'll receive updates via email and mobile notifications</li>
                <li>Use your tracking code to check application status anytime</li>
                <li>Prepare for the next steps in the admission process</li>
              </ul>
            </div>
            
            <p><strong>Important:</strong> Please check your email regularly for updates regarding your application status.</p>
            
            <p style="margin-top: 30px;">If you have any questions, feel free to contact our admissions office.</p>
            
            <p style="margin-top: 20px;">Best regards,<br><strong>CTU Daanbantayan Campus Admissions Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CTU Daanbantayan Campus. All rights reserved.</p>
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Application submission email sent to:', email);
  } catch (error) {
    console.error('Error sending application submission email:', error);
    // Don't throw error - email is not critical for application submission
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendApplicationSubmittedEmail,
  generateVerificationCode 
};
