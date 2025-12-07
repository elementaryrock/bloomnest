const { Patient, Therapist, Booking, Session, Staff } = require('../models');

class AdminController {
  // Get system statistics
  async getSystemStats(req, res) {
    try {
      // Get current month date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Total patients
      const totalPatients = await Patient.countDocuments({ isActive: true });

      // Total therapists
      const totalTherapists = await Therapist.countDocuments({ isAvailable: true });

      // Completed sessions this month
      const completedSessionsThisMonth = await Session.countDocuments({
        completedAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      // Pending sessions (confirmed bookings without completed sessions)
      const pendingSessions = await Booking.countDocuments({
        status: 'confirmed',
        date: { $gte: now }
      });

      // Total bookings this month
      const totalBookingsThisMonth = await Booking.countDocuments({
        bookedAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      // Cancelled bookings this month
      const cancelledBookingsThisMonth = await Booking.countDocuments({
        status: 'cancelled',
        cancelledAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      // New patients this month
      const newPatientsThisMonth = await Patient.countDocuments({
        registrationDate: { $gte: startOfMonth, $lte: endOfMonth }
      });

      res.status(200).json({
        success: true,
        data: {
          totalPatients,
          totalTherapists,
          completedSessionsThisMonth,
          pendingSessions,
          totalBookingsThisMonth,
          cancelledBookingsThisMonth,
          newPatientsThisMonth,
          month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
        }
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_STATS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get therapist utilization
  async getTherapistUtilization(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Default to current month if no dates provided
      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      // Get all therapists
      const therapists = await Therapist.find({ isAvailable: true })
        .populate('staffId', 'name');

      const utilizationData = await Promise.all(
        therapists.map(async (therapist) => {
          // Count working days in the period
          const workingDays = this.countWorkingDays(start, end, therapist.workingDays);
          
          // Total available slots
          const totalAvailableSlots = workingDays * therapist.sessionsPerDay;

          // Count completed sessions
          const completedSessions = await Session.countDocuments({
            therapistId: therapist._id,
            sessionDate: { $gte: start, $lte: end },
            completedAt: { $exists: true, $ne: null }
          });

          // Count confirmed bookings (not yet completed)
          const confirmedBookings = await Booking.countDocuments({
            therapistId: therapist._id,
            date: { $gte: start, $lte: end },
            status: 'confirmed'
          });

          const totalBooked = completedSessions + confirmedBookings;
          const utilizationPercentage = totalAvailableSlots > 0 
            ? Math.round((totalBooked / totalAvailableSlots) * 100) 
            : 0;

          return {
            therapistId: therapist.therapistId,
            name: therapist.staffId.name,
            specialization: therapist.specialization,
            totalAvailableSlots,
            completedSessions,
            confirmedBookings,
            totalBooked,
            utilizationPercentage,
            warning: utilizationPercentage >= 90
          };
        })
      );

      // Sort by utilization percentage (highest first)
      utilizationData.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);

      res.status(200).json({
        success: true,
        data: {
          period: {
            start,
            end
          },
          utilization: utilizationData,
          averageUtilization: Math.round(
            utilizationData.reduce((sum, t) => sum + t.utilizationPercentage, 0) / utilizationData.length
          )
        }
      });
    } catch (error) {
      console.error('Get therapist utilization error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_UTILIZATION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Helper function to count working days
  countWorkingDays(startDate, endDate, workingDays) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayName = dayNames[current.getDay()];
      if (workingDays.includes(dayName)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  // Get booking trends
  async getBookingTrends(req, res) {
    try {
      const { months = 6 } = req.query;

      const trends = [];
      const now = new Date();

      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const totalBookings = await Booking.countDocuments({
          bookedAt: { $gte: monthStart, $lte: monthEnd }
        });

        const completedBookings = await Booking.countDocuments({
          bookedAt: { $gte: monthStart, $lte: monthEnd },
          status: 'completed'
        });

        const cancelledBookings = await Booking.countDocuments({
          bookedAt: { $gte: monthStart, $lte: monthEnd },
          status: 'cancelled'
        });

        trends.push({
          month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
          totalBookings,
          completedBookings,
          cancelledBookings,
          completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
        });
      }

      res.status(200).json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Get booking trends error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_TRENDS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get therapy type distribution
  async getTherapyTypeDistribution(req, res) {
    try {
      const therapyTypes = ['Psychology', 'OT', 'PT', 'Speech', 'EI'];
      
      const distribution = await Promise.all(
        therapyTypes.map(async (type) => {
          const count = await Booking.countDocuments({
            therapyType: type,
            status: { $in: ['confirmed', 'completed'] }
          });

          return {
            therapyType: type,
            count
          };
        })
      );

      const total = distribution.reduce((sum, item) => sum + item.count, 0);

      const distributionWithPercentage = distribution.map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
      }));

      res.status(200).json({
        success: true,
        data: {
          distribution: distributionWithPercentage,
          total
        }
      });
    } catch (error) {
      console.error('Get therapy type distribution error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_DISTRIBUTION_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get recent activities
  async getRecentActivities(req, res) {
    try {
      const { limit = 10 } = req.query;

      // Get recent bookings
      const recentBookings = await Booking.find()
        .sort({ bookedAt: -1 })
        .limit(parseInt(limit) / 2)
        .populate('specialId');

      // Get recent sessions
      const recentSessions = await Session.find({ completedAt: { $exists: true } })
        .sort({ completedAt: -1 })
        .limit(parseInt(limit) / 2);

      // Combine and format activities
      const activities = [];

      for (const booking of recentBookings) {
        const patient = await Patient.findOne({ specialId: booking.specialId });
        activities.push({
          type: 'booking',
          action: booking.status === 'cancelled' ? 'cancelled' : 'created',
          description: `Booking ${booking.status} for ${patient?.childName}`,
          therapyType: booking.therapyType,
          date: booking.bookedAt,
          status: booking.status
        });
      }

      for (const session of recentSessions) {
        const patient = await Patient.findOne({ specialId: session.specialId });
        activities.push({
          type: 'session',
          action: 'completed',
          description: `Session completed for ${patient?.childName}`,
          date: session.completedAt,
          progressLevel: session.progressLevel
        });
      }

      // Sort by date
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      res.status(200).json({
        success: true,
        data: activities.slice(0, parseInt(limit))
      });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ACTIVITIES_FAILED',
          message: error.message
        }
      });
    }
  }
}

module.exports = new AdminController();
