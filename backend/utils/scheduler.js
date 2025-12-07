const cron = require('node-cron');
const { sendTemplatedEmail } = require('./email');
const Booking = require('../models/Booking');
const Patient = require('../models/Patient');

// Store scheduled jobs for management
const scheduledJobs = {};

/**
 * Initialize all cron jobs
 */
const initializeCronJobs = () => {
    console.log('Initializing scheduled tasks...');

    // Daily reminder at 6 PM for next day appointments
    scheduledJobs.dailyReminder = cron.schedule('0 18 * * *', async () => {
        console.log(`[CRON] Running daily reminder job at ${new Date().toISOString()}`);
        await sendDailyReminders();
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata'
    });

    // Clean up expired OTPs every hour
    scheduledJobs.otpCleanup = cron.schedule('0 * * * *', () => {
        console.log(`[CRON] Cleaning up expired OTPs at ${new Date().toISOString()}`);
        // OTP cleanup is handled in the otp.js module automatically
    });

    // Weekly summary report on Sunday at 9 PM
    scheduledJobs.weeklyReport = cron.schedule('0 21 * * 0', async () => {
        console.log(`[CRON] Generating weekly report at ${new Date().toISOString()}`);
        await generateWeeklyReport();
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata'
    });

    console.log('All cron jobs initialized successfully');
};

/**
 * Send daily reminders for tomorrow's appointments
 */
const sendDailyReminders = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);

        // Find all bookings for tomorrow
        const bookings = await Booking.find({
            date: { $gte: tomorrow, $lt: dayAfter },
            status: 'confirmed'
        }).populate('patient');

        console.log(`[CRON] Found ${bookings.length} bookings for tomorrow`);

        for (const booking of bookings) {
            if (booking.patient?.parentEmail) {
                try {
                    await sendTemplatedEmail('bookingConfirmation', booking.patient.parentEmail, {
                        parentName: booking.patient.parentName,
                        childName: booking.patient.childName,
                        specialId: booking.patient.specialId,
                        therapyType: booking.therapyType,
                        date: booking.date.toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        timeSlot: booking.timeSlot
                    });
                    console.log(`[CRON] Reminder sent for booking ${booking._id}`);
                } catch (emailError) {
                    console.error(`[CRON] Failed to send reminder for booking ${booking._id}:`, emailError);
                }
            }
        }
    } catch (error) {
        console.error('[CRON] Daily reminder job failed:', error);
    }
};

/**
 * Generate weekly report (placeholder)
 */
const generateWeeklyReport = async () => {
    try {
        // This would generate a summary report
        // For now, just log that it ran
        console.log('[CRON] Weekly report generation completed');
    } catch (error) {
        console.error('[CRON] Weekly report generation failed:', error);
    }
};

/**
 * Stop all cron jobs
 */
const stopAllJobs = () => {
    Object.values(scheduledJobs).forEach(job => {
        if (job && typeof job.stop === 'function') {
            job.stop();
        }
    });
    console.log('All cron jobs stopped');
};

/**
 * Get status of all cron jobs
 */
const getJobsStatus = () => {
    return Object.entries(scheduledJobs).map(([name, job]) => ({
        name,
        running: job ? true : false
    }));
};

module.exports = {
    initializeCronJobs,
    stopAllJobs,
    getJobsStatus,
    sendDailyReminders
};
