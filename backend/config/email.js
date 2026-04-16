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

// Send application submission confirmation email with tracking code and guide
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
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .tracking-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0; }
          .tracking-code { font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 5px; font-family: 'Courier New', monospace; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; }
          .footer { background: #ffffff; text-align: center; padding: 20px; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
          .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .step { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #667eea; }
          .step-number { display: inline-block; width: 30px; height: 30px; background: #667eea; color: white; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 10px; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Application Submitted Successfully!</h1>
          </div>
          <div class="content">
            <h2>Dear ${fullName},</h2>
            
            <p>Thank you for submitting your application to <strong>Cebu Technological University - Daanbantayan Campus</strong>. We have successfully received your application and it is now under review.</p>
            
            <div class="tracking-box">
              <div style="font-size: 14px; color: #ffffff; margin-bottom: 10px; opacity: 0.9;">📍 Your Tracking Code</div>
              <div class="tracking-code">${trackingCode}</div>
              <div style="font-size: 12px; color: #ffffff; margin-top: 10px; opacity: 0.8;">Save this code to track your application status</div>
            </div>
            
            <div class="info-box">
              <strong>📱 How to Track Your Application:</strong>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Open the CTU Admission Portal mobile app</li>
                <li>Go to "Track Application" from the menu</li>
                <li>Enter your tracking code: <strong>${trackingCode}</strong></li>
                <li>View real-time updates on your application status</li>
              </ol>
            </div>

            <h3 style="color: #1a1a2e; margin-top: 30px;">📋 Admission Process Guide</h3>
            
            <div class="step">
              <span class="step-number">1</span>
              <strong>Application Review</strong>
              <p style="margin: 5px 0 0 40px; color: #666;">Our team will review your submitted documents and information. This typically takes 3-5 business days.</p>
            </div>

            <div class="step">
              <span class="step-number">2</span>
              <strong>Screening</strong>
              <p style="margin: 5px 0 0 40px; color: #666;">Initial screening of your academic qualifications and eligibility for your chosen program.</p>
            </div>

            <div class="step">
              <span class="step-number">3</span>
              <strong>Entrance Examination</strong>
              <p style="margin: 5px 0 0 40px; color: #666;">You'll receive an email with the exam schedule, venue, and instructions. Make sure to check your tracking page regularly.</p>
            </div>

            <div class="step">
              <span class="step-number">4</span>
              <strong>Interview</strong>
              <p style="margin: 5px 0 0 40px; color: #666;">Qualified applicants will be scheduled for an interview with the admissions committee.</p>
            </div>

            <div class="step">
              <span class="step-number">5</span>
              <strong>Enrollment Selection</strong>
              <p style="margin: 5px 0 0 40px; color: #666;">Successful applicants will receive enrollment instructions and deadlines.</p>
            </div>

            <div class="step">
              <span class="step-number">6</span>
              <strong>ID & Email Issuance</strong>
              <p style="margin: 5px 0 0 40px; color: #666;">Enrolled students will receive their student ID number and official CTU email address.</p>
            </div>

            <div class="info-box" style="background: #fff3cd; border-left-color: #ffc107;">
              <strong>⚠️ Important Reminders:</strong>
              <ul>
                <li>Check your email and mobile app regularly for updates</li>
                <li>Keep your tracking code safe and accessible</li>
                <li>Respond promptly to any requests from the admissions team</li>
                <li>Prepare required documents in advance</li>
                <li>Contact us immediately if your contact information changes</li>
              </ul>
            </div>

            <h3 style="color: #1a1a2e; margin-top: 30px;">📞 Need Help?</h3>
            <p>If you have any questions or concerns about your application, please contact:</p>
            <ul>
              <li><strong>Email:</strong> admissions@ctu.edu.ph</li>
              <li><strong>Phone:</strong> (032) XXX-XXXX</li>
              <li><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</li>
            </ul>
            
            <p style="margin-top: 30px;">We look forward to welcoming you to the CTU family!</p>
            
            <p style="margin-top: 20px;">Best regards,<br><strong>CTU Daanbantayan Campus Admissions Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cebu Technological University - Daanbantayan Campus</p>
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

// Send password reset email
const sendResetPasswordEmail = async (email, fullName, resetCode) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Password Reset Request - CTU Daanbantayan Campus',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .code-box { background: linear-gradient(135deg, #f44336 0%, #e91e63 100%); border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0; }
          .code { font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <p>We received a request to reset your password for your CTU Admission Portal account.</p>
            
            <p>Use the code below to reset your password:</p>
            
            <div class="code-box">
              <div style="font-size: 14px; color: #ffffff; margin-bottom: 10px; opacity: 0.9;">Your Reset Code</div>
              <div class="code">${resetCode}</div>
              <div style="font-size: 12px; color: #ffffff; margin-top: 10px; opacity: 0.8;">Valid for 15 minutes</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>Never share this code with anyone</li>
                <li>CTU staff will never ask for your reset code</li>
                <li>This code expires in 15 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
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
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendApplicationSubmittedEmail,
  sendResetPasswordEmail,
  generateVerificationCode 
};
