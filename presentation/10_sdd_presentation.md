# Software Design Document (SDD)
## Presentation Slides

---

## What is SDD?

> **SDD explains HOW the system will be built, not WHAT it does**

```
┌─────────────────────────────────────────────────────────────┐
│                      SDD COVERS                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✓ System Architecture                                    │
│   ✓ Database Design (ER Diagram)                           │
│   ✓ API Design                                             │
│   ✓ Module Responsibilities                                │
│   ✓ Technology Stack                                       │
│   ✓ Security Measures                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                         │
│                React.js + Tailwind CSS                      │
│                    (Hosted on Vercel)                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                          │
│                Node.js + Express.js                         │
│                   (Hosted on Render)                        │
├─────────────────────────────────────────────────────────────┤
│   JWT Auth │ RBAC │ Rate Limiting │ Input Validation       │
└───────────────────────────┬─────────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                              │
│                    MongoDB Atlas                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Block Diagram

```
    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ Parent  │  │Therapist│  │Recept.  │  │ Admin   │
    └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
         └────────────┴────────────┴────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    REACT FRONTEND     │
              │  (Single Page App)    │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     API GATEWAY       │
              │  Express.js + JWT     │
              └───────────┬───────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │  AUTH   │      │ BOOKING │      │ PATIENT │
    │ MODULE  │      │ MODULE  │      │ MODULE  │
    └─────────┘      └─────────┘      └─────────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │      MONGODB          │
              └───────────────────────┘
```

---

## 3. Database Design - ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ER DIAGRAM                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                        ┌─────────────┐                                  │
│                        │    STAFF    │                                  │
│                        ├─────────────┤                                  │
│                        │ staffId PK  │                                  │
│                        │ name        │                                  │
│                        │ email       │                                  │
│                        │ role        │                                  │
│                        └──────┬──────┘                                  │
│                               │ 1:1                                     │
│                               ▼                                         │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐           │
│  │   PATIENT   │       │  THERAPIST  │       │ ASSESSMENT  │           │
│  ├─────────────┤       ├─────────────┤       ├─────────────┤           │
│  │ specialId PK│◄──────│ therapistId │───────│ therapistId │           │
│  │ childName   │       │ staffId FK  │       │ specialId   │           │
│  │ parentPhone │       │specialization│      │ assessData  │           │
│  │ diagnosis[] │       │ workingDays │       └─────────────┘           │
│  └──────┬──────┘       └──────┬──────┘                                  │
│         │ 1:N                 │ 1:N                                     │
│         ▼                     ▼                                         │
│  ┌─────────────┐       ┌─────────────┐                                  │
│  │   BOOKING   │◄──────│   SESSION   │                                  │
│  ├─────────────┤       ├─────────────┤                                  │
│  │ bookingId PK│       │ sessionId PK│                                  │
│  │ specialId FK│       │ bookingId FK│                                  │
│  │ therapyType │       │ notes       │                                  │
│  │ date        │       │ progress    │                                  │
│  │ timeSlot    │       │ observations│                                  │
│  │ status      │       └─────────────┘                                  │
│  └─────────────┘                                                        │
│         ▲                                                               │
│         │ 1:N                                                           │
│  ┌──────┴──────┐                                                        │
│  │     OTP     │                                                        │
│  ├─────────────┤                                                        │
│  │ specialId   │                                                        │
│  │ otp         │                                                        │
│  │ expiresAt   │                                                        │
│  └─────────────┘                                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Database Tables

### Patient Collection
| Field | Type | Purpose |
|-------|------|---------|
| specialId | String | Unique ID (MEC + 10 digits) |
| childName | String | Child's name |
| parentPhone | String | For OTP login |
| diagnosis | Array | [ASD, SLD, ID, CP] |
| severity | Enum | Mild/Moderate/Severe |

### Booking Collection
| Field | Type | Purpose |
|-------|------|---------|
| bookingId | String | Unique booking reference |
| specialId | String | Patient reference |
| therapyType | Enum | Type of therapy |
| date | Date | Booking date |
| timeSlot | String | Selected time slot |
| status | Enum | Booking status |

---

## 5. API Design

### Major API Endpoints

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | /api/auth/parent/send-otp | Send OTP to parent's phone |
| 2 | POST | /api/auth/parent/verify-otp | Verify OTP and issue JWT |
| 3 | POST | /api/auth/staff/login | Staff email/password login |
| 4 | GET | /api/bookings/available-slots | Get available time slots |
| 5 | POST | /api/bookings | Create new booking |
| 6 | POST | /api/sessions/:id/complete | Complete session with notes |

---

### API Example: Create Booking

```
POST /api/bookings

Request:
{
    "specialId": "MEC2025000001",
    "therapyType": "OT",
    "date": "2025-01-15",
    "timeSlot": "10:00 AM - 11:00 AM"
}

Response:
{
    "success": true,
    "booking": {
        "bookingId": "BK202501150001",
        "status": "confirmed"
    }
}
```

---

## 6. Module Design

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULE OVERVIEW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AUTH MODULE                                         │   │
│  │ → OTP generation, JWT tokens, role validation       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PATIENT MODULE                                      │   │
│  │ → Registration, profile management, search          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ BOOKING MODULE                                      │   │
│  │ → Slot availability, booking CRUD, cancellation     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SESSION MODULE                                      │   │
│  │ → Session lifecycle, notes, progress tracking       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ADMIN MODULE                                        │   │
│  │ → Staff management, analytics, reports              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   TECHNOLOGY STACK                          │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│   FRONTEND    │  • React 18 (UI Library)                   │
│               │  • Vite (Build Tool)                       │
│               │  • Tailwind CSS (Styling)                  │
│               │  • Axios (HTTP Client)                     │
│               │  • React Router (Navigation)               │
│               │                                             │
├───────────────┼─────────────────────────────────────────────┤
│               │                                             │
│   BACKEND     │  • Node.js (Runtime)                       │
│               │  • Express.js (Framework)                  │
│               │  • JWT (Authentication)                    │
│               │  • bcrypt (Password Hashing)               │
│               │  • Helmet (Security Headers)               │
│               │                                             │
├───────────────┼─────────────────────────────────────────────┤
│               │                                             │
│   DATABASE    │  • MongoDB Atlas (Cloud DB)                │
│               │  • Mongoose (ODM)                          │
│               │                                             │
├───────────────┼─────────────────────────────────────────────┤
│               │                                             │
│   SERVICES    │  • MessageCentral (SMS OTP)                │
│               │  • Cloudinary (Image Storage)              │
│               │  • Gmail SMTP (Email)                      │
│               │                                             │
├───────────────┼─────────────────────────────────────────────┤
│               │                                             │
│   DEPLOYMENT  │  • Vercel (Frontend)                       │
│               │  • Render (Backend)                        │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

---

## 8. Security Measures

### Authentication Flow (OTP)

```
  Parent                    Server                    SMS Gateway
    │                          │                           │
    │ 1. Enter SpecialID+Phone │                           │
    │ ─────────────────────────►                           │
    │                          │                           │
    │                          │ 2. Generate 6-digit OTP   │
    │                          │ 3. Store with 5min expiry │
    │                          │                           │
    │                          │ 4. Send OTP               │
    │                          │ ─────────────────────────►│
    │                          │                           │
    │ ◄─────────────────────── 5. SMS Delivered ──────────│
    │                          │                           │
    │ 6. Enter OTP             │                           │
    │ ─────────────────────────►                           │
    │                          │                           │
    │                          │ 7. Verify OTP             │
    │                          │ 8. Issue JWT Token        │
    │                          │                           │
    │ ◄───────────────────────────────────────────────────│
    │       9. Return Token + User Info                    │
```

---

### Security Implementation

| Layer | Measure |
|-------|---------|
| **Transport** | HTTPS enforced in production |
| **Authentication** | JWT with 7-day expiry |
| **Passwords** | bcrypt with 10 salt rounds |
| **Input** | express-validator on all routes |
| **Rate Limiting** | 100 requests/hour per IP |
| **Headers** | Helmet.js security headers |
| **CORS** | Frontend domain whitelist |

---

## 9. GUI Design Mockups

### Parent Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  LOGO                               Welcome, Parent [Logout]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Child   │  │ Upcoming │  │  Total   │  │  Last    │    │
│  │  [Photo] │  │    2     │  │   15     │  │  12 Jan  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│  [Book Session]      [View History]      [Profile]          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ UPCOMING SESSIONS                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Date       Time        Type        Status            │  │
│  │ 15 Jan     10:00 AM    OT          Confirmed         │  │
│  │ 18 Jan     2:00 PM     Speech      Confirmed         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Therapist Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  LOGO                            Welcome, Dr. Name [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Today's      │  │ Pending      │  │ Completed    │      │
│  │ Sessions: 5  │  │ Notes: 2     │  │ Month: 28    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  TODAY'S SCHEDULE - 15 January 2025                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Time      Patient      Type    Status    Action      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 9:00 AM   Rahul K.     OT      Waiting   [Start]     │  │
│  │ 10:00 AM  Priya S.     OT      Scheduled -           │  │
│  │ 11:00 AM  Arjun M.     OT      Scheduled -           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Data Flow

```
                    BOOKING DATA FLOW
    ════════════════════════════════════════════════

    User              Frontend           Backend            DB
     │                   │                  │                │
     │ 1. Select Slot    │                  │                │
     │ ──────────────────►                  │                │
     │                   │                  │                │
     │                   │ 2. Check Avail.  │                │
     │                   │ ────────────────►│                │
     │                   │                  │                │
     │                   │                  │ 3. Query       │
     │                   │                  │ ───────────────►
     │                   │                  │                │
     │                   │                  │ 4. Return      │
     │                   │                  │ ◄───────────────
     │                   │                  │                │
     │                   │ 5. Available     │                │
     │                   │ ◄────────────────│                │
     │                   │                  │                │
     │ 6. Show Slots     │                  │                │
     │ ◄──────────────────                  │                │
     │                   │                  │                │
     │ 7. Confirm        │                  │                │
     │ ──────────────────►                  │                │
     │                   │                  │                │
     │                   │ 8. Create        │                │
     │                   │ ────────────────►│                │
     │                   │                  │                │
     │                   │                  │ 9. Save        │
     │                   │                  │ ───────────────►
```

---

## SDD Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✓ SDD defines HOW, not WHAT                              │
│   ✓ Three-tier architecture (Client-Server)                │
│   ✓ 6 major modules with clear responsibilities            │
│   ✓ MongoDB with 6 main collections                        │
│   ✓ RESTful API design with 30+ endpoints                  │
│   ✓ Multi-layer security (JWT, RBAC, Rate Limiting)        │
│   ✓ MERN stack for full-stack development                  │
│   ✓ Cloud deployment (Vercel + Render + MongoDB Atlas)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---
