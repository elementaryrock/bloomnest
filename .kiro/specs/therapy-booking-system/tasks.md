# Implementation Plan

- [x] 1. Initialize project structure and setup development environment





  - Create root directory with frontend and backend folders
  - Initialize Node.js projects with package.json in both directories
  - Install core dependencies (React, Express, MongoDB, etc.)
  - Setup Git repository with .gitignore files
  - Create .env.example files for environment variables
  - _Requirements: 17.2, 17.3_

- [x] 2. Setup MongoDB database and create data models



  - Configure MongoDB Atlas connection
  - Create Mongoose schemas for all 10 collections (Patient, Staff, Therapist, Booking, Session, Assessment, OTP, Notification, Report, SystemSettings)
  - Implement schema validation rules
  - Create database indexes for performance optimization
  - Add TTL index for OTP expiration
  - _Requirements: 3.1, 3.2, 3.3, 15.6_

- [x] 3. Implement authentication system backend



  - Create OTP generation service with 6-digit random number
  - Implement OTP storage with 5-minute expiry
  - Build OTP verification logic with 3-attempt limit
  - Implement rate limiting (5 OTPs per hour)
  - Create JWT token generation and validation
  - Build staff password-based login with bcrypt
  - Create authentication middleware for protected routes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 15.1, 15.2_

- [x] 4. Implement Special ID generation service


  - Create function to generate Special ID in format JYCS + YEAR + 6-digit sequence
  - Query last registered patient to get sequence number
  - Implement auto-increment logic with zero padding
  - Add uniqueness validation
  - _Requirements: 3.2_

- [x] 5. Build patient registration API



  - Create POST /api/patients/register endpoint
  - Implement input validation for all required fields
  - Integrate Special ID generation
  - Add duplicate phone/email check
  - Implement image upload to Cloudinary
  - Calculate age from date of birth
  - Store patient record in database
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 6. Implement booking validation service




  - Create function to check monthly booking limit (2 per therapy type)
  - Implement date range validation (within 30 days)
  - Build therapist availability checker
  - Create slot conflict detection logic
  - Implement patient double-booking prevention
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 7. Build available slots API


  - Create GET /api/bookings/available-slots endpoint
  - Implement logic to find therapists by specialization and working days
  - Generate time slot array (9 AM to 5 PM)
  - Query existing bookings for selected date
  - Calculate and return available slots
  - _Requirements: 5.6_

- [x] 8. Implement booking creation API




  - Create POST /api/bookings endpoint
  - Integrate booking validation service
  - Generate unique booking ID
  - Create booking record with confirmed status
  - Create corresponding session record
  - Send booking confirmation notification
  - _Requirements: 5.8, 5.9, 13.1_

- [x] 9. Build therapist schedule API




  - Create GET /api/bookings/therapist endpoint
  - Filter bookings by therapist ID and today's date
  - Populate patient and booking details
  - Return sorted schedule with session information
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [x] 10. Implement session completion API



  - Create POST /api/sessions/complete endpoint
  - Validate therapist ownership of session
  - Store session notes (activities, goals, progress, observations, recommendations)
  - Update session completion timestamp
  - Update booking status to completed
  - Send notification to parent
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 13.4_

- [x] 11. Build assessment module backend


  - Create POST /api/assessments endpoint for creating assessments
  - Implement PUT /api/assessments/:id for updating drafts
  - Create GET /api/assessments/:specialId for retrieving patient assessments
  - Implement draft save functionality
  - Build assessment completion logic
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 12. Implement PDF generation service



  - Install and configure PDFKit
  - Create PDF template for assessment reports
  - Implement function to generate PDF from assessment data
  - Upload generated PDF to Cloudinary
  - Store PDF URL in assessment record
  - Send email with PDF attachment
  - _Requirements: 9.5, 9.6, 9.7_

- [x] 13. Build notification service



  - Create notification creation function
  - Implement email sending with Nodemailer
  - Integrate Twilio/Firebase for SMS
  - Create notification templates for different types
  - Implement scheduled reminder notifications
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 14. Implement admin dashboard APIs



  - Create GET /api/admin/stats endpoint for system statistics
  - Build therapist utilization calculation logic
  - Create GET /api/admin/utilization endpoint
  - Implement therapist management endpoints (add, edit, delete)
  - Build report generation API
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 15. Implement patient search and management APIs
  - Create GET /api/patients/search endpoint with regex search
  - Build GET /api/patients/:specialId endpoint
  - Implement PUT /api/patients/:specialId for updates
  - Add patient deactivation functionality
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 16. Setup error handling and validation
  - Create global error handler middleware
  - Implement custom error classes (ValidationError, AuthenticationError, etc.)
  - Add input validation middleware using express-validator
  - Create consistent error response format
  - _Requirements: 15.3_

- [x] 17. Implement security measures
  - Add rate limiting middleware
  - Configure CORS with frontend URL
  - Implement helmet for security headers
  - Add HTTPS enforcement for production
  - Create audit logging for sensitive operations
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 18. Setup React frontend project
  - Create React app with Create React App
  - Install Tailwind CSS and configure
  - Setup React Router for navigation
  - Create Context API for global state management
  - Configure Axios for API calls
  - Install additional libraries (react-datepicker, react-hook-form, react-toastify, react-icons)
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 19. Implement authentication UI components
  - Create ParentLogin component with Special ID and phone inputs
  - Build OTPVerification component with 6-digit input
  - Implement StaffLogin component with email and password
  - Create AuthContext for managing authentication state
  - Build protected route wrapper component
  - Add token storage in localStorage
  - Implement auto-redirect on authentication
  - _Requirements: 1.1, 1.2, 1.3, 1.7, 2.1, 2.3, 2.4_

- [x] 20. Build parent dashboard UI
  - Create ParentDashboard layout component
  - Build ChildInfoCard with photo, Special ID, name, age, diagnosis
  - Implement UpcomingAppointments list component
  - Create StatisticsCards for sessions and assessments
  - Add QuickActions buttons (Book, History, Assessments)
  - Integrate API calls to fetch dashboard data
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 21. Implement booking page UI - left panel
  - Create BookingPage layout with two-panel design
  - Build LeftPanel component
  - Implement PatientCard with all patient details
  - Add notes section display
  - Create large ConfirmButton component
  - Style according to design specifications (blue accent, card shadows)
  - _Requirements: 5.1, 5.9_

- [x] 22. Implement booking page UI - date selector
  - Create DateSelector component with week view
  - Build WeekView with Mon-Sun day cards
  - Implement navigation arrows for previous/next week
  - Add date selection logic with blue highlight
  - Disable past dates with gray styling
  - _Requirements: 5.1, 5.2_

- [x] 23. Implement booking page UI - therapy type and time slots
  - Create TherapyTypeDropdown with all therapy options
  - Display session limit indicator (e.g., "Session Limit: 2")
  - Show current booking count (e.g., "1/2 booked")
  - Build TimeSchedule component with slot cards
  - Implement time slot states (available, selected, booked)
  - Style slots according to design (blue for selected, gray for booked)
  - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 24. Implement booking page UI - booked therapies list
  - Create BookedTherapiesList component
  - Display current bookings with therapy type, count, date, time
  - Implement real-time update when new slot is selected
  - Add booking preview before confirmation
  - _Requirements: 5.7_

- [x] 25. Integrate booking flow with backend APIs
  - Connect DateSelector to available slots API
  - Implement booking validation on frontend
  - Create booking submission logic
  - Add success/error toast notifications
  - Implement optimistic UI updates
  - Handle loading states during API calls
  - _Requirements: 5.8, 5.9_

- [x] 26. Build receptionist dashboard and patient registration UI
  - Create ReceptionistDashboard layout
  - Build PatientRegistration multi-step form
  - Implement ChildInfoForm with photo upload
  - Create ParentInfoForm with contact details
  - Build MedicalInfoForm with diagnosis checkboxes
  - Add form validation with React Hook Form
  - Integrate with patient registration API
  - Display generated Special ID on success
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 27. Implement patient search UI
  - Create PatientSearch component with search input
  - Build search results list with patient cards
  - Implement click to view patient details
  - Add patient edit functionality
  - Create patient deactivation confirmation dialog
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 28. Build therapist dashboard UI
  - Create TherapistDashboard layout
  - Implement DailySchedule component with session cards
  - Build SessionCard with patient photo, name, ID, therapy type, time
  - Add "View Profile" and "Start Session" buttons
  - Create StatisticsPanel for session counts
  - Integrate with therapist schedule API
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [x] 29. Implement session notes UI
  - Create SessionNotes form component
  - Build form fields for activities, goals, progress, observations, recommendations
  - Add progress level dropdown
  - Implement form validation
  - Create submit logic with API integration
  - Show success message on completion
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 30. Build assessment form UI
  - Create multi-step AssessmentForm component
  - Implement ProgressIndicator showing current step
  - Build 10 section forms (presenting problems, developmental history, motor skills, etc.)
  - Add navigation between sections
  - Implement draft save functionality
  - Create final review page
  - Add submit logic with PDF generation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 31. Implement admin dashboard UI
  - Create AdminDashboard layout
  - Build SystemStats cards (patients, therapists, sessions)
  - Implement UtilizationChart with percentage bars
  - Add warning indicators for high utilization
  - Create ManagementActions section
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 32. Build therapist management UI
  - Create TherapistManagement component
  - Build add therapist form
  - Implement edit therapist functionality
  - Create therapist list with availability toggle
  - Add schedule management interface
  - Integrate with therapist management APIs
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 33. Implement report generation UI
  - Create ReportGeneration component
  - Build report type selector (patient list, session summary, utilization, monthly stats)
  - Add date range picker for reports
  - Implement export format selection (PDF/Excel)
  - Create download logic
  - Show loading state during generation
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 34. Implement responsive design
  - Add mobile breakpoints with Tailwind CSS
  - Create mobile-specific layouts for booking page
  - Implement collapsible navigation for mobile
  - Adjust form layouts for smaller screens
  - Test on multiple device sizes
  - Ensure touch-friendly button sizes (44x44px minimum)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 35. Add loading states and error boundaries
  - Create LoadingSpinner component
  - Implement skeleton loaders for data-heavy pages
  - Build ErrorBoundary component
  - Add error handling for API calls
  - Create user-friendly error messages
  - _Requirements: 17.1_

- [x] 36. Implement notification display
  - Integrate react-toastify for toast notifications
  - Create notification templates
  - Add in-app notification center
  - Implement notification badge on icon
  - Build notification list with read/unread states
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 37. Setup Cloudinary for file uploads
  - Configure Cloudinary account and credentials
  - Create image upload utility function
  - Implement image compression and transformation
  - Add file upload component with preview
  - Handle upload errors gracefully
  - _Requirements: 3.6_

- [x] 38. Setup OTP service integration
  - Configure Twilio or Firebase credentials
  - Implement SMS sending function
  - Add error handling for SMS failures
  - Create fallback mechanism
  - Test OTP delivery
  - _Requirements: 1.1, 1.2_

- [x] 39. Setup email service with Nodemailer
  - Configure Gmail SMTP with app password
  - Create email templates for different notification types
  - Implement email sending function
  - Add attachment support for PDF reports
  - Test email delivery
  - _Requirements: 13.1, 13.4, 9.6_

- [x] 40. Deploy backend to Render
  - Create render.yaml configuration
  - Setup environment variables in Render dashboard
  - Configure health check endpoint
  - Deploy backend service
  - Test API endpoints on production URL
  - _Requirements: 17.1, 17.2_

- [x] 41. Deploy frontend to Vercel
  - Create vercel.json configuration
  - Setup environment variables (API URL)
  - Configure build settings
  - Deploy frontend application
  - Test all features on production URL
  - _Requirements: 17.1, 17.2_

- [x] 42. Setup MongoDB Atlas production database
  - Create production cluster
  - Configure database user and password
  - Whitelist Render IP addresses
  - Create database indexes
  - Test connection from backend
  - _Requirements: 17.2, 17.3_

- [x] 43. Implement cron jobs for scheduled tasks
  - Install node-cron package
  - Create daily reminder notification job (6 PM)
  - Implement job to clean up expired OTPs
  - Add logging for cron job execution
  - Test scheduled tasks
  - _Requirements: 13.2_

- [x] 44. Add session history and assessment viewer
  - Create SessionHistory component for parents
  - Build session list with date, therapy type, notes
  - Implement AssessmentViewer component
  - Add PDF download functionality
  - Create timeline view for progress tracking
  - _Requirements: 4.5, 4.6_

- [x] 45. Implement booking cancellation
  - Create cancel booking API endpoint
  - Add 24-hour validation check
  - Build cancellation UI with confirmation dialog
  - Update booking status to cancelled
  - Send cancellation notification
  - _Requirements: 6.6, 13.5_

- [x] 46. Add accessibility features
  - Implement keyboard navigation for all interactive elements
  - Add ARIA labels to components
  - Ensure color contrast meets WCAG AA standards
  - Test with screen readers
  - Add focus indicators
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 47. Setup monitoring and error tracking
  - Configure Sentry for error tracking
  - Add UptimeRobot for uptime monitoring
  - Implement Google Analytics
  - Create logging strategy
  - Test error reporting
  - _Requirements: 17.1_

- [x] 48. Create documentation
  - Write API documentation with endpoint descriptions
  - Create user guide for each role (parent, receptionist, therapist, admin)
  - Document deployment process
  - Add code comments for complex logic
  - Create README files for frontend and backend
  - _Requirements: All_

- [x] 49. Perform end-to-end testing
  - Test complete parent booking flow
  - Verify OTP authentication works correctly
  - Test therapist session completion workflow
  - Verify admin dashboard statistics accuracy
  - Test all CRUD operations
  - Verify notifications are sent correctly
  - Test on multiple browsers and devices
  - _Requirements: All_

- [x] 50. Final integration and bug fixes
  - Fix any remaining bugs discovered during testing
  - Optimize performance bottlenecks
  - Ensure all features work together seamlessly
  - Verify all requirements are met
  - Prepare for production launch
  - _Requirements: All_
