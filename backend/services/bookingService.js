const { Booking, Therapist, Patient } = require('../models');

class BookingService {
  /**
   * Get day name from date
   */
  getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  /**
   * Validate booking against all business rules
   */
  async validateBooking(bookingData) {
    const { specialId, therapyType, date, timeSlot } = bookingData;

    // Ensure date is a Date object
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // 1. Check if patient exists and is active
    const patient = await Patient.findOne({ specialId, isActive: true });
    if (!patient) {
      return {
        valid: false,
        error: 'Patient not found or inactive'
      };
    }

    // 2. Check if date is within 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (bookingDate < today) {
      return {
        valid: false,
        error: 'Cannot book sessions in the past'
      };
    }

    if (bookingDate > maxDate) {
      return {
        valid: false,
        error: 'Booking must be within 30 days from today'
      };
    }

    // 3. Check monthly limit (2 per therapy type per month)
    const startOfMonth = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), 1);
    const endOfMonth = new Date(bookingDate.getFullYear(), bookingDate.getMonth() + 1, 0);

    const monthlyBookings = await Booking.countDocuments({
      specialId,
      therapyType,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ['confirmed', 'completed'] }
    });

    if (monthlyBookings >= 2) {
      return {
        valid: false,
        error: `Monthly limit reached for ${therapyType}. You can only book 2 sessions per therapy type per month.`
      };
    }

    // 4. Check if slot is already booked for this therapy type
    const existingBooking = await Booking.findOne({
      date: bookingDate,
      therapyType,
      timeSlot,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (existingBooking) {
      return {
        valid: false,
        error: 'This time slot is already booked. Please select another time.'
      };
    }

    // 5. Check if patient already has a booking at the same time
    const patientConflict = await Booking.findOne({
      specialId,
      date: bookingDate,
      timeSlot,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (patientConflict) {
      return {
        valid: false,
        error: 'You already have a booking at this time'
      };
    }

    return {
      valid: true,
      therapistId: null // No therapist assignment in simple mode
    };
  }

  /**
   * Check if cancellation is allowed (24 hours before)
   */
  canCancelBooking(bookingDate) {
    const now = new Date();
    const booking = new Date(bookingDate);
    const hoursDifference = (booking - now) / (1000 * 60 * 60);

    return hoursDifference >= 24;
  }

  /**
   * Get monthly booking count for a patient and therapy type
   */
  async getMonthlyBookingCount(specialId, therapyType, date) {
    const bookingDate = new Date(date);
    const startOfMonth = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), 1);
    const endOfMonth = new Date(bookingDate.getFullYear(), bookingDate.getMonth() + 1, 0);

    const count = await Booking.countDocuments({
      specialId,
      therapyType,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ['confirmed', 'completed'] }
    });

    return {
      count,
      limit: 2,
      remaining: Math.max(0, 2 - count)
    };
  }

  /**
   * Get available slots for a specific date and therapy type
   */
  async getAvailableSlots(date, therapyType) {
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Define time slots (9 AM to 5 PM, 1-hour sessions)
    const timeSlots = [
      '9:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 1:00 PM',
      '2:00 PM - 3:00 PM',
      '3:00 PM - 4:00 PM',
      '4:00 PM - 5:00 PM'
    ];

    // Get all bookings for this date and therapy type
    const bookings = await Booking.find({
      date: bookingDate,
      therapyType,
      status: { $in: ['confirmed', 'completed'] }
    });

    // Calculate available slots (each slot has capacity of 1 in simple mode)
    const availableSlots = timeSlots.map(slot => {
      const isBooked = bookings.some(b => b.timeSlot === slot);
      return {
        time: slot,
        timeSlot: slot,
        available: !isBooked,
        isAvailable: !isBooked,
        availableCount: isBooked ? 0 : 1
      };
    });

    return availableSlots;
  }

  /**
   * Generate unique booking ID
   */
  async generateBookingId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Count bookings today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const todayCount = await Booking.countDocuments({
      bookedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const sequence = String(todayCount + 1).padStart(4, '0');

    return `BK${year}${month}${day}${sequence}`;
  }
}

module.exports = new BookingService();
