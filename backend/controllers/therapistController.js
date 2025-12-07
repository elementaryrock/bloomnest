const { Therapist, Staff, Booking, Session, Patient } = require('../models');
const authService = require('../services/authService');
const { validationResult } = require('express-validator');

class TherapistController {
  // Get therapist's daily schedule
  async getDailySchedule(req, res) {
    try {
      // Find therapist by staff ID
      const therapist = await Therapist.findOne({ staffId: req.user.userId });

      if (!therapist) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'THERAPIST_NOT_FOUND',
            message: 'Therapist profile not found'
          }
        });
      }

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's bookings
      const bookings = await Booking.find({
        therapistId: therapist._id,
        date: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'completed'] }
      })
        .populate('specialId')
        .sort({ timeSlot: 1 });

      // Get patient details and session info for each booking
      const schedule = await Promise.all(
        bookings.map(async (booking) => {
          const patient = await Patient.findOne({ specialId: booking.specialId });
          const session = await Session.findOne({ bookingId: booking._id });

          return {
            bookingId: booking.bookingId,
            patient: {
              specialId: patient?.specialId,
              name: patient?.childName,
              photo: patient?.photoUrl,
              age: patient?.age,
              diagnosis: patient?.diagnosis
            },
            therapyType: booking.therapyType,
            timeSlot: booking.timeSlot,
            status: booking.status,
            sessionId: session?.sessionId,
            sessionCompleted: !!session?.completedAt
          };
        })
      );

      // Calculate statistics
      const totalSessions = schedule.length;
      const completedSessions = schedule.filter(s => s.sessionCompleted).length;
      const pendingSessions = totalSessions - completedSessions;

      res.status(200).json({
        success: true,
        data: {
          date: today,
          schedule,
          statistics: {
            totalSessions,
            completedSessions,
            pendingSessions
          }
        }
      });
    } catch (error) {
      console.error('Get daily schedule error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SCHEDULE_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get therapist schedule by ID (for admin/receptionist)
  async getTherapistScheduleById(req, res) {
    try {
      const { therapistId } = req.params;
      const { date } = req.query;

      const therapist = await Therapist.findOne({ therapistId });

      if (!therapist) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'THERAPIST_NOT_FOUND',
            message: 'Therapist not found'
          }
        });
      }

      // Use provided date or today
      const scheduleDate = date ? new Date(date) : new Date();
      scheduleDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(scheduleDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get bookings for the date
      const bookings = await Booking.find({
        therapistId: therapist._id,
        date: { $gte: scheduleDate, $lt: nextDay },
        status: { $in: ['confirmed', 'completed'] }
      })
        .sort({ timeSlot: 1 });

      // Get patient details for each booking
      const schedule = await Promise.all(
        bookings.map(async (booking) => {
          const patient = await Patient.findOne({ specialId: booking.specialId });
          const session = await Session.findOne({ bookingId: booking._id });

          return {
            bookingId: booking.bookingId,
            patient: {
              specialId: patient?.specialId,
              name: patient?.childName,
              photo: patient?.photoUrl
            },
            therapyType: booking.therapyType,
            timeSlot: booking.timeSlot,
            status: booking.status,
            sessionCompleted: !!session?.completedAt
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          therapist: {
            therapistId: therapist.therapistId,
            specialization: therapist.specialization
          },
          date: scheduleDate,
          schedule
        }
      });
    } catch (error) {
      console.error('Get therapist schedule error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SCHEDULE_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get available therapists by specialization (for booking - any authenticated user)
  async getAvailableTherapists(req, res) {
    try {
      const { specialization } = req.query;

      const query = { isAvailable: true };

      if (specialization) {
        query.specialization = specialization;
      }

      const therapists = await Therapist.find(query)
        .populate('staffId', 'name email')
        .sort({ specialization: 1 });

      // Format response with only needed fields for booking
      const formattedTherapists = therapists.map(t => ({
        _id: t._id,
        therapistId: t.therapistId,
        name: t.staffId?.name || 'Unknown',
        specialization: t.specialization,
        workingDays: t.workingDays
      }));

      res.status(200).json({
        success: true,
        data: formattedTherapists
      });
    } catch (error) {
      console.error('Get available therapists error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_THERAPISTS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get all therapists
  async getAllTherapists(req, res) {
    try {
      const { specialization, available } = req.query;

      const query = {};

      if (specialization) {
        query.specialization = specialization;
      }

      if (available !== undefined) {
        query.isAvailable = available === 'true';
      }

      const therapists = await Therapist.find(query)
        .populate('staffId', 'name email phone')
        .sort({ specialization: 1 });

      res.status(200).json({
        success: true,
        data: therapists
      });
    } catch (error) {
      console.error('Get all therapists error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_THERAPISTS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Add new therapist
  async addTherapist(req, res) {
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

      const {
        name,
        email,
        password,
        phone,
        specialization,
        qualification,
        workingDays,
        sessionsPerDay
      } = req.body;

      // Check if email already exists
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered'
          }
        });
      }

      // Hash password
      const hashedPassword = await authService.hashPassword(password);

      // Generate staff ID
      const staffCount = await Staff.countDocuments();
      const staffId = `STF${String(staffCount + 1).padStart(5, '0')}`;

      // Create staff record
      const staff = await Staff.create({
        staffId,
        name,
        email,
        password: hashedPassword,
        role: 'therapist',
        phone,
        isActive: true
      });

      // Generate therapist ID
      const therapistCount = await Therapist.countDocuments();
      const therapistId = `THR${String(therapistCount + 1).padStart(5, '0')}`;

      // Create therapist record
      const therapist = await Therapist.create({
        therapistId,
        staffId: staff._id,
        specialization,
        qualification,
        workingDays,
        sessionsPerDay: sessionsPerDay || 6,
        isAvailable: true
      });

      res.status(201).json({
        success: true,
        message: 'Therapist added successfully',
        data: {
          therapistId: therapist.therapistId,
          staffId: staff.staffId,
          name: staff.name,
          email: staff.email,
          specialization: therapist.specialization
        }
      });
    } catch (error) {
      console.error('Add therapist error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ADD_THERAPIST_FAILED',
          message: error.message
        }
      });
    }
  }

  // Update therapist
  async updateTherapist(req, res) {
    try {
      const { therapistId } = req.params;
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

      const therapist = await Therapist.findOne({ therapistId });

      if (!therapist) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'THERAPIST_NOT_FOUND',
            message: 'Therapist not found'
          }
        });
      }

      // Update allowed fields
      const allowedUpdates = ['qualification', 'workingDays', 'sessionsPerDay'];

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          therapist[field] = req.body[field];
        }
      });

      await therapist.save();

      res.status(200).json({
        success: true,
        message: 'Therapist updated successfully',
        data: therapist
      });
    } catch (error) {
      console.error('Update therapist error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_THERAPIST_FAILED',
          message: error.message
        }
      });
    }
  }

  // Toggle therapist availability
  async toggleAvailability(req, res) {
    try {
      const { therapistId } = req.params;
      const { isAvailable } = req.body;

      const therapist = await Therapist.findOne({ therapistId });

      if (!therapist) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'THERAPIST_NOT_FOUND',
            message: 'Therapist not found'
          }
        });
      }

      therapist.isAvailable = isAvailable;
      await therapist.save();

      res.status(200).json({
        success: true,
        message: `Therapist ${isAvailable ? 'activated' : 'deactivated'} successfully`,
        data: {
          therapistId: therapist.therapistId,
          isAvailable: therapist.isAvailable
        }
      });
    } catch (error) {
      console.error('Toggle availability error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TOGGLE_AVAILABILITY_FAILED',
          message: error.message
        }
      });
    }
  }
}

module.exports = new TherapistController();
