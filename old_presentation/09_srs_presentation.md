# Software Requirements Specification (SRS)
## Presentation Slides

---

## What is SRS?

> **SRS defines WHAT the system should do, not HOW**

```
┌─────────────────────────────────────────────────────────────┐
│                    SRS COVERS                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✓ Purpose and scope of the project                       │
│   ✓ Problem being solved                                   │
│   ✓ User roles and use cases                               │
│   ✓ Functional requirements                                │
│   ✓ Non-functional requirements                            │
│   ✓ Constraints and assumptions                            │
│   ✓ Acceptance criteria                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Purpose & Scope

### Purpose
A web-based platform to manage therapy sessions for children with special needs at Marian Engineering College's Therapy Unit.

### Scope
| In Scope | Out of Scope |
|----------|--------------|
| Online booking | Billing/Payments |
| Patient management | Inventory management |
| Session documentation | Video consultations |
| Admin analytics | Multi-location support |

---

## 2. Problem Being Solved

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT PROBLEMS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ❌ Manual scheduling → Double bookings                   │
│   ❌ Paper records → Data loss risk                        │
│   ❌ Phone-based booking → Delays                          │
│   ❌ No progress tracking → Poor visibility                │
│   ❌ No access control → Security concerns                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Intended Users

| User | Primary Tasks |
|------|---------------|
| **Parents** | Book sessions, view progress |
| **Therapists** | Manage schedule, document sessions |
| **Receptionists** | Register patients, manage bookings |
| **Administrators** | Oversee operations, manage staff |

---

## 4. Main Features

```
    ┌───────────────────────────────────────────────────┐
    │              SYSTEM FEATURES                      │
    ├───────────────────────────────────────────────────┤
    │                                                   │
    │   1. Multi-Role Authentication (OTP + Password)  │
    │   2. Patient Registration & Management           │
    │   3. Real-Time Booking System                    │
    │   4. Session Documentation                       │
    │   5. Therapist Schedule Management               │
    │   6. Administrative Dashboard                    │
    │   7. Assessment Management                       │
    │                                                   │
    └───────────────────────────────────────────────────┘
```

---

## 5. Functional Requirements (Sample)

### Authentication Module

| ID | The system shall... |
|----|---------------------|
| FR-01 | allow parents to login using Special ID and phone number |
| FR-02 | send a 6-digit OTP to registered phone |
| FR-03 | verify OTP within 5-minute validity |
| FR-04 | allow staff login via email/password |
| FR-05 | enforce role-based access control |

---

### Booking Module

| ID | The system shall... |
|----|---------------------|
| FR-06 | display available time slots for each therapy type |
| FR-07 | allow booking up to 30 days in advance |
| FR-08 | enforce max 2 sessions per therapy type per month |
| FR-09 | prevent double booking of slots |
| FR-10 | allow cancellation with 24-hour notice |

---

## 6. Use Case Diagram

```
                    ┌────────────────────────────────┐
                    │      THERAPY BOOKING SYSTEM    │
                    └────────────────────────────────┘
                                    │
    ┌───────────────┬───────────────┼───────────────┬───────────────┐
    │               │               │               │               │
    ▼               ▼               ▼               ▼               │
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐            │
│ PARENT │     │THERAPIS│     │RECEPTIO│     │ ADMIN  │            │
└───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘            │
    │              │              │              │                  │
    │              │              │              │                  │
 ┌──┴──┐        ┌──┴──┐        ┌──┴──┐        ┌──┴──┐              │
 │Login│        │Login│        │Login│        │Login│              │
 │(OTP)│        │     │        │     │        │     │              │
 └──┬──┘        └──┬──┘        └──┬──┘        └──┬──┘              │
    │              │              │              │                  │
 ┌──┴──┐        ┌──┴──┐        ┌──┴──┐        ┌──┴──┐              │
 │Book │        │View │        │Regis│        │Manag│              │
 │Sess │        │Sched│        │ ter │        │Staff│              │
 └──┬──┘        └──┬──┘        └──┬──┘        └──┬──┘              │
    │              │              │              │                  │
 ┌──┴──┐        ┌──┴──┐        ┌──┴──┐        ┌──┴──┐              │
 │View │        │Docum│        │Manag│        │View │              │
 │Histo│        │ ent │        │Book │        │Stats│              │
 └─────┘        └─────┘        └─────┘        └─────┘              │
```

---

## 7. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| Page load time | < 3 seconds |
| API response | < 500ms |
| Concurrent users | 100+ |

### Security

| Requirement | Implementation |
|-------------|----------------|
| Password encryption | bcrypt |
| Session management | JWT tokens |
| Data transmission | HTTPS only |
| Rate limiting | 100 requests/hour |

---

## 8. Operating Environment

```
┌─────────────────────────────────────────────────────────────┐
│                  OPERATING ENVIRONMENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   HARDWARE                                                  │
│   • Any device with modern web browser                      │
│   • Mobile devices (responsive design)                      │
│                                                             │
│   SOFTWARE                                                  │
│   • Chrome 90+, Firefox 88+, Safari 14+, Edge 90+          │
│   • Internet connectivity required                          │
│                                                             │
│   PLATFORM                                                  │
│   • Frontend: Vercel (Cloud)                               │
│   • Backend: Render (Cloud)                                │
│   • Database: MongoDB Atlas (Cloud)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. External Interfaces

### User Interfaces
- Parent Dashboard (Booking, History)
- Therapist Dashboard (Schedule, Notes)
- Receptionist Dashboard (Registration, Search)
- Admin Dashboard (Statistics, Management)

### External Services
| Service | Purpose |
|---------|---------|
| MessageCentral API | SMS/OTP delivery |
| Cloudinary | Image storage |
| Gmail SMTP | Email notifications |
| MongoDB Atlas | Database |

---

## 10. Constraints & Assumptions

### Constraints
- Must use MERN stack
- Must be mobile-responsive
- Must handle patient data securely

### Assumptions
- Users have internet access
- Parents have registered mobile phones
- Therapy unit operates 9 AM - 5 PM

---

## 11. Acceptance Criteria

| ID | Criteria | Testable |
|----|----------|----------|
| AC-01 | Parent login with OTP works | Yes |
| AC-02 | No double booking possible | Yes |
| AC-03 | Session notes saved correctly | Yes |
| AC-04 | Admin stats are accurate | Yes |
| AC-05 | Mobile responsive | Yes |
| AC-06 | Page loads < 3 seconds | Yes |

---

## SRS Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ✓ SRS defines WHAT, not HOW                              │
│   ✓ 4 user roles with distinct requirements                │
│   ✓ 6 major functional modules                             │
│   ✓ Clear performance and security requirements            │
│   ✓ Testable acceptance criteria                           │
│   ✓ No design/code details included                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---
