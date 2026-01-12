# Software Design Document (SDD)
## Therapy Unit Booking System

**Version:** 1.0
**Date:** January 2025
**Team:** Maanas, Nalin, Karthik, Aishwarya

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Application Architecture](#3-application-architecture)
4. [Module Design](#4-module-design)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [GUI Design](#7-gui-design)
8. [Technology Stack](#8-technology-stack)
9. [Security Design](#9-security-design)
10. [Design Constraints](#10-design-constraints)

---

## 1. Introduction

### 1.1 Purpose

This Software Design Document (SDD) describes HOW the Therapy Unit Booking System will be built. It covers the system architecture, module design, database schema, API specifications, and security implementation.

### 1.2 Scope

This document provides the technical blueprint for implementing the requirements defined in the SRS document. It serves as a guide for developers during implementation.

### 1.3 Design Goals

- **Modularity:** Separation of concerns between components
- **Scalability:** Ability to handle increased load
- **Maintainability:** Easy to update and extend
- **Security:** Protection of sensitive patient data
- **Performance:** Fast response times

---

## 2. System Architecture

### 2.1 Architecture Overview

The system follows a **Client-Server Architecture** with a **Three-Tier Design**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    PRESENTATION TIER                            │   │
│   │                    (Frontend - Vercel)                          │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  React.js Application                                           │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │  Pages   │  │Components│  │  Context │  │ Services │        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │ HTTPS / REST API                     │
│                                  ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    APPLICATION TIER                             │   │
│   │                    (Backend - Render)                           │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  Node.js + Express.js Server                                    │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │  Routes  │  │Controller│  │ Services │  │Middleware│        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │ Mongoose ODM                         │
│                                  ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      DATA TIER                                  │   │
│   │                    (MongoDB Atlas)                              │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│   │  │ Patients │  │ Bookings │  │ Sessions │  │  Staff   │        │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 System Block Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              BLOCK DIAGRAM                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│    ┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐   │
│    │  Parent    │     │ Therapist  │     │Receptionist│     │   Admin    │   │
│    │  (Web)     │     │   (Web)    │     │   (Web)    │     │   (Web)    │   │
│    └─────┬──────┘     └─────┬──────┘     └─────┬──────┘     └─────┬──────┘   │
│          │                  │                  │                  │          │
│          └──────────────────┴──────────────────┴──────────────────┘          │
│                                     │                                         │
│                                     ▼                                         │
│                    ┌────────────────────────────────┐                        │
│                    │      REACT FRONTEND            │                        │
│                    │   (Single Page Application)    │                        │
│                    └───────────────┬────────────────┘                        │
│                                    │                                          │
│                                    ▼                                          │
│                    ┌────────────────────────────────┐                        │
│                    │        API GATEWAY             │                        │
│                    │  (Express.js + Middleware)     │                        │
│                    ├────────────────────────────────┤                        │
│                    │ • Authentication (JWT)         │                        │
│                    │ • Rate Limiting                │                        │
│                    │ • Input Validation             │                        │
│                    │ • Role-Based Access            │                        │
│                    └───────────────┬────────────────┘                        │
│                                    │                                          │
│          ┌─────────────────────────┼─────────────────────────┐               │
│          │                         │                         │               │
│          ▼                         ▼                         ▼               │
│   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐        │
│   │    AUTH     │           │   BOOKING   │           │   PATIENT   │        │
│   │   MODULE    │           │   MODULE    │           │   MODULE    │        │
│   └─────────────┘           └─────────────┘           └─────────────┘        │
│          │                         │                         │               │
│          └─────────────────────────┼─────────────────────────┘               │
│                                    │                                          │
│                                    ▼                                          │
│                    ┌────────────────────────────────┐                        │
│                    │       MONGODB DATABASE         │                        │
│                    │        (MongoDB Atlas)         │                        │
│                    └────────────────────────────────┘                        │
│                                    │                                          │
│          ┌─────────────────────────┼─────────────────────────┐               │
│          │                         │                         │               │
│          ▼                         ▼                         ▼               │
│   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐        │
│   │ MessageCent │           │  Cloudinary │           │   Gmail     │        │
│   │  (SMS OTP)  │           │   (Images)  │           │   (Email)   │        │
│   └─────────────┘           └─────────────┘           └─────────────┘        │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Application Architecture

### 3.1 Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   src/                                                                  │
│   ├── main.jsx                 # Application entry point                │
│   ├── App.jsx                  # Main application component             │
│   │                                                                     │
│   ├── context/                                                          │
│   │   └── AuthContext.jsx      # Global authentication state            │
│   │                                                                     │
│   ├── services/                                                         │
│   │   └── api.js               # Axios instance with interceptors       │
│   │                                                                     │
│   ├── components/                                                       │
│   │   ├── ProtectedRoute.jsx   # Route protection HOC                   │
│   │   ├── LoadingSpinner.jsx   # Loading indicator                      │
│   │   ├── ErrorBoundary.jsx    # Error handling wrapper                 │
│   │   └── FileUpload.jsx       # Image upload component                 │
│   │                                                                     │
│   └── pages/                                                            │
│       ├── auth/                # Login and OTP pages                    │
│       ├── parent/              # Parent dashboard pages                 │
│       ├── therapist/           # Therapist dashboard pages              │
│       ├── receptionist/        # Receptionist dashboard pages           │
│       └── admin/               # Admin dashboard pages                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Backend Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   backend/                                                              │
│   ├── server.js                # Main entry point                       │
│   │                                                                     │
│   ├── config/                                                           │
│   │   └── database.js          # MongoDB connection                     │
│   │                                                                     │
│   ├── models/                  # Mongoose schemas                       │
│   │   ├── Patient.js                                                    │
│   │   ├── Staff.js                                                      │
│   │   ├── Therapist.js                                                  │
│   │   ├── Booking.js                                                    │
│   │   ├── Session.js                                                    │
│   │   ├── Assessment.js                                                 │
│   │   ├── OTP.js                                                        │
│   │   └── Notification.js                                               │
│   │                                                                     │
│   ├── controllers/             # Business logic                         │
│   │   ├── authController.js                                             │
│   │   ├── patientController.js                                          │
│   │   ├── bookingController.js                                          │
│   │   ├── sessionController.js                                          │
│   │   ├── therapistController.js                                        │
│   │   └── adminController.js                                            │
│   │                                                                     │
│   ├── routes/                  # API endpoints                          │
│   │   ├── auth.routes.js                                                │
│   │   ├── patient.routes.js                                             │
│   │   ├── booking.routes.js                                             │
│   │   ├── session.routes.js                                             │
│   │   └── admin.routes.js                                               │
│   │                                                                     │
│   ├── middleware/              # Express middleware                     │
│   │   ├── auth.js              # JWT verification                       │
│   │   ├── roleCheck.js         # RBAC                                   │
│   │   ├── rateLimiter.js       # Rate limiting                          │
│   │   └── security.js          # Security headers                       │
│   │                                                                     │
│   ├── services/                # Business services                      │
│   │   ├── authService.js                                                │
│   │   ├── bookingService.js                                             │
│   │   └── notificationService.js                                        │
│   │                                                                     │
│   └── utils/                   # Utility functions                      │
│       ├── messagecentral.js    # SMS OTP                                │
│       ├── cloudinary.js        # Image upload                           │
│       └── email.js             # Email sending                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Module Design

### 4.1 Module Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MODULE OVERVIEW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    AUTHENTICATION MODULE                        │   │
│   │  Responsibility: User login, OTP verification, JWT management   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    PATIENT MODULE                               │   │
│   │  Responsibility: Patient CRUD, profile management               │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    BOOKING MODULE                               │   │
│   │  Responsibility: Slot management, booking CRUD, cancellation    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    SESSION MODULE                               │   │
│   │  Responsibility: Session lifecycle, notes, progress tracking    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    THERAPIST MODULE                             │   │
│   │  Responsibility: Schedule, availability, specializations        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    ADMIN MODULE                                 │   │
│   │  Responsibility: Staff management, analytics, system config     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Module Responsibilities

| Module | Responsibilities |
|--------|------------------|
| **Authentication** | OTP generation/verification, JWT creation, role validation, session management |
| **Patient** | Registration, profile updates, photo upload, search, deactivation |
| **Booking** | Slot availability check, booking creation, conflict prevention, cancellation |
| **Session** | Session creation from booking, note documentation, progress recording |
| **Therapist** | Schedule display, availability toggle, assessment creation |
| **Admin** | Staff CRUD, statistics aggregation, utilization reports |

### 4.3 Data Flow Diagram

```
                            BOOKING DATA FLOW
    ════════════════════════════════════════════════════════

    ┌──────────┐         ┌──────────┐         ┌──────────┐
    │  Parent  │         │ Frontend │         │  Backend │
    │          │         │  (React) │         │ (Express)│
    └────┬─────┘         └────┬─────┘         └────┬─────┘
         │                    │                    │
         │ 1. Select Slot     │                    │
         │ ─────────────────► │                    │
         │                    │                    │
         │                    │ 2. Check Available │
         │                    │ ─────────────────► │
         │                    │                    │
         │                    │ 3. Available Slots │
         │                    │ ◄───────────────── │
         │                    │                    │
         │ 4. Display Slots   │                    │
         │ ◄───────────────── │                    │
         │                    │                    │
         │ 5. Confirm Booking │                    │
         │ ─────────────────► │                    │
         │                    │                    │
         │                    │ 6. Create Booking  │
         │                    │ ─────────────────► │
         │                    │                    │
         │                    │                    │ 7. Validate
         │                    │                    │ ───────────►
         │                    │                    │             │
         │                    │                    │ ◄───────────
         │                    │                    │ 8. Save to DB
         │                    │                    │
         │                    │ 9. Booking Confirmed│
         │                    │ ◄───────────────── │
         │                    │                    │
         │ 10. Show Success   │                    │
         │ ◄───────────────── │                    │
         │                    │                    │
```

---

## 5. Database Design

### 5.1 Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ER DIAGRAM                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                                  ┌─────────────┐                                │
│                                  │    STAFF    │                                │
│                                  ├─────────────┤                                │
│                                  │ _id (PK)    │                                │
│                                  │ staffId     │                                │
│                                  │ name        │                                │
│                                  │ email       │                                │
│                                  │ password    │                                │
│                                  │ role        │                                │
│                                  │ phone       │                                │
│                                  │ isActive    │                                │
│                                  └──────┬──────┘                                │
│                                         │ 1                                     │
│                                         │                                       │
│                                         │                                       │
│                                         │ 1                                     │
│                                  ┌──────┴──────┐                                │
│                                  │  THERAPIST  │                                │
│                                  ├─────────────┤                                │
│                                  │ _id (PK)    │                                │
│                                  │ therapistId │                                │
│                                  │ staffId (FK)│◄──────────────────────┐        │
│                                  │ specializa- │                       │        │
│                                  │   tion[]    │                       │        │
│                                  │ workingDays │                       │        │
│                                  │ isAvailable │                       │        │
│                                  └──────┬──────┘                       │        │
│                                         │ 1                            │        │
│                                         │                              │        │
│                                         │ *                            │        │
│   ┌─────────────┐                ┌──────┴──────┐                ┌──────┴──────┐ │
│   │   PATIENT   │                │   BOOKING   │                │ ASSESSMENT  │ │
│   ├─────────────┤                ├─────────────┤                ├─────────────┤ │
│   │ _id (PK)    │                │ _id (PK)    │                │ _id (PK)    │ │
│   │ specialId   │◄─────1────────*│ specialId   │                │ assessmentId│ │
│   │ childName   │                │ bookingId   │                │ specialId   │ │
│   │ dateOfBirth │                │ therapistId │                │ therapistId │ │
│   │ parentName  │                │ therapyType │                │ assessment- │ │
│   │ parentPhone │                │ date        │                │   Date      │ │
│   │ diagnosis[] │                │ timeSlot    │                │ assessment- │ │
│   │ severity    │                │ status      │                │   Data      │ │
│   │ registeredBy│                │ bookedAt    │                │ status      │ │
│   └──────┬──────┘                └──────┬──────┘                └─────────────┘ │
│          │                              │                                       │
│          │ 1                            │ 1                                     │
│          │                              │                                       │
│          │ *                            │ 1                                     │
│   ┌──────┴──────┐                ┌──────┴──────┐                               │
│   │     OTP     │                │   SESSION   │                               │
│   ├─────────────┤                ├─────────────┤                               │
│   │ _id (PK)    │                │ _id (PK)    │                               │
│   │ specialId   │                │ sessionId   │                               │
│   │ phoneNumber │                │ bookingId   │                               │
│   │ otp         │                │ specialId   │                               │
│   │ expiresAt   │                │ therapistId │                               │
│   │ attempts    │                │ sessionDate │                               │
│   │ verified    │                │ activities  │                               │
│   └─────────────┘                │ progress    │                               │
│                                  │ observations│                               │
│                                  │ recommend-  │                               │
│                                  │   ations    │                               │
│                                  └─────────────┘                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Database Schema Details

#### Patient Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| specialId | String | Unique ID (MEC + 10 digits) |
| childName | String | Child's full name |
| dateOfBirth | Date | Date of birth |
| age | Number | Calculated age |
| gender | Enum | Male/Female/Other |
| photoUrl | String | Profile photo URL |
| parentName | String | Parent's name |
| parentPhone | String | Phone number (10 digits) |
| parentEmail | String | Email address |
| diagnosis | Array | [ASD, SLD, ID, CP] |
| severity | Enum | Mild/Moderate/Severe |
| presentingProblems | String | Issues description |
| medicalHistory | String | Medical background |
| registeredBy | ObjectId | Staff reference |
| isActive | Boolean | Active status |

#### Booking Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| bookingId | String | Unique ID (BK + date + seq) |
| specialId | String | Patient reference |
| therapistId | ObjectId | Therapist reference |
| therapyType | Enum | Psychology/OT/PT/Speech/EI |
| date | Date | Booking date |
| timeSlot | String | Time slot (e.g., "9:00 AM - 10:00 AM") |
| status | Enum | confirmed/completed/cancelled/no-show |
| bookedAt | Date | Booking timestamp |
| cancelledAt | Date | Cancellation timestamp |
| cancellationReason | String | Reason for cancellation |

#### Session Collection

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| sessionId | String | Unique session ID |
| bookingId | ObjectId | Booking reference |
| specialId | String | Patient reference |
| therapistId | ObjectId | Therapist reference |
| sessionDate | Date | Session date |
| startTime | Date | Session start time |
| endTime | Date | Session end time |
| activitiesConducted | String | Activities description |
| goalsAddressed | String | Goals worked on |
| progressLevel | Enum | Excellent/Good/Satisfactory/Needs Improvement |
| behavioralObservations | String | Observations |
| recommendationsForParents | String | Parent recommendations |
| nextSessionFocus | String | Next session plan |
| completedAt | Date | Completion timestamp |

### 5.3 Indexes

| Collection | Index | Purpose |
|------------|-------|---------|
| Patient | { specialId: 1 } unique | Fast patient lookup |
| Patient | { parentPhone: 1 } | Phone search |
| Booking | { specialId: 1, date: 1, timeSlot: 1 } unique | Prevent patient double booking |
| Booking | { therapyType: 1, date: 1, timeSlot: 1 } unique | Prevent slot double booking |
| Booking | { therapistId: 1, date: 1, timeSlot: 1 } sparse unique | Prevent therapist double booking |
| OTP | { expiresAt: 1 } TTL | Auto-delete expired OTPs |

---

## 6. API Design

### 6.1 API Overview

| API Group | Base Path | Purpose |
|-----------|-----------|---------|
| Authentication | /api/auth | Login, OTP, token validation |
| Patients | /api/patients | Patient CRUD |
| Bookings | /api/bookings | Booking management |
| Sessions | /api/sessions | Session documentation |
| Therapists | /api/therapists | Therapist management |
| Admin | /api/admin | Administrative functions |

### 6.2 Key API Endpoints

#### Authentication APIs

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | /api/auth/parent/send-otp | Send OTP to parent | { specialId, phoneNumber } | { success, message } |
| POST | /api/auth/parent/verify-otp | Verify OTP and login | { specialId, otp } | { token, user } |
| POST | /api/auth/staff/login | Staff login | { email, password } | { token, user } |
| GET | /api/auth/validate | Validate JWT token | Header: Authorization | { valid, user } |

#### Booking APIs

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | /api/bookings/available-slots | Get available slots | Query: date, therapyType | { slots: [...] } |
| POST | /api/bookings | Create booking | { specialId, therapyType, date, timeSlot } | { booking } |
| GET | /api/bookings/my-bookings | Get user's bookings | Header: Authorization | { bookings: [...] } |
| PUT | /api/bookings/:id/cancel | Cancel booking | { reason } | { success } |

#### Session APIs

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | /api/sessions/today | Today's sessions | Header: Authorization | { sessions: [...] } |
| POST | /api/sessions/:id/start | Start session | - | { session } |
| POST | /api/sessions/:id/complete | Complete session | { notes, progress } | { session } |

#### Admin APIs

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | /api/admin/stats | System statistics | - | { stats } |
| GET | /api/admin/utilization | Therapist utilization | - | { utilization } |
| POST | /api/admin/staff | Create staff | { name, email, password, role } | { staff } |

---

## 7. GUI Design

### 7.1 Screen Layouts

#### Parent Dashboard
```
┌─────────────────────────────────────────────────────────────────────────┐
│  LOGO                                    Welcome, Parent Name  [Logout] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Child Name  │  │  Upcoming   │  │   Total     │  │   Last      │    │
│  │    [Photo]  │  │   Sessions  │  │   Sessions  │  │  Session    │    │
│  │             │  │      2      │  │     15      │  │  12 Jan     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  [Book New Session]           [View History]          [Profile]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    UPCOMING SESSIONS                             │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │  Date         Time            Therapy Type        Status         │  │
│  │  15 Jan       10:00 AM        OT                  Confirmed      │  │
│  │  18 Jan       2:00 PM         Speech              Confirmed      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Booking Screen
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ◄ Back                        BOOK SESSION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Step 1: Select Therapy Type                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [Psychology]  [OT]  [PT]  [Speech]  [EI]                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Step 2: Select Date                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │       January 2025                                               │   │
│  │  Mo  Tu  We  Th  Fr  Sa  Su                                     │   │
│  │              1   2   3   4   5                                   │   │
│  │   6   7   8   9  10  11  12                                     │   │
│  │  13  14 [15] 16  17  18  19                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Step 3: Select Time Slot                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [9:00 AM]  [10:00 AM]  [11:00 AM]  [12:00 PM]                  │   │
│  │  [2:00 PM]  [3:00 PM]   [4:00 PM]                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     [CONFIRM BOOKING]                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Therapist Dashboard
```
┌─────────────────────────────────────────────────────────────────────────┐
│  LOGO                                 Welcome, Dr. Name      [Logout]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │ Today's        │  │ Pending        │  │ Completed      │            │
│  │ Sessions       │  │ Notes          │  │ This Month     │            │
│  │     5          │  │     2          │  │     28         │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                         │
│  TODAY'S SCHEDULE - 15 January 2025                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Time        Patient         Type      Status     Action          │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ 9:00 AM     Rahul K.        OT        Waiting    [Start]         │  │
│  │ 10:00 AM    Priya S.        OT        Scheduled  -               │  │
│  │ 11:00 AM    Arjun M.        OT        Scheduled  -               │  │
│  │ 2:00 PM     Sara T.         OT        Scheduled  -               │  │
│  │ 3:00 PM     Vikram R.       OT        Scheduled  -               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Technology Stack

### 8.1 Complete Stack Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FRONTEND                                                              │
│   ├── React 18             - UI Library                                 │
│   ├── Vite                 - Build Tool                                 │
│   ├── Tailwind CSS         - Styling                                    │
│   ├── React Router DOM     - Routing                                    │
│   ├── Axios                - HTTP Client                                │
│   ├── React Hook Form      - Form Handling                              │
│   ├── React Toastify       - Notifications                              │
│   ├── Lucide React         - Icons                                      │
│   └── React Datepicker     - Date Selection                             │
│                                                                         │
│   BACKEND                                                               │
│   ├── Node.js              - Runtime                                    │
│   ├── Express.js           - Web Framework                              │
│   ├── Mongoose             - MongoDB ODM                                │
│   ├── JWT                  - Authentication                             │
│   ├── bcryptjs             - Password Hashing                           │
│   ├── Helmet               - Security Headers                           │
│   ├── express-validator    - Input Validation                           │
│   ├── express-rate-limit   - Rate Limiting                              │
│   ├── Multer               - File Upload                                │
│   └── node-cron            - Scheduling                                 │
│                                                                         │
│   DATABASE                                                              │
│   └── MongoDB Atlas        - Cloud Database                             │
│                                                                         │
│   EXTERNAL SERVICES                                                     │
│   ├── MessageCentral       - SMS OTP                                    │
│   ├── Cloudinary           - Image Storage                              │
│   ├── Gmail SMTP           - Email                                      │
│   └── PDFKit               - PDF Generation                             │
│                                                                         │
│   DEPLOYMENT                                                            │
│   ├── Vercel               - Frontend Hosting                           │
│   ├── Render               - Backend Hosting                            │
│   └── GitHub               - Version Control                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Security Design

### 9.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   PARENT LOGIN (OTP-Based)                                              │
│   ─────────────────────────                                             │
│                                                                         │
│   1. Parent enters Special ID + Phone                                   │
│   2. System validates patient exists                                    │
│   3. Generate 6-digit OTP                                               │
│   4. Store OTP with 5-min expiry (TTL index)                           │
│   5. Send OTP via SMS (MessageCentral)                                  │
│   6. Parent enters OTP                                                  │
│   7. Verify OTP (max 3 attempts)                                        │
│   8. Issue JWT token (7-day expiry)                                     │
│   9. Return token + user info                                           │
│                                                                         │
│   STAFF LOGIN (Password-Based)                                          │
│   ────────────────────────────                                          │
│                                                                         │
│   1. Staff enters email + password                                      │
│   2. Find staff by email                                                │
│   3. Compare password with bcrypt hash                                  │
│   4. Issue JWT token with role                                          │
│   5. Return token + user info                                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Transport | HTTPS | Enforced in production |
| Authentication | JWT | 7-day expiry, signed tokens |
| Password | Hashing | bcrypt with 10 salt rounds |
| Input | Validation | express-validator on all routes |
| Rate Limiting | Request limits | 100 requests/hour per IP |
| Headers | Security headers | Helmet.js middleware |
| CORS | Origin restriction | Whitelist frontend domain |
| OTP | Time-based | 5-minute expiry, 3 attempts max |

### 9.3 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ROLE PERMISSIONS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   PARENT                                                                │
│   ├── View own child's profile                                          │
│   ├── Book sessions (own child only)                                    │
│   ├── View session history (own child only)                             │
│   └── Cancel bookings (own bookings, 24hr notice)                       │
│                                                                         │
│   RECEPTIONIST                                                          │
│   ├── Register patients                                                 │
│   ├── Search/view patients                                              │
│   ├── Create bookings for any patient                                   │
│   ├── View all bookings                                                 │
│   └── Cancel any booking                                                │
│                                                                         │
│   THERAPIST                                                             │
│   ├── View own schedule                                                 │
│   ├── View patient details                                              │
│   ├── Document session notes                                            │
│   ├── Create/update assessments                                         │
│   └── View session history                                              │
│                                                                         │
│   ADMIN                                                                 │
│   ├── All receptionist permissions                                      │
│   ├── Manage staff (CRUD)                                               │
│   ├── View analytics/statistics                                         │
│   ├── Configure system settings                                         │
│   └── Deactivate patients                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Design Constraints

### 10.1 Technical Constraints

- Must use JavaScript/TypeScript across the stack
- MongoDB as the only database (NoSQL)
- RESTful API architecture
- Single-page application (SPA) frontend

### 10.2 Design Assumptions

1. Users access the system via modern web browsers
2. Stable internet connectivity is available
3. SMS gateway (MessageCentral) is accessible
4. MongoDB Atlas has sufficient capacity

### 10.3 Scalability Considerations

- Stateless backend enables horizontal scaling
- MongoDB Atlas supports auto-scaling
- Cloudinary handles image storage scaling
- CDN deployment for static assets

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Lead | Maanas | | |
| Frontend Dev | Nalin | | |
| Backend Dev | Karthik | | |
| UI/UX & Testing | Aishwarya | | |

---

*End of SDD Document*
