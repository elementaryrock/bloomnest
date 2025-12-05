# Requirements Document

## Introduction

The Therapy Unit Booking System is a comprehensive web application designed for Jyothi Central School to manage therapy sessions for special needs children (Autism, Learning Disabilities, Cerebral Palsy). The system enables parents to book therapy sessions using OTP-based authentication with Special IDs, while providing therapists and administrators with tools to manage schedules, sessions, and assessments. The system prioritizes accessibility, ease of use, and efficient resource management across multiple therapy types.

## Requirements

### Requirement 1: OTP-Based Parent Authentication

**User Story:** As a parent of a special needs child, I want to securely log in using my Special ID and phone number with OTP verification, so that I can access my child's therapy booking portal without remembering passwords.

#### Acceptance Criteria

1. WHEN a parent enters their Special ID (format: JYCS2025XXXXXX) and registered phone number THEN the system SHALL send a 6-digit OTP to the registered phone number
2. WHEN the OTP is generated THEN the system SHALL set an expiry time of 5 minutes
3. WHEN a parent enters a valid OTP within 5 minutes THEN the system SHALL authenticate the user and generate a JWT token
4. WHEN a parent enters an invalid OTP THEN the system SHALL display an error message and allow up to 3 attempts per OTP
5. WHEN a parent requests to resend OTP THEN the system SHALL allow resending after 30 seconds
6. WHEN a parent requests more than 5 OTPs within an hour THEN the system SHALL block further OTP requests and display a rate limit message
7. WHEN OTP authentication succeeds THEN the system SHALL redirect the parent to their dashboard

### Requirement 2: Staff Password-Based Authentication

**User Story:** As a staff member (receptionist, therapist, or admin), I want to log in using my email and password, so that I can access my role-specific dashboard and perform my duties.

#### Acceptance Criteria

1. WHEN a staff member enters valid email and password THEN the system SHALL authenticate and generate a JWT token with role information
2. WHEN a staff member enters invalid credentials THEN the system SHALL display an error message
3. WHEN authentication succeeds THEN the system SHALL redirect to the appropriate dashboard based on role (receptionist/therapist/admin)
4. WHEN a staff member logs out THEN the system SHALL invalidate the JWT token and redirect to login page

### Requirement 3: Patient Registration by Receptionist

**User Story:** As a receptionist, I want to register new patients with comprehensive information, so that parents can book therapy sessions and therapists can access patient details.

#### Acceptance Criteria

1. WHEN a receptionist submits a complete registration form THEN the system SHALL generate a unique Special ID in format JYCS + YEAR + 6-digit sequential number
2. WHEN generating a Special ID THEN the system SHALL query the last registered patient, increment by 1, and pad with zeros to 6 digits
3. WHEN a registration form is submitted THEN the system SHALL validate all required fields: child name, date of birth, gender, parent name, phone number, email, diagnosis
4. WHEN a phone number or email already exists THEN the system SHALL display an error message
5. WHEN registration is successful THEN the system SHALL store the patient record with auto-calculated age and registration timestamp
6. WHEN a patient photo is uploaded THEN the system SHALL store it in cloud storage and save the URL reference
7. WHEN registration completes THEN the system SHALL display the generated Special ID for printing

### Requirement 4: Parent Dashboard

**User Story:** As a parent, I want to view my child's information, upcoming appointments, and session history on a dashboard, so that I can stay informed about my child's therapy progress.

#### Acceptance Criteria

1. WHEN a parent logs in THEN the system SHALL display a dashboard with child information card showing photo, Special ID, name, age, and diagnosis
2. WHEN the dashboard loads THEN the system SHALL display a list of upcoming appointments sorted by date
3. WHEN the dashboard loads THEN the system SHALL display statistics cards showing total sessions completed, upcoming sessions this month, and last assessment date
4. WHEN a parent clicks "Book New Session" THEN the system SHALL navigate to the booking interface
5. WHEN a parent clicks "View History" THEN the system SHALL display all past sessions with notes
6. WHEN a parent clicks "View Assessments" THEN the system SHALL display all completed assessments

### Requirement 5: Therapy Session Booking Interface

**User Story:** As a parent, I want to book therapy sessions by selecting date, therapy type, and time slot with visual feedback, so that I can schedule appointments that fit my availability.

#### Acceptance Criteria

1. WHEN the booking page loads THEN the system SHALL display a week view calendar with current week dates (Mon-Sun)
2. WHEN a parent clicks navigation arrows THEN the system SHALL display the previous or next week
3. WHEN a parent selects a date THEN the system SHALL highlight it in blue and enable the therapy type dropdown
4. WHEN a parent selects a therapy type THEN the system SHALL display available time slots for that date and therapy type
5. WHEN displaying therapy types THEN the system SHALL show session limit indicator (e.g., "Session Limit: 2 per type") and current booking count (e.g., "1/2 booked")
6. WHEN displaying time slots THEN the system SHALL show available slots as clickable cards, booked slots in gray (disabled), and selected slot in blue
7. WHEN a parent selects a time slot THEN the system SHALL add it to "Your Booked Therapies" preview section
8. WHEN a parent clicks "CONFIRM BOOKING" THEN the system SHALL validate the booking and create the appointment
9. WHEN booking is confirmed THEN the system SHALL display a success message and update the booked therapies list

### Requirement 6: Booking Validation Rules

**User Story:** As a system administrator, I want the booking system to enforce business rules, so that resources are allocated fairly and efficiently.

#### Acceptance Criteria

1. WHEN a parent attempts to book a session THEN the system SHALL verify the patient has not exceeded 2 sessions per therapy type per month
2. WHEN a parent attempts to book a session THEN the system SHALL verify no existing booking exists for the same patient at the same time
3. WHEN a parent attempts to book a session THEN the system SHALL verify a therapist is available for the selected therapy type on that day and time
4. WHEN a parent attempts to book a session THEN the system SHALL verify the slot is not already booked by another patient
5. WHEN a parent attempts to book a session THEN the system SHALL verify the date is within 30 days from today
6. WHEN a parent attempts to cancel a booking THEN the system SHALL verify it is at least 24 hours before the scheduled time
7. WHEN validation fails THEN the system SHALL display a specific error message explaining the reason

### Requirement 7: Therapist Daily Schedule Management

**User Story:** As a therapist, I want to view my daily schedule with patient details, so that I can prepare for sessions and manage my time effectively.

#### Acceptance Criteria

1. WHEN a therapist logs in THEN the system SHALL display today's schedule with up to 6 sessions
2. WHEN displaying each session THEN the system SHALL show patient photo, name, Special ID, therapy type, diagnosis, and session time
3. WHEN a therapist clicks "View Profile" THEN the system SHALL display complete patient information including medical history
4. WHEN a therapist clicks "Start Session" THEN the system SHALL start a timer for 45 minutes
5. WHEN a therapist clicks "End Session" THEN the system SHALL display a session notes form
6. WHEN the dashboard loads THEN the system SHALL display statistics: total sessions today, completed sessions, and pending session notes

### Requirement 8: Session Notes Documentation

**User Story:** As a therapist, I want to document session notes after each therapy session, so that progress can be tracked and shared with parents.

#### Acceptance Criteria

1. WHEN a therapist completes a session THEN the system SHALL display a form with fields: activities conducted, goals addressed, progress level, behavioral observations, recommendations for parents, and next session focus
2. WHEN a therapist submits session notes THEN the system SHALL validate all required fields are filled
3. WHEN session notes are saved THEN the system SHALL mark the session as completed and timestamp the completion
4. WHEN session notes are saved THEN the system SHALL make them available in the patient's session history
5. WHEN session notes are saved THEN the system SHALL send a notification to the parent

### Requirement 9: Bi-Monthly Assessment Module

**User Story:** As a therapist, I want to conduct comprehensive bi-monthly assessments with structured forms, so that I can evaluate patient progress and adjust therapy plans.

#### Acceptance Criteria

1. WHEN a therapist creates a new assessment THEN the system SHALL display a multi-step form with 10 sections: presenting problems, developmental history, motor skills, language skills, social & adaptive skills, behavioral observations, test administration & scores, diagnosis & impression, recommendations & therapy plan, and follow-up date
2. WHEN a therapist is filling the assessment THEN the system SHALL allow saving as draft at any point
3. WHEN a therapist navigates between sections THEN the system SHALL display a progress indicator
4. WHEN a therapist completes all sections THEN the system SHALL enable the submit button
5. WHEN an assessment is submitted THEN the system SHALL generate a PDF report
6. WHEN a PDF report is generated THEN the system SHALL send it to the parent's email
7. WHEN an assessment is completed THEN the system SHALL update the "Last Assessment Date" on the parent dashboard

### Requirement 10: Admin Dashboard and System Overview

**User Story:** As an administrator, I want to view system-wide statistics and therapist utilization, so that I can make informed decisions about resource allocation.

#### Acceptance Criteria

1. WHEN an admin logs in THEN the system SHALL display statistics cards showing total patients, total therapists, completed sessions this month, and pending sessions
2. WHEN the admin dashboard loads THEN the system SHALL display a therapist utilization chart showing percentage utilization for each therapy type
3. WHEN utilization exceeds 90% for any therapy type THEN the system SHALL display a warning indicator
4. WHEN an admin clicks "Add Therapist" THEN the system SHALL display a form to register a new therapist
5. WHEN an admin clicks "Manage Schedules" THEN the system SHALL display therapist availability settings
6. WHEN an admin clicks "Generate Reports" THEN the system SHALL provide options to export data in PDF or Excel format

### Requirement 11: Therapist Management

**User Story:** As an administrator, I want to add, edit, and manage therapist profiles and schedules, so that the booking system reflects accurate availability.

#### Acceptance Criteria

1. WHEN an admin adds a new therapist THEN the system SHALL require fields: name, email, specialization, qualification, working days, and sessions per day
2. WHEN a therapist is added THEN the system SHALL generate a unique therapist ID and create staff credentials
3. WHEN an admin edits a therapist's schedule THEN the system SHALL update working days and sessions per day
4. WHEN a therapist's availability is changed THEN the system SHALL reflect changes in the booking interface immediately
5. WHEN an admin deactivates a therapist THEN the system SHALL prevent new bookings but preserve existing appointments

### Requirement 12: Search and Patient Management

**User Story:** As a receptionist, I want to search for existing patients and update their information, so that records remain accurate and up-to-date.

#### Acceptance Criteria

1. WHEN a receptionist enters a search query THEN the system SHALL search by Special ID, child name, parent name, or phone number
2. WHEN search results are displayed THEN the system SHALL show matching patients with key information
3. WHEN a receptionist clicks on a patient THEN the system SHALL display the complete patient profile
4. WHEN a receptionist updates patient information THEN the system SHALL validate changes and save with a timestamp
5. WHEN a receptionist deactivates a patient account THEN the system SHALL prevent new bookings but preserve historical data

### Requirement 13: Notification System

**User Story:** As a parent, I want to receive notifications about booking confirmations, session reminders, and assessment completions, so that I stay informed about my child's therapy schedule.

#### Acceptance Criteria

1. WHEN a booking is confirmed THEN the system SHALL send an SMS and email notification to the parent
2. WHEN a session is scheduled for the next day THEN the system SHALL send a reminder notification 24 hours before
3. WHEN session notes are completed THEN the system SHALL send a notification to the parent
4. WHEN an assessment is completed THEN the system SHALL send an email with the PDF report attached
5. WHEN a booking is cancelled THEN the system SHALL send a cancellation notification to the parent

### Requirement 14: Responsive UI Design

**User Story:** As a user, I want the application to work seamlessly on both desktop and mobile devices, so that I can access it from any device.

#### Acceptance Criteria

1. WHEN the application is accessed on desktop THEN the system SHALL display the full two-panel layout with left sidebar and main content
2. WHEN the application is accessed on mobile THEN the system SHALL display a single-column responsive layout
3. WHEN the application is accessed on tablet THEN the system SHALL adapt the layout for optimal viewing
4. WHEN any interactive element is displayed THEN the system SHALL ensure touch-friendly sizing (minimum 44x44px)
5. WHEN forms are displayed on mobile THEN the system SHALL use appropriate input types for better keyboard experience

### Requirement 15: Data Security and Privacy

**User Story:** As a system administrator, I want patient data to be secure and access-controlled, so that privacy regulations are met and data is protected.

#### Acceptance Criteria

1. WHEN a user authenticates THEN the system SHALL use JWT tokens with appropriate expiration times
2. WHEN passwords are stored THEN the system SHALL hash them using bcrypt with appropriate salt rounds
3. WHEN API requests are made THEN the system SHALL validate JWT tokens and verify user permissions
4. WHEN sensitive data is transmitted THEN the system SHALL use HTTPS encryption
5. WHEN a user accesses data THEN the system SHALL enforce role-based access control (parents see only their child's data, therapists see assigned patients, admins see all data)
6. WHEN OTPs are stored THEN the system SHALL use TTL indexes to automatically delete expired OTPs

### Requirement 16: Report Generation

**User Story:** As an administrator, I want to generate various reports about system usage and patient progress, so that I can analyze trends and make data-driven decisions.

#### Acceptance Criteria

1. WHEN an admin requests a report THEN the system SHALL provide options: patient list, session summary, therapist utilization, monthly statistics
2. WHEN a report is generated THEN the system SHALL allow export in PDF or Excel format
3. WHEN a patient report is generated THEN the system SHALL include session history, assessment summaries, and progress indicators
4. WHEN a therapist utilization report is generated THEN the system SHALL show sessions conducted, available slots, and utilization percentage
5. WHEN a monthly statistics report is generated THEN the system SHALL include total bookings, completed sessions, cancellations, and no-shows

### Requirement 17: System Performance and Scalability

**User Story:** As a system administrator, I want the application to perform efficiently under normal load, so that users have a smooth experience.

#### Acceptance Criteria

1. WHEN a page loads THEN the system SHALL display content within 2 seconds on standard broadband connection
2. WHEN database queries are executed THEN the system SHALL use appropriate indexes on frequently queried fields (specialId, phone, date)
3. WHEN multiple users book simultaneously THEN the system SHALL handle concurrent requests without double-booking
4. WHEN file uploads occur THEN the system SHALL compress images to optimize storage and loading times
5. WHEN the system reaches 80% of free tier limits THEN the system SHALL log warnings for administrator review
