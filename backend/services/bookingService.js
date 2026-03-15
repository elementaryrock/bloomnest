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
    const { specialId, therapistId, therapyType, date, timeSlot } = bookingData;

    if (!therapistId) {
      return {
        valid: false,
        error: 'Please select a specific therapist for the booking.'
      };
    }

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

    // 1b. Check if therapist exists and is active
    const therapist = await Therapist.findOne({ _id: therapistId, isAvailable: true });
    if (!therapist) {
      return {
        valid: false,
        error: 'Selected therapist not found or currently unavailable'
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

    // 4. Check if slot is already booked for this specific therapist
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingBooking = await Booking.findOne({
      date: { $gte: bookingDate, $lt: nextDay },
      therapistId,
      timeSlot,
      status: { $in: ['confirmed', 'completed'] }
    });

    if (existingBooking) {
      return {
        valid: false,
        error: 'This therapist is already booked for this time slot. Please select another time or therapist.'
      };
    }

    // 5. Check if patient already has a booking at the same time (with any therapist)
    const patientConflict = await Booking.findOne({
      specialId,
      date: { $gte: bookingDate, $lt: nextDay },
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
      therapistId: therapistId
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
   * Get available slots for a specific date and therapist
   */
  async getAvailableSlots(date, therapistId) {
    if (!therapistId) {
      throw new Error('Therapist ID is required to get available slots');
    }

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

    // Get all bookings for this date and specific therapist (use date range for robustness)
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookings = await Booking.find({
      date: { $gte: bookingDate, $lt: nextDay },
      therapistId,
      status: { $in: ['confirmed', 'completed'] }
    });

    // Calculate available slots
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
    const datePrefix = `BK${year}${month}${day}`;

    // Find highest booking ID for today based on highest existing sequence
    const lastBookingToday = await Booking.findOne({
      bookingId: new RegExp(`^${datePrefix}`)
    })
      .sort({ bookingId: -1 })
      .select('bookingId');

    let nextSequence = 1;
    if (lastBookingToday && lastBookingToday.bookingId) {
      // Extract the 4-digit sequence from the end
      const lastSeq = parseInt(lastBookingToday.bookingId.slice(-4), 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    const sequence = String(nextSequence).padStart(4, '0');

    return `${datePrefix}${sequence}`;
  }
}

module.exports = new BookingService();
