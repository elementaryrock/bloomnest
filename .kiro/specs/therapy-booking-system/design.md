# Design Document

## Overview

The Therapy Unit Booking System is a full-stack web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with a focus on accessibility, security, and user experience. The system follows a three-tier architecture with clear separation between presentation, business logic, and data layers. All components utilize free-tier services to ensure zero-cost deployment while maintaining professional quality and scalability.

### Technology Stack

**Frontend:**
- React.js 18+ (UI framework)
- Tailwind CSS (styling with custom healthcare theme)
- React Router v6 (client-side routing)
- React Context API (state management)
- Axios (HTTP client)
- react-datepicker (date selection)
- React Hook Form (form validation)
- react-toastify (notifications)
- React Icons (iconography)

**Backend:**
- Node.js v18+ (runtime)
- Express.js 4.x (web framework)
- jsonwebtoken (JWT authentication)
- bcrypt (password hashing)
- express-validator (input validation)
- nodemailer (email service)
- Twilio SDK or Firebase Admin SDK (OTP service)
- pdfkit or puppeteer (PDF generation)

**Database:**
- MongoDB Atlas (free tier: 512MB)
- Mongoose ODM (schema modeling)

**File Storage:**
- Cloudinary (free tier: 25GB)

**Deployment:**
- Frontend: Vercel (free unlimited)
- Backend: Render (free 750 hrs/month)
- SSL: Included with hosting platforms


## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Parent Web App]
        B[Staff Web App]
        C[Mobile Browser]
    end
    
    subgraph "API Gateway"
        D[Express.js Server]
        E[Authentication Middleware]
        F[Rate Limiter]
    end
    
    subgraph "Business Logic Layer"
        G[Auth Service]
        H[Booking Service]
        I[Session Service]
        J[Assessment Service]
        K[Notification Service]
    end
    
    subgraph "Data Layer"
        L[(MongoDB Atlas)]
        M[Cloudinary Storage]
    end
    
    subgraph "External Services"
        N[Twilio/Firebase OTP]
        O[Gmail SMTP]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    G --> L
    H --> L
    I --> L
    J --> L
    K --> N
    K --> O
    J --> M
    G --> N
```

### Architecture Pattern

The system follows a **three-tier architecture**:

1. **Presentation Layer**: React.js SPA with responsive UI components
2. **Business Logic Layer**: Express.js REST API with service-oriented design
3. **Data Layer**: MongoDB with Mongoose ODM for data persistence

### Key Architectural Decisions

1. **RESTful API Design**: Stateless API with JWT-based authentication for scalability
2. **Role-Based Access Control (RBAC)**: Middleware-based authorization for different user roles
3. **Service-Oriented Architecture**: Separate services for auth, booking, sessions, assessments, and notifications
4. **Optimistic Locking**: Prevent double-booking through database transactions
5. **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints


## Components and Interfaces

### Frontend Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── PublicRoutes
│   │   ├── ParentLogin
│   │   │   ├── SpecialIDInput
│   │   │   ├── PhoneInput
│   │   │   └── OTPVerification
│   │   └── StaffLogin
│   │       ├── EmailInput
│   │       └── PasswordInput
│   │
│   ├── ParentRoutes (Protected)
│   │   ├── ParentDashboard
│   │   │   ├── ChildInfoCard
│   │   │   ├── UpcomingAppointments
│   │   │   ├── StatisticsCards
│   │   │   └── QuickActions
│   │   ├── BookingPage
│   │   │   ├── LeftPanel
│   │   │   │   ├── PatientCard
│   │   │   │   └── ConfirmButton
│   │   │   └── RightPanel
│   │   │       ├── DateSelector (WeekView)
│   │   │       ├── TherapyTypeDropdown
│   │   │       ├── TimeSchedule
│   │   │       └── BookedTherapiesList
│   │   ├── SessionHistory
│   │   └── AssessmentViewer
│   │
│   ├── ReceptionistRoutes (Protected)
│   │   ├── ReceptionistDashboard
│   │   ├── PatientRegistration
│   │   │   ├── ChildInfoForm
│   │   │   ├── ParentInfoForm
│   │   │   └── MedicalInfoForm
│   │   └── PatientSearch
│   │
│   ├── TherapistRoutes (Protected)
│   │   ├── TherapistDashboard
│   │   │   ├── DailySchedule
│   │   │   ├── SessionCard
│   │   │   └── StatisticsPanel
│   │   ├── SessionNotes
│   │   │   └── NotesForm
│   │   └── AssessmentForm
│   │       ├── MultiStepForm
│   │       ├── ProgressIndicator
│   │       └── DraftSaver
│   │
│   └── AdminRoutes (Protected)
│       ├── AdminDashboard
│       │   ├── SystemStats
│       │   ├── UtilizationChart
│       │   └── ManagementActions
│       ├── TherapistManagement
│       └── ReportGeneration
```

### Backend API Structure

```
server.js
├── config/
│   ├── database.js (MongoDB connection)
│   ├── cloudinary.js (File storage config)
│   └── jwt.js (JWT configuration)
│
├── middleware/
│   ├── auth.js (JWT verification)
│   ├── roleCheck.js (RBAC middleware)
│   ├── rateLimiter.js (Rate limiting)
│   ├── validator.js (Input validation)
│   └── errorHandler.js (Global error handler)
│
├── models/
│   ├── Patient.js
│   ├── Staff.js
│   ├── Therapist.js
│   ├── Booking.js
│   ├── Session.js
│   ├── Assessment.js
│   ├── OTP.js
│   ├── Notification.js
│   ├── Report.js
│   └── SystemSettings.js
│
├── services/
│   ├── authService.js (OTP generation, JWT)
│   ├── bookingService.js (Booking logic)
│   ├── sessionService.js (Session management)
│   ├── assessmentService.js (Assessment logic)
│   ├── notificationService.js (Email/SMS)
│   ├── pdfService.js (PDF generation)
│   └── specialIdService.js (ID generation)
│
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   ├── bookingController.js
│   ├── sessionController.js
│   ├── assessmentController.js
│   ├── therapistController.js
│   └── adminController.js
│
└── routes/
    ├── auth.routes.js
    ├── patient.routes.js
    ├── booking.routes.js
    ├── session.routes.js
    ├── assessment.routes.js
    ├── therapist.routes.js
    └── admin.routes.js
```

### Key Interface Definitions

**Authentication Service Interface:**
```typescript
interface AuthService {
  sendOTP(specialId: string, phoneNumber: string): Promise<{ success: boolean, expiresAt: Date }>
  verifyOTP(specialId: string, otp: string): Promise<{ success: boolean, token: string }>
  staffLogin(email: string, password: string): Promise<{ success: boolean, token: string, role: string }>
  validateToken(token: string): Promise<{ valid: boolean, userId: string, role: string }>
}
```

**Booking Service Interface:**
```typescript
interface BookingService {
  getAvailableSlots(date: Date, therapyType: string): Promise<TimeSlot[]>
  validateBooking(bookingData: BookingRequest): Promise<ValidationResult>
  createBooking(bookingData: BookingRequest): Promise<Booking>
  cancelBooking(bookingId: string, userId: string): Promise<{ success: boolean }>
  getPatientBookings(specialId: string): Promise<Booking[]>
}
```

**Session Service Interface:**
```typescript
interface SessionService {
  getTherapistSchedule(therapistId: string, date: Date): Promise<Session[]>
  startSession(sessionId: string): Promise<{ success: boolean, startTime: Date }>
  completeSession(sessionId: string, notes: SessionNotes): Promise<Session>
  getSessionHistory(specialId: string): Promise<Session[]>
}
```


## Data Models

### MongoDB Schema Definitions

**1. Patient Schema**
```javascript
{
  specialId: { type: String, required: true, unique: true, index: true },
  childName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  photoUrl: { type: String },
  
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true, index: true },
  parentEmail: { type: String, required: true },
  alternatePhone: { type: String },
  relationship: { type: String, enum: ['Mother', 'Father', 'Guardian'] },
  address: { type: String },
  
  diagnosis: [{ type: String, enum: ['ASD', 'SLD', 'ID', 'CP'] }],
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
  presentingProblems: { type: String },
  referredBy: { type: String },
  medicalHistory: { type: String },
  
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  registrationDate: { type: Date, default: Date.now },
  appRegistered: { type: Boolean, default: true },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**2. Staff Schema**
```javascript
{
  staffId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['receptionist', 'therapist', 'admin'], required: true },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**3. Therapist Schema**
```javascript
{
  therapistId: { type: String, required: true, unique: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  specialization: { 
    type: String, 
    enum: ['Psychology', 'OT', 'PT', 'Speech', 'EI'], 
    required: true 
  },
  qualification: { type: String, required: true },
  workingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
  sessionsPerDay: { type: Number, default: 6 },
  isAvailable: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**4. Booking Schema**
```javascript
{
  bookingId: { type: String, required: true, unique: true },
  specialId: { type: String, required: true, index: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  therapyType: { 
    type: String, 
    enum: ['Psychology', 'OT', 'PT', 'Speech', 'EI'], 
    required: true 
  },
  date: { type: Date, required: true, index: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'completed', 'cancelled', 'no-show'], 
    default: 'confirmed' 
  },
  bookedAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Compound index for preventing double booking
bookingSchema.index({ therapistId: 1, date: 1, timeSlot: 1 }, { unique: true });
bookingSchema.index({ specialId: 1, date: 1, timeSlot: 1 }, { unique: true });
```

**5. Session Schema**
```javascript
{
  sessionId: { type: String, required: true, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  specialId: { type: String, required: true, index: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  
  sessionDate: { type: Date, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  
  activitiesConducted: { type: String },
  goalsAddressed: { type: String },
  progressLevel: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'] 
  },
  behavioralObservations: { type: String },
  recommendationsForParents: { type: String },
  nextSessionFocus: { type: String },
  
  completedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**6. Assessment Schema**
```javascript
{
  assessmentId: { type: String, required: true, unique: true },
  specialId: { type: String, required: true, index: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  assessmentDate: { type: Date, required: true },
  
  assessmentData: {
    presentingProblems: { type: String },
    developmentalHistory: {
      prenatal: { type: String },
      perinatal: { type: String },
      postnatal: { type: String }
    },
    motorSkills: {
      grossMotor: { type: String },
      fineMotor: { type: String }
    },
    languageSkills: {
      receptive: { type: String },
      expressive: { type: String }
    },
    socialAdaptiveSkills: { type: String },
    behavioralObservations: { type: String },
    testAdministration: { type: String },
    diagnosisImpression: { type: String },
    recommendations: { type: String },
    followUpDate: { type: Date }
  },
  
  status: { type: String, enum: ['draft', 'completed'], default: 'draft' },
  pdfUrl: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}
```

**7. OTP Schema**
```javascript
{
  specialId: { type: String, required: true, index: true },
  phoneNumber: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}

// TTL index to auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

**8. Notification Schema**
```javascript
{
  recipientId: { type: String, required: true, index: true },
  recipientType: { type: String, enum: ['parent', 'therapist', 'admin'], required: true },
  type: { 
    type: String, 
    enum: ['booking_confirmed', 'session_reminder', 'session_completed', 'assessment_completed', 'booking_cancelled'],
    required: true 
  },
  message: { type: String, required: true },
  channel: { type: String, enum: ['email', 'sms', 'in-app'], required: true },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
}
```

**9. Report Schema**
```javascript
{
  reportId: { type: String, required: true, unique: true },
  reportType: { 
    type: String, 
    enum: ['patient_list', 'session_summary', 'therapist_utilization', 'monthly_statistics'],
    required: true 
  },
  reportData: { type: mongoose.Schema.Types.Mixed },
  fileUrl: { type: String },
  format: { type: String, enum: ['pdf', 'excel'], required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  generatedAt: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now }
}
```

**10. SystemSettings Schema**
```javascript
{
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
  
  updatedAt: { type: Date, default: Date.now }
}
```

### Data Relationships

```mermaid
erDiagram
    PATIENT ||--o{ BOOKING : makes
    PATIENT ||--o{ SESSION : attends
    PATIENT ||--o{ ASSESSMENT : receives
    THERAPIST ||--o{ BOOKING : handles
    THERAPIST ||--o{ SESSION : conducts
    THERAPIST ||--o{ ASSESSMENT : performs
    STAFF ||--|| THERAPIST : is
    BOOKING ||--|| SESSION : generates
    PATIENT ||--o{ OTP : requests
    PATIENT ||--o{ NOTIFICATION : receives
    THERAPIST ||--o{ NOTIFICATION : receives
```


## Core Business Logic

### 1. Special ID Generation Algorithm

```javascript
async function generateSpecialId() {
  const currentYear = new Date().getFullYear();
  const prefix = `JYCS${currentYear}`;
  
  // Find the last registered patient for this year
  const lastPatient = await Patient.findOne({
    specialId: new RegExp(`^${prefix}`)
  }).sort({ specialId: -1 });
  
  let sequenceNumber = 1;
  if (lastPatient) {
    const lastSequence = parseInt(lastPatient.specialId.slice(-6));
    sequenceNumber = lastSequence + 1;
  }
  
  // Pad with zeros to 6 digits
  const paddedNumber = sequenceNumber.toString().padStart(6, '0');
  
  return `${prefix}${paddedNumber}`;
}
```

### 2. OTP Generation and Verification Flow

```javascript
// OTP Generation
async function sendOTP(specialId, phoneNumber) {
  // Validate patient exists
  const patient = await Patient.findOne({ specialId, parentPhone: phoneNumber });
  if (!patient) throw new Error('Invalid credentials');
  
  // Check rate limiting (max 5 OTPs per hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentOTPs = await OTP.countDocuments({
    specialId,
    createdAt: { $gte: oneHourAgo }
  });
  if (recentOTPs >= 5) throw new Error('Rate limit exceeded');
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5-minute expiry
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OTP.create({ specialId, phoneNumber, otp, expiresAt, attempts: 0 });
  
  // Send OTP via Twilio/Firebase
  await sendSMS(phoneNumber, `Your OTP for Jyothi Central School therapy booking: ${otp}. Valid for 5 minutes.`);
  
  return { success: true, expiresAt };
}

// OTP Verification
async function verifyOTP(specialId, otpInput) {
  const otpRecord = await OTP.findOne({
    specialId,
    otp: otpInput,
    verified: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpRecord) {
    // Increment attempts
    await OTP.updateOne(
      { specialId, verified: false },
      { $inc: { attempts: 1 } }
    );
    
    const attempts = await OTP.findOne({ specialId, verified: false });
    if (attempts && attempts.attempts >= 3) {
      throw new Error('Maximum attempts exceeded');
    }
    
    throw new Error('Invalid or expired OTP');
  }
  
  // Mark OTP as verified
  otpRecord.verified = true;
  await otpRecord.save();
  
  // Generate JWT token
  const patient = await Patient.findOne({ specialId });
  const token = jwt.sign(
    { userId: patient._id, specialId, role: 'parent' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Update last login
  patient.lastLogin = new Date();
  await patient.save();
  
  return { success: true, token };
}
```

### 3. Booking Validation Logic

```javascript
async function validateBooking(bookingData) {
  const { specialId, therapyType, date, timeSlot } = bookingData;
  
  // 1. Check monthly limit (2 per therapy type)
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  const monthlyBookings = await Booking.countDocuments({
    specialId,
    therapyType,
    date: { $gte: startOfMonth, $lte: endOfMonth },
    status: { $in: ['confirmed', 'completed'] }
  });
  
  if (monthlyBookings >= 2) {
    return { valid: false, error: 'Monthly limit reached for this therapy type' };
  }
  
  // 2. Check if date is within 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  
  if (date < today || date > maxDate) {
    return { valid: false, error: 'Booking must be within 30 days' };
  }
  
  // 3. Find available therapist
  const therapist = await Therapist.findOne({
    specialization: therapyType,
    isAvailable: true,
    workingDays: { $in: [getDayName(date)] }
  });
  
  if (!therapist) {
    return { valid: false, error: 'No therapist available for this therapy type on this day' };
  }
  
  // 4. Check for slot conflicts
  const existingBooking = await Booking.findOne({
    therapistId: therapist._id,
    date,
    timeSlot,
    status: { $in: ['confirmed', 'completed'] }
  });
  
  if (existingBooking) {
    return { valid: false, error: 'This time slot is already booked' };
  }
  
  // 5. Check patient doesn't have another booking at same time
  const patientConflict = await Booking.findOne({
    specialId,
    date,
    timeSlot,
    status: { $in: ['confirmed', 'completed'] }
  });
  
  if (patientConflict) {
    return { valid: false, error: 'You already have a booking at this time' };
  }
  
  return { valid: true, therapistId: therapist._id };
}
```

### 4. Available Slots Algorithm

```javascript
async function getAvailableSlots(date, therapyType) {
  // Find therapists for this therapy type
  const dayName = getDayName(date);
  const therapists = await Therapist.find({
    specialization: therapyType,
    isAvailable: true,
    workingDays: { $in: [dayName] }
  });
  
  if (therapists.length === 0) {
    return [];
  }
  
  // Generate time slots (assuming 9 AM to 5 PM, 1-hour sessions)
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
  const therapistIds = therapists.map(t => t._id);
  const bookings = await Booking.find({
    therapistId: { $in: therapistIds },
    date,
    status: { $in: ['confirmed', 'completed'] }
  });
  
  // Calculate available slots
  const availableSlots = [];
  
  for (const slot of timeSlots) {
    const bookedCount = bookings.filter(b => b.timeSlot === slot).length;
    const availableTherapists = therapists.length - bookedCount;
    
    if (availableTherapists > 0) {
      availableSlots.push({
        timeSlot: slot,
        availableCount: availableTherapists,
        isAvailable: true
      });
    }
  }
  
  return availableSlots;
}
```

### 5. Session Completion Flow

```javascript
async function completeSession(sessionId, sessionNotes, therapistId) {
  // Validate therapist owns this session
  const session = await Session.findOne({ sessionId, therapistId });
  if (!session) throw new Error('Session not found');
  
  // Update session with notes
  session.activitiesConducted = sessionNotes.activitiesConducted;
  session.goalsAddressed = sessionNotes.goalsAddressed;
  session.progressLevel = sessionNotes.progressLevel;
  session.behavioralObservations = sessionNotes.behavioralObservations;
  session.recommendationsForParents = sessionNotes.recommendationsForParents;
  session.nextSessionFocus = sessionNotes.nextSessionFocus;
  session.endTime = new Date();
  session.completedAt = new Date();
  
  await session.save();
  
  // Update booking status
  await Booking.updateOne(
    { _id: session.bookingId },
    { status: 'completed' }
  );
  
  // Send notification to parent
  const patient = await Patient.findOne({ specialId: session.specialId });
  await createNotification({
    recipientId: session.specialId,
    recipientType: 'parent',
    type: 'session_completed',
    message: `Session completed for ${patient.childName}. Notes are now available.`,
    channel: 'email'
  });
  
  return session;
}
```

### 6. Monthly Booking Count Check

```javascript
async function getMonthlyBookingCount(specialId, therapyType, date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
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
```


## Error Handling

### Error Handling Strategy

**Backend Error Handling:**

1. **Global Error Handler Middleware**
```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: Object.values(err.errors).map(e => e.message)
      }
    });
  }
  
  // Mongoose duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: 'Resource already exists',
        field: Object.keys(err.keyPattern)[0]
      }
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }
  
  // Custom application errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Unknown errors
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
}
```

2. **Custom Error Classes**
```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}
```

**Frontend Error Handling:**

1. **Error Boundary Component**
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>Please refresh the page or contact support</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

2. **API Error Handler**
```javascript
// utils/apiErrorHandler.js
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    const { code, message } = error.response.data.error;
    
    switch (code) {
      case 'VALIDATION_ERROR':
        toast.error(message);
        break;
      case 'AUTHENTICATION_ERROR':
        toast.error('Please login again');
        // Redirect to login
        window.location.href = '/login';
        break;
      case 'AUTHORIZATION_ERROR':
        toast.error('You do not have permission to perform this action');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        toast.error('Too many requests. Please try again later.');
        break;
      default:
        toast.error(message || 'An error occurred');
    }
  } else if (error.request) {
    // Request made but no response
    toast.error('Network error. Please check your connection.');
  } else {
    // Something else happened
    toast.error('An unexpected error occurred');
  }
}
```

### Error Response Format

All API errors follow a consistent format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] // Optional array of detailed errors
  }
}
```

### Common Error Scenarios

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Invalid OTP | 401 | INVALID_OTP | Invalid or expired OTP |
| OTP rate limit | 429 | RATE_LIMIT_EXCEEDED | Too many OTP requests |
| Booking limit reached | 400 | BOOKING_LIMIT_EXCEEDED | Monthly limit reached for this therapy type |
| Slot already booked | 409 | SLOT_UNAVAILABLE | This time slot is already booked |
| Invalid token | 401 | INVALID_TOKEN | Invalid authentication token |
| Unauthorized access | 403 | AUTHORIZATION_ERROR | You do not have permission |
| Patient not found | 404 | NOT_FOUND | Patient not found |
| Duplicate phone | 409 | DUPLICATE_ERROR | Phone number already registered |


## Testing Strategy

### Testing Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /______\
                /        \
               /Integration\
              /____________\
             /              \
            /  Unit Tests    \
           /________________\
```

### 1. Unit Testing

**Backend Unit Tests (Jest + Supertest)**

Test individual functions and services:

```javascript
// tests/services/specialIdService.test.js
describe('Special ID Service', () => {
  test('should generate correct format', async () => {
    const id = await generateSpecialId();
    expect(id).toMatch(/^JYCS\d{4}\d{6}$/);
  });
  
  test('should increment sequence number', async () => {
    const id1 = await generateSpecialId();
    const id2 = await generateSpecialId();
    const seq1 = parseInt(id1.slice(-6));
    const seq2 = parseInt(id2.slice(-6));
    expect(seq2).toBe(seq1 + 1);
  });
});

// tests/services/bookingService.test.js
describe('Booking Validation', () => {
  test('should reject booking beyond monthly limit', async () => {
    const result = await validateBooking({
      specialId: 'JYCS2025000001',
      therapyType: 'Psychology',
      date: new Date('2025-01-15'),
      timeSlot: '10:00 AM - 11:00 AM'
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Monthly limit');
  });
  
  test('should accept valid booking', async () => {
    const result = await validateBooking({
      specialId: 'JYCS2025000002',
      therapyType: 'OT',
      date: new Date('2025-01-20'),
      timeSlot: '2:00 PM - 3:00 PM'
    });
    expect(result.valid).toBe(true);
    expect(result.therapistId).toBeDefined();
  });
});
```

**Frontend Unit Tests (Jest + React Testing Library)**

Test individual components:

```javascript
// tests/components/DateSelector.test.js
describe('DateSelector Component', () => {
  test('renders week view correctly', () => {
    render(<DateSelector onDateSelect={jest.fn()} />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });
  
  test('calls onDateSelect when date is clicked', () => {
    const mockSelect = jest.fn();
    render(<DateSelector onDateSelect={mockSelect} />);
    fireEvent.click(screen.getByText('15'));
    expect(mockSelect).toHaveBeenCalled();
  });
});
```

### 2. Integration Testing

**API Integration Tests**

Test API endpoints with database:

```javascript
// tests/integration/auth.test.js
describe('Authentication API', () => {
  test('POST /api/auth/send-otp - should send OTP', async () => {
    const response = await request(app)
      .post('/api/auth/send-otp')
      .send({
        specialId: 'JYCS2025000001',
        phoneNumber: '+919876543210'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.expiresAt).toBeDefined();
  });
  
  test('POST /api/auth/verify-otp - should verify valid OTP', async () => {
    // First send OTP
    await request(app)
      .post('/api/auth/send-otp')
      .send({
        specialId: 'JYCS2025000001',
        phoneNumber: '+919876543210'
      });
    
    // Get OTP from database (for testing)
    const otpRecord = await OTP.findOne({ specialId: 'JYCS2025000001' });
    
    // Verify OTP
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        specialId: 'JYCS2025000001',
        otp: otpRecord.otp
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});

// tests/integration/booking.test.js
describe('Booking API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Login and get token
    const loginResponse = await request(app)
      .post('/api/auth/verify-otp')
      .send({ specialId: 'JYCS2025000001', otp: '123456' });
    authToken = loginResponse.body.token;
  });
  
  test('GET /api/bookings/available-slots - should return available slots', async () => {
    const response = await request(app)
      .get('/api/bookings/available-slots')
      .query({ date: '2025-01-15', therapyType: 'Psychology' })
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.slots)).toBe(true);
  });
  
  test('POST /api/bookings - should create booking', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        therapyType: 'Psychology',
        date: '2025-01-20',
        timeSlot: '10:00 AM - 11:00 AM'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.booking).toBeDefined();
  });
});
```

### 3. End-to-End Testing

**E2E Tests (Playwright or Cypress)**

Test complete user flows:

```javascript
// tests/e2e/parentBooking.spec.js
describe('Parent Booking Flow', () => {
  test('should complete full booking process', async () => {
    // Login
    await page.goto('/login');
    await page.fill('[name="specialId"]', 'JYCS2025000001');
    await page.fill('[name="phoneNumber"]', '+919876543210');
    await page.click('button:has-text("Send OTP")');
    
    // Enter OTP (mock in test environment)
    await page.fill('[name="otp"]', '123456');
    await page.click('button:has-text("Verify")');
    
    // Navigate to booking
    await page.click('text=Book New Session');
    
    // Select date
    await page.click('[data-date="2025-01-20"]');
    
    // Select therapy type
    await page.selectOption('[name="therapyType"]', 'Psychology');
    
    // Select time slot
    await page.click('text=10:00 AM - 11:00 AM');
    
    // Confirm booking
    await page.click('button:has-text("CONFIRM BOOKING")');
    
    // Verify success message
    await expect(page.locator('text=Booking confirmed')).toBeVisible();
  });
});
```

### 4. Manual Testing Checklist

**Authentication:**
- [ ] Parent can login with valid Special ID and OTP
- [ ] Invalid OTP shows error message
- [ ] OTP expires after 5 minutes
- [ ] Rate limiting works (max 5 OTPs per hour)
- [ ] Staff can login with email and password

**Booking:**
- [ ] Available slots display correctly
- [ ] Booked slots are disabled
- [ ] Monthly limit validation works
- [ ] Double booking prevention works
- [ ] Booking confirmation shows success message
- [ ] Booking appears in "Your Booked Therapies"

**Therapist Dashboard:**
- [ ] Daily schedule displays correctly
- [ ] Session notes form works
- [ ] Session completion updates booking status

**Admin Dashboard:**
- [ ] Statistics display correctly
- [ ] Therapist utilization chart shows accurate data
- [ ] Add/edit therapist works

**Responsive Design:**
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)

### 5. Performance Testing

**Load Testing (Artillery or k6)**

```yaml
# load-test.yml
config:
  target: 'https://api.yourapp.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Booking Flow'
    flow:
      - post:
          url: '/api/auth/send-otp'
          json:
            specialId: 'JYCS2025000001'
            phoneNumber: '+919876543210'
      - get:
          url: '/api/bookings/available-slots'
          qs:
            date: '2025-01-20'
            therapyType: 'Psychology'
```

### 6. Security Testing

**Security Checklist:**
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (JWT in headers)
- [ ] Rate limiting on sensitive endpoints
- [ ] Password hashing with bcrypt
- [ ] JWT token expiration
- [ ] HTTPS enforcement
- [ ] Input validation on all endpoints
- [ ] Role-based access control


## UI/UX Design Specifications

### Design System

**Color Palette:**
```css
:root {
  /* Primary Colors */
  --primary-blue: #4A90E2;
  --primary-blue-hover: #357ABD;
  --primary-blue-light: #E3F2FD;
  
  /* Neutral Colors */
  --white: #FFFFFF;
  --light-gray: #F5F5F5;
  --medium-gray: #E0E0E0;
  --dark-gray: #333333;
  --disabled-gray: #D0D0D0;
  
  /* Status Colors */
  --success-green: #4CAF50;
  --warning-orange: #FF9800;
  --error-red: #F44336;
  --info-blue: #2196F3;
  
  /* Text Colors */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-disabled: #999999;
}
```

**Typography:**
```css
/* Font Family */
font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Spacing System:**
```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
```

**Border Radius:**
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

**Shadows:**
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Component Specifications

**1. Booking Page Layout**

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Welcome, Mrs. Sharma | 🔔 | Logout          │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  Left Panel      │  Right Panel                             │
│  (30% width)     │  (70% width)                             │
│                  │                                          │
│  ┌────────────┐  │  ┌────────────────────────────────────┐ │
│  │   Photo    │  │  │  Week View Calendar                │ │
│  └────────────┘  │  │  < Mon Tue Wed Thu Fri Sat Sun >   │ │
│                  │  └────────────────────────────────────┘ │
│  Special ID      │                                          │
│  JYCS2025001234  │  ┌────────────────────────────────────┐ │
│                  │  │  Therapy Type Dropdown             │ │
│  Name: John Doe  │  │  Psychology (Session Limit: 2)     │ │
│  Age: 8 years    │  └────────────────────────────────────┘ │
│  Condition: ASD  │                                          │
│                  │  ┌────────────────────────────────────┐ │
│  Notes:          │  │  Time Schedule                     │ │
│  Prefers morning │  │  ┌──────┐ ┌──────┐ ┌──────┐       │ │
│  sessions        │  │  │ 9-10 │ │11-12 │ │ 3-4  │       │ │
│                  │  │  └──────┘ └──────┘ └──────┘       │ │
│                  │  └────────────────────────────────────┘ │
│  ┌────────────┐  │                                          │
│  │  CONFIRM   │  │  ┌────────────────────────────────────┐ │
│  │  BOOKING   │  │  │  Your Booked Therapies             │ │
│  └────────────┘  │  │  • Psychology (1/2 booked)         │ │
│                  │  │    Jan 20, 10:00 AM                │ │
│                  │  └────────────────────────────────────┘ │
└──────────────────┴──────────────────────────────────────────┘
```

**2. Button Styles**

```css
/* Primary Button */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-blue-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  padding: 12px 24px;
  border-radius: var(--radius-md);
}

/* Disabled Button */
.btn-disabled {
  background: var(--disabled-gray);
  color: var(--text-disabled);
  cursor: not-allowed;
}
```

**3. Card Styles**

```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--medium-gray);
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  transition: all 0.2s;
}
```

**4. Time Slot States**

```css
/* Available Slot */
.time-slot-available {
  background: white;
  border: 2px solid var(--medium-gray);
  cursor: pointer;
}

.time-slot-available:hover {
  border-color: var(--primary-blue);
  background: var(--primary-blue-light);
}

/* Selected Slot */
.time-slot-selected {
  background: var(--primary-blue);
  color: white;
  border: 2px solid var(--primary-blue);
}

/* Booked Slot */
.time-slot-booked {
  background: var(--disabled-gray);
  color: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}
```

**5. Form Input Styles**

```css
.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--medium-gray);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px var(--primary-blue-light);
}

.input-error {
  border-color: var(--error-red);
}

.input-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}
```

### Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small devices (phones, 640px and up) */
@media (min-width: 640px) { }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) { }

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) { }

/* Extra large devices (large desktops, 1280px and up) */
@media (min-width: 1280px) { }
```

**Mobile Layout Adjustments:**

```css
/* On mobile, stack left and right panels vertically */
@media (max-width: 768px) {
  .booking-page {
    flex-direction: column;
  }
  
  .left-panel,
  .right-panel {
    width: 100%;
  }
  
  .week-view {
    overflow-x: auto;
  }
  
  .time-slot {
    min-width: 120px;
  }
}
```

### Accessibility Features

**1. Keyboard Navigation:**
- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Focus indicators are clearly visible

**2. Screen Reader Support:**
```html
<!-- Example: Time slot with ARIA labels -->
<button
  className="time-slot"
  aria-label="Book session from 10:00 AM to 11:00 AM"
  aria-pressed={isSelected}
  aria-disabled={isBooked}
>
  10:00 AM - 11:00 AM
</button>
```

**3. Color Contrast:**
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have sufficient contrast
- Status indicators use both color and icons

**4. Touch Targets:**
- Minimum touch target size: 44x44px
- Adequate spacing between interactive elements

### Animation and Transitions

```css
/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Slide up animation */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}
```

### Loading States

```jsx
// Loading skeleton for booking page
<div className="skeleton-loader">
  <div className="skeleton-card animate-pulse">
    <div className="skeleton-circle w-24 h-24 bg-gray-300"></div>
    <div className="skeleton-line w-full h-4 bg-gray-300 mt-4"></div>
    <div className="skeleton-line w-3/4 h-4 bg-gray-300 mt-2"></div>
  </div>
</div>
```

### Toast Notifications

```jsx
// Success notification
toast.success('Booking confirmed successfully!', {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
});

// Error notification
toast.error('Failed to book session. Please try again.', {
  position: 'top-right',
  autoClose: 5000,
});
```


## Security Design

### Authentication Flow

**1. Parent OTP Authentication Flow:**

```mermaid
sequenceDiagram
    participant P as Parent
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant SMS as Twilio/Firebase
    
    P->>F: Enter Special ID + Phone
    F->>B: POST /api/auth/send-otp
    B->>DB: Validate patient exists
    DB-->>B: Patient found
    B->>DB: Check rate limit
    DB-->>B: Within limit
    B->>B: Generate 6-digit OTP
    B->>DB: Store OTP with 5min expiry
    B->>SMS: Send OTP via SMS
    SMS-->>P: Receive OTP
    B-->>F: Success response
    F-->>P: Show OTP input
    
    P->>F: Enter OTP
    F->>B: POST /api/auth/verify-otp
    B->>DB: Validate OTP
    DB-->>B: OTP valid
    B->>B: Generate JWT token
    B->>DB: Update last login
    B-->>F: Return JWT token
    F->>F: Store token in localStorage
    F-->>P: Redirect to dashboard
```

**2. JWT Token Structure:**

```javascript
{
  header: {
    alg: 'HS256',
    typ: 'JWT'
  },
  payload: {
    userId: 'ObjectId',
    specialId: 'JYCS2025001234',
    role: 'parent',
    iat: 1234567890,
    exp: 1234567890 + (7 * 24 * 60 * 60) // 7 days
  },
  signature: 'HMACSHA256(...)'
}
```

**3. Token Storage:**
- Frontend: localStorage (with XSS protection)
- Token sent in Authorization header: `Bearer <token>`
- Token refresh not implemented in MVP (7-day expiry)

### Authorization (RBAC)

**Role-Based Access Control Matrix:**

| Resource | Parent | Receptionist | Therapist | Admin |
|----------|--------|--------------|-----------|-------|
| View own patient data | ✅ | ❌ | ❌ | ✅ |
| View all patients | ❌ | ✅ | ❌ | ✅ |
| Register patient | ❌ | ✅ | ❌ | ✅ |
| Book session | ✅ | ❌ | ❌ | ❌ |
| View own bookings | ✅ | ❌ | ❌ | ✅ |
| View all bookings | ❌ | ✅ | ❌ | ✅ |
| View assigned sessions | ❌ | ❌ | ✅ | ✅ |
| Complete session | ❌ | ❌ | ✅ | ✅ |
| Create assessment | ❌ | ❌ | ✅ | ✅ |
| Manage therapists | ❌ | ❌ | ❌ | ✅ |
| Generate reports | ❌ | ❌ | ❌ | ✅ |

**Authorization Middleware:**

```javascript
// middleware/roleCheck.js
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'You do not have permission to access this resource'
        }
      });
    }
    
    next();
  };
}

// Usage in routes
router.get('/patients', auth, requireRole('receptionist', 'admin'), getPatients);
router.post('/bookings', auth, requireRole('parent'), createBooking);
router.post('/sessions/complete', auth, requireRole('therapist', 'admin'), completeSession);
```

### Data Protection

**1. Password Hashing:**
```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Hash password before storing
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

**2. Input Validation:**
```javascript
// Using express-validator
const { body, validationResult } = require('express-validator');

// Validation rules for patient registration
const patientValidation = [
  body('childName').trim().notEmpty().withMessage('Child name is required'),
  body('dateOfBirth').isISO8601().withMessage('Invalid date format'),
  body('parentPhone').matches(/^\+?[1-9]\d{9,14}$/).withMessage('Invalid phone number'),
  body('parentEmail').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('diagnosis').isArray().withMessage('Diagnosis must be an array'),
];

// Middleware to check validation results
function validate(req, res, next) {
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
  next();
}
```

**3. SQL Injection Prevention:**
- Using Mongoose ODM (parameterized queries by default)
- Never concatenate user input into queries

**4. XSS Prevention:**
- React escapes output by default
- Sanitize HTML input if using dangerouslySetInnerHTML
- Content Security Policy headers

**5. CSRF Prevention:**
- JWT tokens in Authorization header (not cookies)
- SameSite cookie attribute if using cookies

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// OTP rate limiter (5 requests per hour per IP)
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many OTP requests. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  }
});

// Apply to routes
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/', apiLimiter);
```

### HTTPS and SSL

- Vercel and Render provide free SSL certificates
- Enforce HTTPS in production:

```javascript
// middleware/httpsRedirect.js
function enforceHTTPS(req, res, next) {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
}
```

### Environment Variables

```bash
# .env file (never commit to git)
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/therapy-booking

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Twilio (for OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer with Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URL (for CORS)
FRONTEND_URL=https://yourapp.vercel.app
```

### CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Audit Logging

```javascript
// Log sensitive operations
async function auditLog(action, userId, details) {
  console.log({
    timestamp: new Date(),
    action,
    userId,
    details,
    ip: req.ip
  });
  
  // In production, store in database or external logging service
}

// Example usage
await auditLog('PATIENT_REGISTERED', req.user.id, { specialId: newPatient.specialId });
await auditLog('BOOKING_CREATED', req.user.id, { bookingId: booking.bookingId });
```


## Deployment Architecture

### Infrastructure Overview

```mermaid
graph TB
    subgraph "Client Devices"
        A[Desktop Browser]
        B[Mobile Browser]
        C[Tablet Browser]
    end
    
    subgraph "Vercel CDN"
        D[React App]
        E[Static Assets]
    end
    
    subgraph "Render"
        F[Express API]
        G[Node.js Runtime]
    end
    
    subgraph "MongoDB Atlas"
        H[(Database)]
    end
    
    subgraph "Cloudinary"
        I[File Storage]
    end
    
    subgraph "External Services"
        J[Twilio SMS]
        K[Gmail SMTP]
    end
    
    A --> D
    B --> D
    C --> D
    D --> F
    E --> D
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
```

### Frontend Deployment (Vercel)

**1. Setup Steps:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd frontend
vercel

# Production deployment
vercel --prod
```

**2. vercel.json Configuration:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
```

**3. Environment Variables in Vercel:**
- Set via Vercel dashboard or CLI
- `REACT_APP_API_URL`: Backend API URL

**4. Build Command:**
```bash
npm run build
```

**5. Custom Domain (Optional):**
- Free subdomain: `yourapp.vercel.app`
- Custom domain: Configure DNS in Vercel dashboard

### Backend Deployment (Render)

**1. Setup Steps:**

```bash
# Create render.yaml in project root
# Push to GitHub
# Connect GitHub repo to Render
# Render auto-deploys on push
```

**2. render.yaml Configuration:**

```yaml
services:
  - type: web
    name: therapy-booking-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: TWILIO_ACCOUNT_SID
        sync: false
      - key: TWILIO_AUTH_TOKEN
        sync: false
      - key: TWILIO_PHONE_NUMBER
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASSWORD
        sync: false
      - key: FRONTEND_URL
        value: https://yourapp.vercel.app
    healthCheckPath: /api/health
```

**3. Health Check Endpoint:**

```javascript
// routes/health.js
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

**4. Free Tier Limitations:**
- 750 hours/month (enough for 24/7 operation)
- Spins down after 15 minutes of inactivity
- Cold start time: ~30 seconds

**5. Keep-Alive Strategy (Optional):**

```javascript
// utils/keepAlive.js
const axios = require('axios');

// Ping server every 14 minutes to prevent spin-down
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      await axios.get(`${process.env.API_URL}/api/health`);
      console.log('Keep-alive ping successful');
    } catch (error) {
      console.error('Keep-alive ping failed:', error.message);
    }
  }, 14 * 60 * 1000); // 14 minutes
}
```

### Database Setup (MongoDB Atlas)

**1. Create Free Cluster:**
- Sign up at mongodb.com/cloud/atlas
- Create free M0 cluster (512MB)
- Choose region closest to Render server
- Create database user
- Whitelist IP: 0.0.0.0/0 (allow from anywhere)

**2. Connection String:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/therapy-booking?retryWrites=true&w=majority
```

**3. Database Indexes:**

```javascript
// Create indexes for performance
async function createIndexes() {
  await Patient.collection.createIndex({ specialId: 1 }, { unique: true });
  await Patient.collection.createIndex({ parentPhone: 1 });
  await Booking.collection.createIndex({ date: 1 });
  await Booking.collection.createIndex({ specialId: 1, date: 1 });
  await Booking.collection.createIndex({ therapistId: 1, date: 1, timeSlot: 1 }, { unique: true });
  await OTP.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await Session.collection.createIndex({ specialId: 1 });
  await Assessment.collection.createIndex({ specialId: 1 });
}
```

### File Storage Setup (Cloudinary)

**1. Create Free Account:**
- Sign up at cloudinary.com
- Free tier: 25GB storage, 25GB bandwidth/month
- Get credentials from dashboard

**2. Configuration:**

```javascript
// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

**3. Upload Function:**

```javascript
// utils/uploadImage.js
const cloudinary = require('../config/cloudinary');

async function uploadImage(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'therapy-booking/patients',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
    
    return result.secure_url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
}
```

### OTP Service Setup

**Option 1: Twilio (Recommended for Production)**

```javascript
// services/smsService.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(phoneNumber, message) {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return { success: true };
  } catch (error) {
    console.error('SMS send failed:', error);
    throw new Error('Failed to send SMS');
  }
}
```

**Option 2: Firebase Phone Auth (Alternative)**

```javascript
// services/firebaseSms.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

// Use Firebase Admin SDK for phone verification
```

### Email Service Setup (Nodemailer + Gmail)

**1. Gmail App Password:**
- Enable 2FA on Gmail account
- Generate app-specific password
- Use in EMAIL_PASSWORD env variable

**2. Configuration:**

```javascript
// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Jyothi Central School" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error('Failed to send email');
  }
}

module.exports = { sendEmail };
```

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Monitoring and Logging

**1. Free Monitoring Tools:**
- UptimeRobot: Monitor uptime (free for 50 monitors)
- Sentry: Error tracking (free tier: 5K events/month)
- Google Analytics: User analytics

**2. Sentry Setup:**

```javascript
// server.js
const Sentry = require('@sentry/node');

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1
  });
  
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}
```

### Backup Strategy

**1. MongoDB Atlas Backups:**
- Free tier includes continuous backups
- Restore from any point in last 24 hours

**2. Manual Backup Script:**

```bash
# backup.sh
#!/bin/bash
mongodump --uri="$MONGODB_URI" --out="./backups/$(date +%Y%m%d)"
```

### Cost Summary (All Free Tiers)

| Service | Free Tier | Sufficient For |
|---------|-----------|----------------|
| Vercel | Unlimited projects | ✅ Yes |
| Render | 750 hrs/month | ✅ Yes (24/7) |
| MongoDB Atlas | 512MB storage | ✅ Yes (1000+ patients) |
| Cloudinary | 25GB storage | ✅ Yes |
| Twilio | Test credits | ⚠️ Development only |
| Firebase Auth | 10K verifications/month | ✅ Yes |
| Gmail SMTP | 500 emails/day | ✅ Yes |

**Total Monthly Cost: ₹0** 🎉


## Additional Features and Considerations

### PDF Generation for Assessments

**Using PDFKit:**

```javascript
// services/pdfService.js
const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

async function generateAssessmentPDF(assessment, patient) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const filename = `assessment-${assessment.assessmentId}.pdf`;
    const filepath = path.join(__dirname, '../temp', filename);
    
    // Create write stream
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    // Header
    doc.fontSize(20).text('Therapy Assessment Report', { align: 'center' });
    doc.moveDown();
    
    // Patient Information
    doc.fontSize(14).text('Patient Information', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${patient.childName}`);
    doc.text(`Special ID: ${patient.specialId}`);
    doc.text(`Age: ${patient.age} years`);
    doc.text(`Date of Assessment: ${new Date(assessment.assessmentDate).toLocaleDateString()}`);
    doc.moveDown();
    
    // Assessment Sections
    const sections = [
      { title: 'Presenting Problems', content: assessment.assessmentData.presentingProblems },
      { title: 'Developmental History', content: JSON.stringify(assessment.assessmentData.developmentalHistory, null, 2) },
      { title: 'Motor Skills', content: JSON.stringify(assessment.assessmentData.motorSkills, null, 2) },
      { title: 'Language Skills', content: JSON.stringify(assessment.assessmentData.languageSkills, null, 2) },
      { title: 'Social & Adaptive Skills', content: assessment.assessmentData.socialAdaptiveSkills },
      { title: 'Behavioral Observations', content: assessment.assessmentData.behavioralObservations },
      { title: 'Test Administration', content: assessment.assessmentData.testAdministration },
      { title: 'Diagnosis & Impression', content: assessment.assessmentData.diagnosisImpression },
      { title: 'Recommendations', content: assessment.assessmentData.recommendations }
    ];
    
    sections.forEach(section => {
      doc.fontSize(14).text(section.title, { underline: true });
      doc.fontSize(11).text(section.content || 'N/A');
      doc.moveDown();
    });
    
    // Footer
    doc.fontSize(10).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.end();
    
    stream.on('finish', async () => {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filepath, {
          folder: 'therapy-booking/assessments',
          resource_type: 'raw'
        });
        
        // Delete temp file
        fs.unlinkSync(filepath);
        
        resolve(result.secure_url);
      } catch (error) {
        reject(error);
      }
    });
    
    stream.on('error', reject);
  });
}

module.exports = { generateAssessmentPDF };
```

### Notification Service Implementation

```javascript
// services/notificationService.js
const { sendEmail } = require('../config/email');
const { sendSMS } = require('./smsService');
const Notification = require('../models/Notification');

async function createNotification(data) {
  const notification = await Notification.create(data);
  
  // Send based on channel
  if (data.channel === 'email') {
    await sendNotificationEmail(data);
  } else if (data.channel === 'sms') {
    await sendNotificationSMS(data);
  }
  
  return notification;
}

async function sendNotificationEmail(data) {
  const patient = await Patient.findOne({ specialId: data.recipientId });
  
  let subject, html;
  
  switch (data.type) {
    case 'booking_confirmed':
      subject = 'Booking Confirmed - Jyothi Central School';
      html = `
        <h2>Booking Confirmed</h2>
        <p>Dear ${patient.parentName},</p>
        <p>${data.message}</p>
        <p>Thank you for choosing Jyothi Central School.</p>
      `;
      break;
      
    case 'session_reminder':
      subject = 'Session Reminder - Tomorrow';
      html = `
        <h2>Session Reminder</h2>
        <p>Dear ${patient.parentName},</p>
        <p>This is a reminder that ${patient.childName} has a therapy session tomorrow.</p>
        <p>${data.message}</p>
      `;
      break;
      
    case 'session_completed':
      subject = 'Session Completed';
      html = `
        <h2>Session Completed</h2>
        <p>Dear ${patient.parentName},</p>
        <p>${data.message}</p>
        <p>You can view the session notes in your dashboard.</p>
      `;
      break;
      
    case 'assessment_completed':
      subject = 'Assessment Report Available';
      html = `
        <h2>Assessment Report</h2>
        <p>Dear ${patient.parentName},</p>
        <p>The bi-monthly assessment for ${patient.childName} has been completed.</p>
        <p>Please find the detailed report attached.</p>
      `;
      break;
  }
  
  await sendEmail(patient.parentEmail, subject, html);
}

async function sendNotificationSMS(data) {
  const patient = await Patient.findOne({ specialId: data.recipientId });
  await sendSMS(patient.parentPhone, data.message);
}

// Schedule reminder notifications (run daily)
async function scheduleReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);
  
  const bookings = await Booking.find({
    date: { $gte: tomorrow, $lte: endOfTomorrow },
    status: 'confirmed'
  }).populate('specialId');
  
  for (const booking of bookings) {
    await createNotification({
      recipientId: booking.specialId,
      recipientType: 'parent',
      type: 'session_reminder',
      message: `Reminder: ${booking.therapyType} session tomorrow at ${booking.timeSlot}`,
      channel: 'sms'
    });
  }
}

module.exports = { createNotification, scheduleReminders };
```

### Cron Jobs for Scheduled Tasks

```javascript
// utils/cronJobs.js
const cron = require('node-cron');
const { scheduleReminders } = require('../services/notificationService');

function initCronJobs() {
  // Run reminder notifications daily at 6 PM
  cron.schedule('0 18 * * *', async () => {
    console.log('Running daily reminder notifications...');
    try {
      await scheduleReminders();
      console.log('Reminders sent successfully');
    } catch (error) {
      console.error('Failed to send reminders:', error);
    }
  });
  
  console.log('Cron jobs initialized');
}

module.exports = { initCronJobs };
```

### Search Functionality

```javascript
// controllers/patientController.js
async function searchPatients(req, res) {
  try {
    const { query } = req.query;
    
    const patients = await Patient.find({
      $or: [
        { specialId: new RegExp(query, 'i') },
        { childName: new RegExp(query, 'i') },
        { parentName: new RegExp(query, 'i') },
        { parentPhone: new RegExp(query, 'i') }
      ],
      isActive: true
    }).limit(20);
    
    res.json({
      success: true,
      patients
    });
  } catch (error) {
    next(error);
  }
}
```

### Report Generation

```javascript
// services/reportService.js
const ExcelJS = require('exceljs');

async function generateMonthlyReport(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  // Get data
  const bookings = await Booking.find({
    date: { $gte: startDate, $lte: endDate }
  }).populate('specialId therapistId');
  
  const sessions = await Session.find({
    sessionDate: { $gte: startDate, $lte: endDate }
  });
  
  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Monthly Report');
  
  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Patient ID', key: 'specialId', width: 20 },
    { header: 'Patient Name', key: 'patientName', width: 25 },
    { header: 'Therapy Type', key: 'therapyType', width: 20 },
    { header: 'Therapist', key: 'therapist', width: 25 },
    { header: 'Status', key: 'status', width: 15 }
  ];
  
  // Add data
  bookings.forEach(booking => {
    worksheet.addRow({
      date: booking.date.toLocaleDateString(),
      specialId: booking.specialId,
      patientName: booking.patient?.childName,
      therapyType: booking.therapyType,
      therapist: booking.therapist?.name,
      status: booking.status
    });
  });
  
  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4A90E2' }
  };
  
  // Save to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload_stream(
    { folder: 'therapy-booking/reports', resource_type: 'raw' },
    (error, result) => {
      if (error) throw error;
      return result.secure_url;
    }
  ).end(buffer);
  
  return result;
}
```

### Performance Optimization

**1. Database Query Optimization:**
```javascript
// Use lean() for read-only queries
const patients = await Patient.find().lean();

// Use select() to limit fields
const patients = await Patient.find().select('specialId childName age');

// Use pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const patients = await Patient.find()
  .skip(skip)
  .limit(limit);
```

**2. Caching Strategy:**
```javascript
// Simple in-memory cache for frequently accessed data
const cache = new Map();

async function getTherapists() {
  const cacheKey = 'therapists';
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const therapists = await Therapist.find({ isAvailable: true });
  cache.set(cacheKey, therapists);
  
  // Clear cache after 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return therapists;
}
```

**3. Image Optimization:**
- Compress images before upload
- Use Cloudinary transformations
- Lazy load images in frontend

**4. Code Splitting (Frontend):**
```javascript
// Lazy load routes
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const BookingPage = lazy(() => import('./pages/BookingPage'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<ParentDashboard />} />
    <Route path="/booking" element={<BookingPage />} />
  </Routes>
</Suspense>
```

### Future Enhancements (Post-MVP)

1. **Real-time Updates**: WebSocket integration for live booking updates
2. **Video Consultations**: Integration with Zoom/Google Meet API
3. **Payment Gateway**: For session fees (Razorpay/Stripe)
4. **Mobile App**: React Native version
5. **Multi-language Support**: i18n for regional languages
6. **Advanced Analytics**: Charts and graphs for progress tracking
7. **Automated Reminders**: WhatsApp integration
8. **Waiting List**: Queue management for fully booked slots
9. **Feedback System**: Parent ratings and reviews
10. **Export Data**: Patient data export in various formats

