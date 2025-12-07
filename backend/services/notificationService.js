const nodemailer = require('nodemailer');
const { Notification, Patient } = require('../models');

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Create notification record in database
   */
  async createNotification(data) {
    try {
      const notification = await Notification.create({
        recipientId: data.recipientId,
        recipientType: data.recipientType,
        type: data.type,
        message: data.message,
        channel: data.channel,
        sentAt: new Date()
      });

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(to, subject, htmlContent, attachments = []) {
    try {
      const mailOptions = {
        from: `"Marian Engineering College - Therapy Unit" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
        attachments
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Send email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification (using Twilio)
   */
  async sendSMS(phoneNumber, message) {
    try {
      // TODO: Implement Twilio SMS sending
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // const result = await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // });

      console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      return { success: true, message: 'SMS sending not yet implemented' };
    } catch (error) {
      console.error('Send SMS error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking confirmation notification
   */
  async sendBookingConfirmation(booking, patient) {
    try {
      const message = `Your therapy session has been confirmed!\n\nDetails:\n- Therapy Type: ${booking.therapyType}\n- Date: ${new Date(booking.date).toLocaleDateString()}\n- Time: ${booking.timeSlot}\n- Booking ID: ${booking.bookingId}\n\nPlease arrive 10 minutes before your scheduled time.`;

      // Create notification record
      await this.createNotification({
        recipientId: patient.specialId,
        recipientType: 'parent',
        type: 'booking_confirmed',
        message,
        channel: 'email'
      });

      // Send email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Confirmation</h2>
          <p>Dear ${patient.parentName},</p>
          <p>Your therapy session for <strong>${patient.childName}</strong> has been confirmed!</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Session Details</h3>
            <p><strong>Therapy Type:</strong> ${booking.therapyType}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.timeSlot}</p>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          </div>
          
          <p><strong>Important:</strong> Please arrive 10 minutes before your scheduled time.</p>
          
          <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
          
          <p>Best regards,<br>Marian Engineering College<br>Therapy Unit</p>
        </div>
      `;

      await this.sendEmail(
        patient.parentEmail,
        'Therapy Session Confirmed',
        emailHtml
      );

      // Send SMS
      await this.sendSMS(patient.parentPhone, message);

      return { success: true };
    } catch (error) {
      console.error('Send booking confirmation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send session reminder notification (24 hours before)
   */
  async sendSessionReminder(booking, patient) {
    try {
      const message = `Reminder: You have a therapy session tomorrow!\n\nDetails:\n- Therapy Type: ${booking.therapyType}\n- Date: ${new Date(booking.date).toLocaleDateString()}\n- Time: ${booking.timeSlot}\n\nSee you tomorrow!`;

      // Create notification record
      await this.createNotification({
        recipientId: patient.specialId,
        recipientType: 'parent',
        type: 'session_reminder',
        message,
        channel: 'sms'
      });

      // Send SMS
      await this.sendSMS(patient.parentPhone, message);

      // Send email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Session Reminder</h2>
          <p>Dear ${patient.parentName},</p>
          <p>This is a friendly reminder about tomorrow's therapy session for <strong>${patient.childName}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Session Details</h3>
            <p><strong>Therapy Type:</strong> ${booking.therapyType}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.timeSlot}</p>
          </div>
          
          <p>Please arrive 10 minutes before your scheduled time.</p>
          
          <p>Best regards,<br>Marian Engineering College<br>Therapy Unit</p>
        </div>
      `;

      await this.sendEmail(
        patient.parentEmail,
        'Therapy Session Reminder - Tomorrow',
        emailHtml
      );

      return { success: true };
    } catch (error) {
      console.error('Send session reminder error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send session completed notification
   */
  async sendSessionCompletedNotification(session, patient) {
    try {
      const message = `Session completed for ${patient.childName}. Session notes are now available in your dashboard.`;

      // Create notification record
      await this.createNotification({
        recipientId: patient.specialId,
        recipientType: 'parent',
        type: 'session_completed',
        message,
        channel: 'email'
      });

      // Send email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Session Completed</h2>
          <p>Dear ${patient.parentName},</p>
          <p>The therapy session for <strong>${patient.childName}</strong> has been completed.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Session Summary</h3>
            <p><strong>Date:</strong> ${new Date(session.sessionDate).toLocaleDateString()}</p>
            <p><strong>Progress Level:</strong> ${session.progressLevel}</p>
          </div>
          
          <p>Detailed session notes are now available in your parent dashboard.</p>
          
          <p><strong>Recommendations for home:</strong></p>
          <p>${session.recommendationsForParents}</p>
          
          <p>Best regards,<br>Marian Engineering College<br>Therapy Unit</p>
        </div>
      `;

      await this.sendEmail(
        patient.parentEmail,
        'Therapy Session Completed',
        emailHtml
      );

      return { success: true };
    } catch (error) {
      console.error('Send session completed notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send assessment completed notification with PDF
   */
  async sendAssessmentCompletedNotification(assessment, patient, pdfPath) {
    try {
      const message = `Assessment completed for ${patient.childName}. The detailed report has been sent to your email.`;

      // Create notification record
      await this.createNotification({
        recipientId: patient.specialId,
        recipientType: 'parent',
        type: 'assessment_completed',
        message,
        channel: 'email'
      });

      // Prepare attachment
      const attachments = pdfPath ? [{
        filename: `Assessment_${assessment.assessmentId}.pdf`,
        path: pdfPath
      }] : [];

      // Send email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Assessment Report Ready</h2>
          <p>Dear ${patient.parentName},</p>
          <p>The bi-monthly assessment for <strong>${patient.childName}</strong> has been completed.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Assessment Details</h3>
            <p><strong>Assessment ID:</strong> ${assessment.assessmentId}</p>
            <p><strong>Assessment Date:</strong> ${new Date(assessment.assessmentDate).toLocaleDateString()}</p>
            <p><strong>Completed On:</strong> ${new Date(assessment.completedAt).toLocaleDateString()}</p>
          </div>
          
          <p>Please find the detailed assessment report attached to this email.</p>
          
          <p>If you have any questions about the assessment, please feel free to contact us.</p>
          
          <p>Best regards,<br>Marian Engineering College<br>Therapy Unit</p>
        </div>
      `;

      await this.sendEmail(
        patient.parentEmail,
        'Assessment Report - ' + patient.childName,
        emailHtml,
        attachments
      );

      return { success: true };
    } catch (error) {
      console.error('Send assessment completed notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking cancellation notification
   */
  async sendBookingCancellationNotification(booking, patient, reason) {
    try {
      const message = `Your therapy session has been cancelled.\n\nDetails:\n- Therapy Type: ${booking.therapyType}\n- Date: ${new Date(booking.date).toLocaleDateString()}\n- Time: ${booking.timeSlot}\n${reason ? `\nReason: ${reason}` : ''}`;

      // Create notification record
      await this.createNotification({
        recipientId: patient.specialId,
        recipientType: 'parent',
        type: 'booking_cancelled',
        message,
        channel: 'email'
      });

      // Send email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Booking Cancelled</h2>
          <p>Dear ${patient.parentName},</p>
          <p>Your therapy session for <strong>${patient.childName}</strong> has been cancelled.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0;">Cancelled Session Details</h3>
            <p><strong>Therapy Type:</strong> ${booking.therapyType}</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.timeSlot}</p>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>
          
          <p>You can book a new session through your parent dashboard.</p>
          
          <p>Best regards,<br>Marian Engineering College<br>Therapy Unit</p>
        </div>
      `;

      await this.sendEmail(
        patient.parentEmail,
        'Therapy Session Cancelled',
        emailHtml
      );

      // Send SMS
      await this.sendSMS(patient.parentPhone, message);

      return { success: true };
    } catch (error) {
      console.error('Send booking cancellation notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(recipientId, limit = 20) {
    try {
      const notifications = await Notification.find({ recipientId })
        .sort({ createdAt: -1 })
        .limit(limit);

      return notifications;
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await Notification.updateOne(
        { _id: notificationId },
        { isRead: true }
      );
      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
