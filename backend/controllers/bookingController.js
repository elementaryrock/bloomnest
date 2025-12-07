const { Booking, Session } = require('../models');
const bookingService = require('../services/bookingService');
const { validationResult } = require('express-validator');

class BookingController {
  // Get available slots for a date and therapy type
  async getAvailableSlots(req, res) {
    try {
      const { date, therapyType } = req.query;

      if (!date || !therapyType) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Date and therapy type are required'
          }
        });
      }

      const slots = await bookingService.getAvailableSlots(date, therapyType);

      res.status(200).json({
        success: true,
        data: {
          date,
          therapyType,
          slots
        }
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SLOTS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get monthly booking count for a patient
  async getMonthlyBookingCount(req, res) {
    try {
      const { specialId, therapyType, date } = req.query;

      if (!specialId || !therapyType || !date) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Special ID, therapy type, and date are required'
          }
        });
      }

      const bookingCount = await bookingService.getMonthlyBookingCount(
        specialId,
        therapyType,
        date
      );

      res.status(200).json({
        success: true,
        data: bookingCount
      });
    } catch (error) {
      console.error('Get monthly booking count error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_COUNT_FAILED',
          message: error.message
        }
      });
    }
  }

  // Create a new booking
  async createBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array()
          }
        });
      }

      const { specialId, therapyType, date, timeSlot } = req.body;

      // Validate booking
      const validation = await bookingService.validateBooking({
        specialId,
        therapyType,
        date,
        timeSlot
      });

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BOOKING_VALIDATION_FAILED',
            message: validation.error
          }
        });
      }

      // Generate booking ID
      const bookingId = await bookingService.generateBookingId();

      // Create booking
      const booking = await Booking.create({
        bookingId,
        specialId,
        therapistId: validation.therapistId,
        therapyType,
        date: new Date(date),
        timeSlot,
        status: 'confirmed',
        bookedAt: new Date()
      });

      // Create corresponding session record
      const sessionId = `SES${bookingId.substring(2)}`;
      await Session.create({
        sessionId,
        bookingId: booking._id,
        specialId,
        therapistId: validation.therapistId,
        sessionDate: new Date(date)
      });

      // TODO: Send booking confirmation notification

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          bookingId: booking.bookingId,
          therapyType: booking.therapyType,
          date: booking.date,
          timeSlot: booking.timeSlot,
          status: booking.status
        }
      });
    } catch (error) {
      console.error('Create booking error:', error);

      // Handle duplicate booking error
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'BOOKING_CONFLICT',
            message: 'This slot is already booked. Please select another time.'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'BOOKING_CREATION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Create booking by receptionist/admin
  async createBookingByReceptionist(req, res) {
    try {
      const { specialId, therapyType, date, timeSlot, therapistId } = req.body;

      // Validate booking
      const validation = await bookingService.validateBooking(
        specialId,
        therapyType,
        date,
        timeSlot
      );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: validation.code,
            message: validation.message
          }
        });
      }

      // Generate booking ID
      const bookingCount = await Booking.countDocuments();
      const bookingId = `BK${String(bookingCount + 1).padStart(8, '0')}`;

      // Create booking
      const booking = await Booking.create({
        bookingId,
        specialId,
        therapyType,
        date: new Date(date),
        timeSlot,
        therapistId: therapistId || validation.therapistId,
        status: 'confirmed',
        bookedAt: new Date(),
        bookedBy: req.user.userId
      });

      // Create corresponding session record
      const sessionId = `SES${bookingId.substring(2)}`;
      await Session.create({
        sessionId,
        bookingId: booking._id,
        specialId,
        therapistId: therapistId || validation.therapistId,
        sessionDate: new Date(date)
      });

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          bookingId: booking.bookingId,
          therapyType: booking.therapyType,
          date: booking.date,
          timeSlot: booking.timeSlot,
          status: booking.status
        }
      });
    } catch (error) {
      console.error('Create booking by receptionist error:', error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'BOOKING_CONFLICT',
            message: 'This slot is already booked. Please select another time.'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'BOOKING_CREATION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get current user's bookings (for parents)
  async getMyBookings(req, res) {
    try {
      const specialId = req.user.specialId;

      if (!specialId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_SPECIAL_ID',
            message: 'User does not have a Special ID'
          }
        });
      }

      // Get all bookings for this patient that are upcoming or recent
      const bookings = await Booking.find({
        specialId,
        status: { $in: ['confirmed', 'completed'] }
      })
        .sort({ date: -1 })
        .limit(50);

      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get my bookings error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKINGS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get patient bookings
  async getPatientBookings(req, res) {
    try {
      const { specialId } = req.params;
      const { status, upcoming } = req.query;

      const query = { specialId };

      if (status) {
        query.status = status;
      }

      if (upcoming === 'true') {
        query.date = { $gte: new Date() };
      }

      const bookings = await Booking.find(query)
        .populate('therapistId', 'specialization')
        .sort({ date: 1, timeSlot: 1 });

      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get patient bookings error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKINGS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;

      const booking = await Booking.findOne({ bookingId });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'Booking not found'
          }
        });
      }

      // Check if booking belongs to the user (for parents)
      if (req.user.role === 'parent' && booking.specialId !== req.user.specialId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You can only cancel your own bookings'
          }
        });
      }

      // Check if cancellation is allowed (24 hours before)
      if (!bookingService.canCancelBooking(booking.date)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANCELLATION_NOT_ALLOWED',
            message: 'Bookings can only be cancelled at least 24 hours before the scheduled time'
          }
        });
      }

      // Update booking status
      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.cancellationReason = reason;
      await booking.save();

      // TODO: Send cancellation notification

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CANCELLATION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get all bookings (admin/receptionist)
  async getAllBookings(req, res) {
    try {
      const { page = 1, limit = 20, status, date } = req.query;

      const query = {};

      if (status) {
        query.status = status;
      }

      if (date) {
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = { $gte: searchDate, $lt: nextDay };
      }

      const bookings = await Booking.find(query)
        .populate('therapistId', 'specialization')
        .sort({ date: -1, timeSlot: 1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Booking.countDocuments(query);

      res.status(200).json({
        success: true,
        data: bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKINGS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get bookings by date (admin/receptionist)
  async getBookingsByDate(req, res) {
    try {
      const { date } = req.params;

      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const bookings = await Booking.find({
        date: { $gte: searchDate, $lt: nextDay }
      })
        .populate('therapistId', 'specialization')
        .sort({ timeSlot: 1 });

      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get bookings by date error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOOKINGS_FAILED',
          message: error.message
        }
      });
    }
  }
}

module.exports = new BookingController();
