# Software Requirements Specification (SRS)
## Therapy Unit Booking System

**Version:** 1.0
**Date:** January 2025
**Team:** Maanas, Nalin, Karthik, Aishwarya

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Design and Implementation Constraints](#6-design-and-implementation-constraints)
7. [Assumptions and Dependencies](#7-assumptions-and-dependencies)
8. [Acceptance Criteria](#8-acceptance-criteria)

---

## 1. Introduction

### 1.1 Purpose

The purpose of this Software Requirements Specification (SRS) document is to provide a detailed description of the requirements for the **Therapy Unit Booking System**. This document will cover the functional and non-functional requirements, external interfaces, constraints, and acceptance criteria for the system.

### 1.2 Scope

The Therapy Unit Booking System is a web-based application designed to manage therapy sessions for children with special needs at Marian Engineering College's Therapy Unit. The system will:

- Enable parents to book therapy sessions online
- Allow therapists to manage their schedules and document sessions
- Provide receptionists with patient registration and booking management tools
- Offer administrators oversight through dashboards and analytics

### 1.3 Intended Users

| User Role | Description |
|-----------|-------------|
| **Parents** | Parents/guardians of children registered at the therapy unit |
| **Therapists** | Licensed therapy professionals providing treatment |
| **Receptionists** | Front desk staff handling registrations and bookings |
| **Administrators** | Management personnel overseeing operations |

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| ASD | Autism Spectrum Disorder |
| SLD | Specific Learning Disability |
| ID | Intellectual Disability |
| CP | Cerebral Palsy |
| OT | Occupational Therapy |
| PT | Physical Therapy |
| EI | Early Intervention |
| OTP | One-Time Password |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| Special ID | Unique patient identifier (MEC + 10 digits) |

---

## 2. Overall Description

### 2.1 Problem Being Solved

The current manual system for managing therapy sessions faces the following challenges:

1. **Scheduling conflicts** due to lack of real-time availability
2. **Paper-based records** prone to loss and difficult to search
3. **Communication gaps** between parents and therapy staff
4. **No progress tracking** system for patient sessions
5. **Administrative burden** from manual data entry

### 2.2 Product Perspective

The system is a standalone web application with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM CONTEXT                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌──────────┐     ┌──────────────┐     ┌──────────┐      │
│    │  Users   │────►│   Web App    │────►│ Database │      │
│    │(Browser) │◄────│  (Frontend   │◄────│(MongoDB) │      │
│    └──────────┘     │  + Backend)  │     └──────────┘      │
│                     └──────┬───────┘                        │
│                            │                                │
│              ┌─────────────┼─────────────┐                  │
│              ▼             ▼             ▼                  │
│         ┌────────┐   ┌──────────┐   ┌──────────┐           │
│         │  SMS   │   │  Email   │   │  Cloud   │           │
│         │Gateway │   │  Server  │   │ Storage  │           │
│         └────────┘   └──────────┘   └──────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Main Features

1. **Multi-Role Authentication System**
2. **Patient Registration and Management**
3. **Therapy Session Booking**
4. **Session Documentation**
5. **Therapist Schedule Management**
6. **Administrative Dashboard**
7. **Assessment Management**

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 Authentication Module

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | The system shall allow parents to login using their Special ID and phone number |
| FR-AUTH-02 | The system shall send a 6-digit OTP to the registered phone number |
| FR-AUTH-03 | The system shall verify OTP within a 5-minute validity period |
| FR-AUTH-04 | The system shall limit OTP verification attempts to 3 per OTP |
| FR-AUTH-05 | The system shall allow staff to login using email and password |
| FR-AUTH-06 | The system shall issue JWT tokens upon successful authentication |
| FR-AUTH-07 | The system shall enforce role-based access to protected routes |
| FR-AUTH-08 | The system shall allow users to logout and invalidate sessions |

#### 3.1.2 Patient Management Module

| ID | Requirement |
|----|-------------|
| FR-PAT-01 | The system shall allow receptionists to register new patients |
| FR-PAT-02 | The system shall generate a unique Special ID (MEC + 10 digits) for each patient |
| FR-PAT-03 | The system shall store patient information including name, DOB, diagnosis, and medical history |
| FR-PAT-04 | The system shall allow photo upload for patient profiles |
| FR-PAT-05 | The system shall support multiple diagnosis types (ASD, SLD, ID, CP) |
| FR-PAT-06 | The system shall allow searching patients by name, phone, or Special ID |
| FR-PAT-07 | The system shall allow updating patient information |
| FR-PAT-08 | The system shall support patient deactivation (soft delete) |

#### 3.1.3 Booking Module

| ID | Requirement |
|----|-------------|
| FR-BOOK-01 | The system shall display available time slots for each therapy type |
| FR-BOOK-02 | The system shall allow parents to book sessions up to 30 days in advance |
| FR-BOOK-03 | The system shall enforce a maximum of 2 sessions per therapy type per month |
| FR-BOOK-04 | The system shall prevent double booking of the same slot |
| FR-BOOK-05 | The system shall generate unique booking IDs (BK + date + sequence) |
| FR-BOOK-06 | The system shall allow booking cancellation with reason |
| FR-BOOK-07 | The system shall enforce 24-hour cancellation notice for parents |
| FR-BOOK-08 | The system shall display booking history for patients |

#### 3.1.4 Session Management Module

| ID | Requirement |
|----|-------------|
| FR-SES-01 | The system shall create session records from confirmed bookings |
| FR-SES-02 | The system shall allow therapists to start sessions |
| FR-SES-03 | The system shall allow therapists to document session notes |
| FR-SES-04 | The system shall capture activities conducted, goals addressed, and observations |
| FR-SES-05 | The system shall record progress levels (Excellent/Good/Satisfactory/Needs Improvement) |
| FR-SES-06 | The system shall store recommendations for parents and next session focus |
| FR-SES-07 | The system shall maintain session history per patient |

#### 3.1.5 Therapist Module

| ID | Requirement |
|----|-------------|
| FR-THER-01 | The system shall display daily schedule for therapists |
| FR-THER-02 | The system shall allow therapists to view patient details |
| FR-THER-03 | The system shall allow therapists to create assessments |
| FR-THER-04 | The system shall support therapist availability configuration |
| FR-THER-05 | The system shall map therapists to their specializations |

#### 3.1.6 Administrative Module

| ID | Requirement |
|----|-------------|
| FR-ADM-01 | The system shall display dashboard with key statistics |
| FR-ADM-02 | The system shall allow CRUD operations on staff members |
| FR-ADM-03 | The system shall display therapist utilization metrics |
| FR-ADM-04 | The system shall show booking trends and analytics |
| FR-ADM-05 | The system shall display therapy type distribution |

---

### 3.2 Use Case Diagram

```
                              ┌─────────────────────────┐
                              │   THERAPY BOOKING       │
                              │       SYSTEM            │
                              └─────────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
        ▼                                 ▼                                 ▼
┌───────────────┐               ┌───────────────┐               ┌───────────────┐
│    PARENT     │               │   THERAPIST   │               │ RECEPTIONIST  │
└───────┬───────┘               └───────┬───────┘               └───────┬───────┘
        │                               │                               │
        ├── Login (OTP)                 ├── Login (Email)               ├── Login (Email)
        ├── View Dashboard              ├── View Schedule               ├── Register Patient
        ├── Book Session                ├── Start Session               ├── Search Patient
        ├── View Bookings               ├── Complete Session            ├── View Patient
        ├── Cancel Booking              ├── Add Session Notes           ├── Create Booking
        ├── View Session History        ├── Create Assessment           ├── Manage Bookings
        └── View Progress               └── View Patient History        └── View Bookings
                                                │
                                                │
                                        ┌───────┴───────┐
                                        │     ADMIN     │
                                        └───────┬───────┘
                                                │
                                                ├── Login (Email)
                                                ├── View Dashboard
                                                ├── Manage Staff
                                                ├── View Analytics
                                                ├── View Utilization
                                                └── All Receptionist Functions
```

---

## 4. External Interface Requirements

### 4.1 User Interface

| Screen | Description |
|--------|-------------|
| Login Page | Role-based login options (Parent OTP / Staff Email) |
| Parent Dashboard | Booking interface, session history, child's progress |
| Therapist Dashboard | Daily schedule, session management, assessments |
| Receptionist Dashboard | Patient registration, search, booking management |
| Admin Dashboard | Statistics, staff management, analytics |

### 4.2 Hardware Interfaces

- Standard web browsers (Chrome, Firefox, Safari, Edge)
- Mobile devices (responsive design)
- Internet connectivity

### 4.3 Software Interfaces

| Interface | Description |
|-----------|-------------|
| MongoDB Atlas | Cloud database for data persistence |
| MessageCentral API | SMS gateway for OTP delivery |
| Cloudinary | Image storage and management |
| Gmail SMTP | Email notifications |

### 4.4 Communication Interfaces

- HTTPS for secure data transmission
- REST API for client-server communication
- JSON for data interchange

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | The system shall load pages within 3 seconds |
| NFR-PERF-02 | The system shall handle concurrent users without degradation |
| NFR-PERF-03 | API responses shall complete within 500ms for standard operations |
| NFR-PERF-04 | The system shall support 100 concurrent users |

### 5.2 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | The system shall encrypt passwords using bcrypt |
| NFR-SEC-02 | The system shall use JWT for session management |
| NFR-SEC-03 | The system shall enforce HTTPS for all communications |
| NFR-SEC-04 | The system shall implement rate limiting (100 requests/hour) |
| NFR-SEC-05 | The system shall validate all user inputs |
| NFR-SEC-06 | The system shall implement CORS restrictions |
| NFR-SEC-07 | The system shall set secure HTTP headers (Helmet.js) |

### 5.3 Usability Requirements

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | The system shall be accessible on mobile devices |
| NFR-USE-02 | The system shall provide clear error messages |
| NFR-USE-03 | The system shall have intuitive navigation |
| NFR-USE-04 | The system shall support standard accessibility guidelines |

### 5.4 Reliability Requirements

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | The system shall maintain 99% uptime |
| NFR-REL-02 | The system shall handle errors gracefully |
| NFR-REL-03 | The system shall prevent data loss during failures |
| NFR-REL-04 | The system shall automatically recover from temporary failures |

---

## 6. Design and Implementation Constraints

### 6.1 Technology Constraints

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express.js
- Database: MongoDB (NoSQL)
- Deployment: Render (backend), Vercel (frontend)

### 6.2 Regulatory Constraints

- Must comply with data privacy regulations
- Patient data must be handled with confidentiality
- Access to medical information must be role-restricted

### 6.3 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 7. Assumptions and Dependencies

### 7.1 Assumptions

1. Users have access to internet-connected devices
2. Parents have registered mobile phones for OTP
3. Staff have valid email addresses
4. The therapy unit operates during standard business hours (9 AM - 5 PM)

### 7.2 Dependencies

| Dependency | Purpose |
|------------|---------|
| MongoDB Atlas | Database hosting |
| MessageCentral | SMS/OTP delivery |
| Cloudinary | Image storage |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## 8. Acceptance Criteria

### 8.1 Functional Acceptance Criteria

| ID | Criteria |
|----|----------|
| AC-01 | Parent can successfully login using OTP |
| AC-02 | Staff can login with email and password |
| AC-03 | Patient registration creates unique Special ID |
| AC-04 | Booking prevents double-booking of slots |
| AC-05 | Session notes are saved and retrievable |
| AC-06 | Admin dashboard displays accurate statistics |

### 8.2 Non-Functional Acceptance Criteria

| ID | Criteria |
|----|----------|
| AC-07 | Page load time < 3 seconds |
| AC-08 | System accessible on mobile devices |
| AC-09 | All API endpoints are authenticated |
| AC-10 | No security vulnerabilities in OWASP Top 10 |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Lead | Maanas | | |
| Frontend Dev | Nalin | | |
| Backend Dev | Karthik | | |
| UI/UX & Testing | Aishwarya | | |

---

*End of SRS Document*
