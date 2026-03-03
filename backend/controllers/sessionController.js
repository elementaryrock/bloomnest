const { Session, Booking, Therapist, Patient } = require('../models');
const { validationResult } = require('express-validator');

class SessionController {
  // Start session
  async startSession(req, res) {
    try {
      const { sessionId } = req.params;

      // Find therapist
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

      // Find session
      const session = await Session.findOne({ sessionId, therapistId: therapist._id });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or you do not have permission to access it'
          }
        });
      }

      if (session.startTime) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SESSION_ALREADY_STARTED',
            message: 'Session has already been started'
          }
        });
      }

      // Start session
      session.startTime = new Date();
      await session.save();

      res.status(200).json({
        success: true,
        message: 'Session started successfully',
        data: {
          sessionId: session.sessionId,
          startTime: session.startTime
        }
      });
    } catch (error) {
      console.error('Start session error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'START_SESSION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Complete session with notes
  async completeSession(req, res) {
    try {
      const { sessionId } = req.params;
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

      // Find therapist
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

      // Find session
      const session = await Session.findOne({ sessionId, therapistId: therapist._id });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found or you do not have permission to access it'
          }
        });
      }

      if (session.completedAt) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SESSION_ALREADY_COMPLETED',
            message: 'Session has already been completed'
          }
        });
      }

      const {
        activitiesConducted,
        goalsAddressed,
        progressLevel,
        behavioralObservations,
        recommendationsForParents,
        nextSessionFocus
      } = req.body;

      // Update session with notes
      session.activitiesConducted = activitiesConducted;
      session.goalsAddressed = goalsAddressed;
      session.progressLevel = progressLevel;
      session.behavioralObservations = behavioralObservations;
      session.recommendationsForParents = recommendationsForParents;
      session.nextSessionFocus = nextSessionFocus;
      session.endTime = new Date();
      session.completedAt = new Date();

      await session.save();

      // Update booking status to completed
      await Booking.updateOne(
        { _id: session.bookingId },
        { status: 'completed' }
      );

      // TODO: Send notification to parent

      res.status(200).json({
        success: true,
        message: 'Session completed successfully',
        data: {
          sessionId: session.sessionId,
          completedAt: session.completedAt
        }
      });
    } catch (error) {
      console.error('Complete session error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'COMPLETE_SESSION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get session by ID
  async getSession(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await Session.findOne({ sessionId })
        .populate('therapistId', 'specialization qualification')
        .populate('bookingId');

      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
      }

      // Get patient details
      const patient = await Patient.findOne({ specialId: session.specialId });

      res.status(200).json({
        success: true,
        data: {
          session,
          patient: {
            specialId: patient?.specialId,
            childName: patient?.childName,
            photoUrl: patient?.photoUrl,
            diagnosis: patient?.diagnosis
          }
        }
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SESSION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get patient session history
  async getPatientSessionHistory(req, res) {
    try {
      const { specialId } = req.params;

      // Verify patient exists
      const patient = await Patient.findOne({ specialId });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Patient not found'
          }
        });
      }

      // Get all completed sessions
      const sessions = await Session.find({
        specialId,
        completedAt: { $exists: true, $ne: null }
      })
        .populate('therapistId', 'specialization')
        .populate('bookingId', 'therapyType date timeSlot')
        .sort({ sessionDate: -1 });

      res.status(200).json({
        success: true,
        data: {
          patient: {
            specialId: patient.specialId,
            childName: patient.childName
          },
          sessions,
          totalSessions: sessions.length
        }
      });
    } catch (error) {
      console.error('Get patient session history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_HISTORY_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get all sessions (admin/receptionist)
  async getAllSessions(req, res) {
    try {
      const { page = 1, limit = 20, completed, specialId } = req.query;

      const query = {};

      if (completed === 'true') {
        query.completedAt = { $exists: true, $ne: null };
      } else if (completed === 'false') {
        query.completedAt = null;
      }

      if (specialId) {
        query.specialId = specialId;
      }

      const sessions = await Session.find(query)
        .populate('therapistId', 'specialization')
        .populate('bookingId', 'therapyType date timeSlot status')
        .sort({ sessionDate: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Session.countDocuments(query);

      res.status(200).json({
        success: true,
        data: sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all sessions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SESSIONS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get today's sessions for therapist
  async getTodaySessions(req, res) {
    console.log('[DEBUG] getTodaySessions called - userId:', req.user?.userId);
    try {
      const { Staff } = require('../models');

      // Find staff record first
      const staff = await Staff.findById(req.user.userId);

      if (!staff) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'STAFF_NOT_FOUND',
            message: 'Staff profile not found'
          }
        });
      }

      // Find therapist by staff ObjectId
      const therapist = await Therapist.findOne({ staffId: staff._id });

      if (!therapist) {
        // Return empty sessions for staff without therapist profile
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Query bookings - either assigned to this therapist OR matching their specialization (for unassigned bookings)
      const bookings = await Booking.find({
        $or: [
          { therapistId: therapist._id },
          { therapistId: { $exists: false }, therapyType: { $in: therapist.specialization } },
          { therapistId: null, therapyType: { $in: therapist.specialization } }
        ],
        date: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'completed'] }
      }).sort({ timeSlot: 1 });

      // Get sessions and patient details
      const sessionsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const patient = await Patient.findOne({ specialId: booking.specialId });
          const session = await Session.findOne({ bookingId: booking._id });

          return {
            id: session?._id || booking._id,
            sessionId: session?.sessionId,
            bookingId: booking.bookingId,
            therapyType: booking.therapyType,
            timeSlot: booking.timeSlot,
            status: session?.completedAt ? 'completed' : session?.startTime ? 'in-progress' : 'pending',
            patient: {
              specialId: patient?.specialId,
              childName: patient?.childName,
              photoUrl: patient?.photoUrl,
              diagnosis: patient?.diagnosis
            }
          };
        })
      );

      res.status(200).json({
        success: true,
        data: sessionsWithDetails
      });
    } catch (error) {
      console.error('Get today sessions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_TODAY_SESSIONS_FAILED',
          message: error.message
        }
      });
    }
  }
}

module.exports = new SessionController();
