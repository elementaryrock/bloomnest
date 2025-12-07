const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // Use TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Therapy Unit - MEC" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
            attachments
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result.messageId);

        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        throw new Error('Failed to send email');
    }
};

// Email Templates
const templates = {
    // Booking confirmation email
    bookingConfirmation: (data) => ({
        subject: `Booking Confirmed - ${data.therapyType} on ${data.date}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Therapy Unit - MEC</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Booking Confirmed!</h2>
          <p style="color: #4b5563;">Dear ${data.parentName},</p>
          <p style="color: #4b5563;">Your therapy session has been confirmed.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Child:</strong> ${data.childName}</p>
            <p><strong>Special ID:</strong> ${data.specialId}</p>
            <p><strong>Therapy:</strong> ${data.therapyType}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.timeSlot}</p>
          </div>
          
          <p style="color: #4b5563;">Please arrive 10 minutes before your scheduled time.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you need to cancel or reschedule, please do so at least 24 hours in advance.
          </p>
        </div>
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Marian Engineering College Therapy Unit
          </p>
        </div>
      </div>
    `
    }),

    // Session completion email
    sessionCompletion: (data) => ({
        subject: `Session Summary - ${data.date}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Session Summary</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="color: #4b5563;">Dear ${data.parentName},</p>
          <p style="color: #4b5563;">Here's a summary of today's therapy session:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Session Details</h3>
            <p><strong>Therapy Type:</strong> ${data.therapyType}</p>
            <p><strong>Progress:</strong> ${data.progressLevel}</p>
            
            <h4 style="color: #1f2937;">Activities:</h4>
            <p style="color: #4b5563;">${data.activities}</p>
            
            <h4 style="color: #1f2937;">Recommendations:</h4>
            <p style="color: #4b5563;">${data.recommendations || 'No specific recommendations'}</p>
          </div>
        </div>
      </div>
    `
    }),

    // OTP email (fallback if SMS fails)
    otpEmail: (data) => ({
        subject: 'Your Login OTP - Therapy Unit',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Login OTP</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb; text-align: center;">
          <p style="color: #4b5563;">Your one-time password is:</p>
          <div style="background-color: #2563eb; color: white; font-size: 32px; font-weight: bold; padding: 20px 40px; border-radius: 8px; display: inline-block; letter-spacing: 8px; margin: 20px 0;">
            ${data.otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This OTP is valid for 5 minutes. Do not share it with anyone.
          </p>
        </div>
      </div>
    `
    }),

    // Welcome email for new patients
    welcomePatient: (data) => ({
        subject: 'Welcome to Therapy Unit - MEC',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Therapy Unit</h1>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937;">Registration Successful!</h2>
          <p style="color: #4b5563;">Dear ${data.parentName},</p>
          <p style="color: #4b5563;">${data.childName} has been successfully registered at our therapy unit.</p>
          
          <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Special ID</p>
            <p style="font-size: 28px; font-weight: bold; margin: 10px 0; letter-spacing: 2px;">${data.specialId}</p>
            <p style="margin: 0; font-size: 12px;">Please save this ID for future reference</p>
          </div>
          
          <p style="color: #4b5563;">You can use this Special ID along with your registered phone number to log in and book therapy sessions.</p>
        </div>
      </div>
    `
    })
};

/**
 * Send templated email
 * @param {string} templateName - Template name
 * @param {string} to - Recipient email
 * @param {Object} data - Template data
 */
const sendTemplatedEmail = async (templateName, to, data) => {
    const template = templates[templateName];
    if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
    }

    const { subject, html } = template(data);
    return sendEmail({ to, subject, html });
};

module.exports = {
    sendEmail,
    sendTemplatedEmail,
    templates
};
