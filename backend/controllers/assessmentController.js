const { Assessment, Patient, Therapist, Staff } = require('../models');
const pdfService = require('../services/pdfService');
const { validationResult } = require('express-validator');

class AssessmentController {
  // Create new assessment
  async createAssessment(req, res) {
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

      const { specialId, assessmentDate } = req.body;

      // Verify patient exists
      const patient = await Patient.findOne({ specialId, isActive: true });
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Patient not found'
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

      // Generate assessment ID based on highest existing ID
      const currentYear = new Date().getFullYear();
      const lastAssessment = await Assessment.findOne({})
        .sort({ assessmentId: -1 })
        .select('assessmentId');
      let nextAssessmentNum = 1;
      if (lastAssessment && lastAssessment.assessmentId) {
        // Extract the 6-digit number from the end (after ASM + year)
        const lastNum = parseInt(lastAssessment.assessmentId.slice(-6), 10);
        if (!isNaN(lastNum)) {
          nextAssessmentNum = lastNum + 1;
        }
      }
      const assessmentId = `ASM${currentYear}${String(nextAssessmentNum).padStart(6, '0')}`;

      // Create assessment
      const assessment = await Assessment.create({
        assessmentId,
        specialId,
        therapistId: therapist._id,
        assessmentDate: new Date(assessmentDate),
        assessmentData: {},
        status: 'draft'
      });

      res.status(201).json({
        success: true,
        message: 'Assessment created successfully',
        data: {
          assessmentId: assessment.assessmentId,
          specialId: assessment.specialId,
          status: assessment.status
        }
      });
    } catch (error) {
      console.error('Create assessment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ASSESSMENT_FAILED',
          message: error.message
        }
      });
    }
  }

  // Update assessment (save draft or update data)
  async updateAssessment(req, res) {
    try {
      const { assessmentId } = req.params;
      const { assessmentData, status } = req.body;

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

      // Find assessment
      const assessment = await Assessment.findOne({ assessmentId, therapistId: therapist._id });
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ASSESSMENT_NOT_FOUND',
            message: 'Assessment not found or you do not have permission to access it'
          }
        });
      }

      // Cannot update completed assessment
      if (assessment.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ASSESSMENT_COMPLETED',
            message: 'Cannot update a completed assessment'
          }
        });
      }

      // Update assessment data
      if (assessmentData) {
        assessment.assessmentData = {
          ...assessment.assessmentData,
          ...assessmentData
        };
      }

      if (status) {
        assessment.status = status;
      }

      await assessment.save();

      res.status(200).json({
        success: true,
        message: 'Assessment updated successfully',
        data: assessment
      });
    } catch (error) {
      console.error('Update assessment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ASSESSMENT_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get assessment by ID
  async getAssessment(req, res) {
    try {
      const { assessmentId } = req.params;

      const assessment = await Assessment.findOne({ assessmentId })
        .populate('therapistId', 'specialization qualification')
        .populate('specialId');

      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ASSESSMENT_NOT_FOUND',
            message: 'Assessment not found'
          }
        });
      }

      // Get patient details
      const patient = await Patient.findOne({ specialId: assessment.specialId });

      res.status(200).json({
        success: true,
        data: {
          assessment,
          patient: {
            specialId: patient?.specialId,
            childName: patient?.childName,
            dateOfBirth: patient?.dateOfBirth,
            diagnosis: patient?.diagnosis
          }
        }
      });
    } catch (error) {
      console.error('Get assessment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ASSESSMENT_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get patient assessments
  async getPatientAssessments(req, res) {
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

      // Get all assessments for this patient
      const assessments = await Assessment.find({ specialId })
        .populate('therapistId', 'specialization')
        .sort({ assessmentDate: -1 });

      res.status(200).json({
        success: true,
        data: {
          patient: {
            specialId: patient.specialId,
            childName: patient.childName
          },
          assessments,
          totalAssessments: assessments.length
        }
      });
    } catch (error) {
      console.error('Get patient assessments error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ASSESSMENTS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Complete assessment
  async completeAssessment(req, res) {
    try {
      const { assessmentId } = req.params;
      const { assessmentData } = req.body;

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

      // Find assessment
      const assessment = await Assessment.findOne({ assessmentId, therapistId: therapist._id });
      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ASSESSMENT_NOT_FOUND',
            message: 'Assessment not found or you do not have permission to access it'
          }
        });
      }

      if (assessment.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ASSESSMENT_ALREADY_COMPLETED',
            message: 'Assessment has already been completed'
          }
        });
      }

      // Update assessment with final data
      assessment.assessmentData = assessmentData;
      assessment.status = 'completed';
      assessment.completedAt = new Date();

      // Get patient and therapist details for PDF
      const patient = await Patient.findOne({ specialId: assessment.specialId });
      const staff = await Staff.findById(therapist.staffId);

      // Generate PDF report
      try {
        const pdfResult = await pdfService.generateAssessmentReport(
          assessment,
          patient,
          { name: staff.name, specialization: therapist.specialization }
        );

        assessment.pdfUrl = pdfResult.url;
        await assessment.save();

        // TODO: Upload PDF to Cloudinary
        // TODO: Send email with PDF to parent

        res.status(200).json({
          success: true,
          message: 'Assessment completed successfully',
          data: {
            assessmentId: assessment.assessmentId,
            completedAt: assessment.completedAt,
            pdfUrl: assessment.pdfUrl
          }
        });
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);

        // Save assessment even if PDF generation fails
        await assessment.save();

        res.status(200).json({
          success: true,
          message: 'Assessment completed successfully, but PDF generation failed',
          data: {
            assessmentId: assessment.assessmentId,
            completedAt: assessment.completedAt
          },
          warning: 'PDF report could not be generated'
        });
      }
    } catch (error) {
      console.error('Complete assessment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'COMPLETE_ASSESSMENT_FAILED',
          message: error.message
        }
      });
    }
  }

  // Get all assessments (admin/receptionist/therapist)
  async getAllAssessments(req, res) {
    try {
      const { page = 1, limit = 20, status, specialId, query } = req.query;

      const filter = {};

      if (status) {
        filter.status = status;
      }

      if (specialId) {
        filter.specialId = specialId;
      }

      // If therapist, only show their assessments
      if (req.user.role === 'therapist') {
        const therapist = await Therapist.findOne({ staffId: req.user.userId });
        if (therapist) {
          filter.therapistId = therapist._id;
        }
      }

      // aggregation pipeline for joining patient data and filtering
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'patients',
            localField: 'specialId',
            foreignField: 'specialId',
            as: 'patient'
          }
        },
        { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            assessmentId: 1,
            specialId: 1,
            therapistId: 1,
            assessmentDate: 1,
            status: 1,
            parentAccepted: 1,
            childName: '$patient.childName',
            createdAt: 1
          }
        }
      ];

      // If query is provided, filter by patientId or childName
      if (query && query.trim()) {
        const searchRegex = new RegExp(query.trim(), 'i');
        pipeline.push({
          $match: {
            $or: [
              { specialId: { $regex: searchRegex } },
              { childName: { $regex: searchRegex } },
              { assessmentId: { $regex: searchRegex } }
            ]
          }
        });
      }

      // Sort, skip, and limit
      pipeline.push({ $sort: { assessmentDate: -1 } });

      // Get total count for pagination (before skip/limit)
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: 'total' });
      const countResult = await Assessment.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(limit) });
      pipeline.push({ $limit: parseInt(limit) });

      const assessments = await Assessment.aggregate(pipeline);

      res.status(200).json({
        success: true,
        data: assessments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all assessments error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ASSESSMENTS_FAILED',
          message: error.message
        }
      });
    }
  }

  // Parent accept assessment
  async acceptAssessment(req, res) {
    try {
      const { assessmentId } = req.params;

      // Verify parent is accessing their own child's assessment
      const patient = await Patient.findOne({ specialId: req.user.specialId });
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: 'Patient profile not found'
          }
        });
      }

      const assessment = await Assessment.findOne({
        assessmentId,
        specialId: patient.specialId,
        status: 'completed'
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ASSESSMENT_NOT_FOUND',
            message: 'Assessment not found or not yet completed'
          }
        });
      }

      if (assessment.parentAccepted) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_ACCEPTED',
            message: 'Assessment has already been accepted'
          }
        });
      }

      assessment.parentAccepted = true;
      assessment.parentAcceptedAt = new Date();
      await assessment.save();

      res.status(200).json({
        success: true,
        message: 'Assessment acknowledged successfully',
        data: {
          assessmentId: assessment.assessmentId,
          parentAccepted: assessment.parentAccepted,
          parentAcceptedAt: assessment.parentAcceptedAt
        }
      });
    } catch (error) {
      console.error('Accept assessment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ACCEPT_ASSESSMENT_FAILED',
          message: error.message
        }
      });
    }
  }
}

module.exports = new AssessmentController();
