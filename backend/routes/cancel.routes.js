const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authenticate = require('../middleware/auth');
const { sendTemplatedEmail } = require('../utils/email');

/**
 * Cancel a booking
 * POST /api/bookings/:bookingId/cancel
 */
router.post('/:bookingId/cancel', authenticate, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;

        const booking = await Booking.findById(bookingId).populate('patient');

        if (!booking) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Booking not found' }
            });
        }

        // Check if already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: { code: 'ALREADY_CANCELLED', message: 'Booking is already cancelled' }
            });
        }

        // Check 24-hour rule
        const bookingDate = new Date(booking.date);
        const hoursUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60);

        if (hoursUntilBooking < 24) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANCELLATION_TOO_LATE',
                    message: 'Bookings must be cancelled at least 24 hours in advance'
                }
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'No reason provided';
        booking.cancelledAt = new Date();
        booking.cancelledBy = req.user._id;
        await booking.save();

        // Send cancellation notification
        if (booking.patient?.parentEmail) {
            try {
                await sendTemplatedEmail('bookingCancellation', booking.patient.parentEmail, {
                    parentName: booking.patient.parentName,
                    childName: booking.patient.childName,
                    therapyType: booking.therapyType,
                    date: booking.date.toLocaleDateString('en-IN'),
                    timeSlot: booking.timeSlot,
                    reason: booking.cancellationReason
                });
            } catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to cancel booking' }
        });
    }
});

module.exports = router;
