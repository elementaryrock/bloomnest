# Project Plan

---

## Development Methodology

### Agile Scrum Approach

We followed the **Agile Scrum** methodology for this project, which allowed us to:

- Deliver working software in iterations (sprints)
- Adapt to changing requirements
- Maintain regular communication within the team
- Ensure continuous improvement

```
┌─────────────────────────────────────────────────────────────┐
│                    AGILE SCRUM CYCLE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ┌─────────────────────────────────────┐             │
│         │         PRODUCT BACKLOG             │             │
│         │  (All features and requirements)    │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                │
│                            ▼                                │
│         ┌─────────────────────────────────────┐             │
│         │         SPRINT PLANNING             │             │
│         │    (Select items for sprint)        │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                │
│                            ▼                                │
│    ┌─────────────────────────────────────────────────┐      │
│    │                 SPRINT (2 weeks)                │      │
│    │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │      │
│    │  │  Daily  │  │  Daily  │  │  Daily  │   ...   │      │
│    │  │ Standup │  │ Standup │  │ Standup │         │      │
│    │  └─────────┘  └─────────┘  └─────────┘         │      │
│    └──────────────────────┬──────────────────────────┘      │
│                           │                                 │
│                           ▼                                 │
│    ┌─────────────────────────────────────────────────┐      │
│    │              SPRINT REVIEW                      │      │
│    │         (Demo working software)                 │      │
│    └──────────────────────┬──────────────────────────┘      │
│                           │                                 │
│                           ▼                                 │
│    ┌─────────────────────────────────────────────────┐      │
│    │           SPRINT RETROSPECTIVE                  │      │
│    │         (What went well? Improve?)              │      │
│    └─────────────────────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Modules

| Module | Description | Priority |
|--------|-------------|----------|
| **M1** | Authentication & Security | High |
| **M2** | Patient Management | High |
| **M3** | Booking System | High |
| **M4** | Session Documentation | Medium |
| **M5** | Therapist Dashboard | Medium |
| **M6** | Admin Dashboard | Medium |
| **M7** | Deployment & Testing | High |

---

## Sprint Breakdown

### Sprint 1: Foundation & Authentication

```
┌─────────────────────────────────────────────────────────────┐
│                      SPRINT 1                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   TASKS                                                     │
│   ├── Project setup (React + Express + MongoDB)            │
│   ├── Database schema design                               │
│   ├── Staff login (email/password)                         │
│   ├── Parent login (OTP-based)                             │
│   ├── JWT token implementation                             │
│   ├── Role-based middleware                                │
│   └── Basic frontend routing                               │
│                                                             │
│   DELIVERABLES                                              │
│   ├── ✓ Working login system                               │
│   ├── ✓ Protected routes                                   │
│   └── ✓ Database connection                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sprint 2: Patient & Booking

```
┌─────────────────────────────────────────────────────────────┐
│                      SPRINT 2                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   TASKS                                                     │
│   ├── Patient registration form                            │
│   ├── Special ID generation                                │
│   ├── Patient search functionality                         │
│   ├── Photo upload (Cloudinary)                            │
│   ├── Booking slot availability API                        │
│   ├── Booking creation logic                               │
│   ├── Double-booking prevention                            │
│   └── Booking cancellation                                 │
│                                                             │
│   DELIVERABLES                                              │
│   ├── ✓ Patient registration working                       │
│   ├── ✓ Booking system functional                          │
│   └── ✓ No double bookings                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sprint 3: Sessions & Therapist Features

```
┌─────────────────────────────────────────────────────────────┐
│                      SPRINT 3                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   TASKS                                                     │
│   ├── Therapist dashboard                                  │
│   ├── Daily schedule view                                  │
│   ├── Session start/complete flow                          │
│   ├── Session notes form                                   │
│   ├── Progress tracking                                    │
│   ├── Assessment creation                                  │
│   └── Session history view                                 │
│                                                             │
│   DELIVERABLES                                              │
│   ├── ✓ Therapist can view schedule                        │
│   ├── ✓ Session documentation working                      │
│   └── ✓ Progress tracking implemented                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sprint 4: Admin & Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                      SPRINT 4                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   TASKS                                                     │
│   ├── Admin dashboard with statistics                      │
│   ├── Staff management (CRUD)                              │
│   ├── Analytics and reports                                │
│   ├── Security hardening                                   │
│   ├── Deployment to Vercel + Render                        │
│   ├── Testing and bug fixes                                │
│   └── Documentation                                        │
│                                                             │
│   DELIVERABLES                                              │
│   ├── ✓ Admin features complete                            │
│   ├── ✓ Application deployed                               │
│   └── ✓ All major bugs fixed                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Team Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                   TEAM ALLOCATION                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ MAANAS - Team Lead & Backend Developer              │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ • Project coordination and planning                 │   │
│   │ • Authentication system (OTP, JWT)                  │   │
│   │ • Security middleware implementation                │   │
│   │ • API architecture design                           │   │
│   │ • Code review and integration                       │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ NALIN - Frontend Developer                          │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ • React application structure                       │   │
│   │ • Parent dashboard and booking UI                   │   │
│   │ • Therapist dashboard                               │   │
│   │ • Responsive design with Tailwind                   │   │
│   │ • State management with Context API                 │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ KARTHIK - Database & API Developer                  │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ • MongoDB schema design                             │   │
│   │ • Mongoose models and indexes                       │   │
│   │ • CRUD APIs for patients and bookings               │   │
│   │ • Session and assessment APIs                       │   │
│   │ • External service integration                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ AISHWARYA - UI/UX Designer & Tester                 │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ • UI mockups and wireframes                         │   │
│   │ • User experience optimization                      │   │
│   │ • Receptionist and Admin dashboards                 │   │
│   │ • Testing and bug reporting                         │   │
│   │ • Documentation and presentation                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Gantt Chart

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PROJECT TIMELINE                                   │
├───────────────────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────────┤
│ TASK                  │ W1  │ W2  │ W3  │ W4  │ W5  │ W6  │ W7  │ W8  │ OWNER   │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Requirements Analysis │ ███ │     │     │     │     │     │     │     │ All     │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ System Design         │ ███ │ ███ │     │     │     │     │     │     │ All     │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Database Design       │     │ ███ │     │     │     │     │     │     │ Karthik │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Authentication Module │     │ ███ │ ███ │     │     │     │     │     │ Maanas  │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Frontend Setup        │     │ ███ │ ███ │     │     │     │     │     │ Nalin   │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Patient Module        │     │     │ ███ │ ███ │     │     │     │     │ Karthik │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Booking Module        │     │     │     │ ███ │ ███ │     │     │     │ Karthik │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Parent Dashboard      │     │     │ ███ │ ███ │     │     │     │     │ Nalin   │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Therapist Dashboard   │     │     │     │     │ ███ │ ███ │     │     │ Nalin   │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Session Module        │     │     │     │     │ ███ │ ███ │     │     │ Maanas  │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Admin Dashboard       │     │     │     │     │     │ ███ │ ███ │     │ Aishwarya│
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ UI/UX Design          │     │ ███ │ ███ │ ███ │ ███ │     │     │     │ Aishwarya│
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Testing               │     │     │     │ ███ │ ███ │ ███ │ ███ │     │ Aishwarya│
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Security Hardening    │     │     │     │     │     │     │ ███ │     │ Maanas  │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Deployment            │     │     │     │     │     │     │ ███ │ ███ │ All     │
├───────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────┤
│ Documentation         │     │     │     │     │     │     │ ███ │ ███ │ All     │
└───────────────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────────┘

Legend: ███ = Active work period
```

---

## Resource Allocation

### Hardware Resources

| Resource | Specification | Purpose |
|----------|---------------|---------|
| Development Laptops | 4 laptops, 8GB+ RAM | Individual development |
| Internet Connection | Broadband | Cloud services access |

### Software Resources

| Resource | Purpose |
|----------|---------|
| VS Code | Code editor |
| Git & GitHub | Version control |
| Postman | API testing |
| MongoDB Compass | Database management |
| Chrome DevTools | Frontend debugging |
| Figma | UI mockups |

### Cloud Services

| Service | Purpose | Cost |
|---------|---------|------|
| MongoDB Atlas | Database | Free tier |
| Vercel | Frontend hosting | Free tier |
| Render | Backend hosting | Free tier |
| MessageCentral | SMS OTP | Trial credits |
| Cloudinary | Image storage | Free tier |

---

## Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SMS API failure | Medium | High | Console fallback for testing |
| Database outage | Low | High | MongoDB Atlas redundancy |
| Team member unavailable | Medium | Medium | Cross-training on modules |
| Scope creep | High | Medium | Strict sprint boundaries |
| Integration issues | Medium | High | Regular integration testing |

---

## Sprint Summary

| Sprint | Duration | Focus | Status |
|--------|----------|-------|--------|
| Sprint 1 | 2 weeks | Foundation & Auth | Completed |
| Sprint 2 | 2 weeks | Patient & Booking | Completed |
| Sprint 3 | 2 weeks | Sessions & Therapist | Completed |
| Sprint 4 | 2 weeks | Admin & Deployment | Completed |

---

## Key Milestones

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT MILESTONES                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   PHASE 1: FOUNDATION (Completed)                           │
│   ✓ M1: Project Kickoff                                    │
│   ✓ M2: Authentication System Complete                     │
│   ✓ M3: Booking System Functional                          │
│   ✓ M4: Session Documentation Working                      │
│   ✓ M5: All Dashboards Complete                            │
│   ✓ M6: Application Deployed                               │
│   ✓ M7: Testing Complete                                   │
│   ► M8: Presentation (This Friday!)                        │
│                                                             │
│   PHASE 2: INNOVATION (Planned)                             │
│   ○ M9: Therapy Ripple - Family Wellbeing Module           │
│   ○ M10: StoryBuilder - AI Social Stories                  │
│   ○ M11: SkillSprout - Gamified Progress Garden            │
│   ○ M12: Phase 2 Testing & Integration                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 2 Roadmap (Future Development)

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 2: INNOVATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🌊 THERAPY RIPPLE (Week 1-2)                             │
│   ├── Family check-in forms                                 │
│   ├── Wellbeing data storage                                │
│   ├── Correlation visualization                             │
│   └── Therapist insights dashboard                          │
│                                                             │
│   🎨 STORYBUILDER (Week 2-3)                               │
│   ├── AI API integration (Pollinations/Leonardo)           │
│   ├── Story template system                                 │
│   ├── Image generation pipeline                             │
│   └── PDF export functionality                              │
│                                                             │
│   🌱 SKILLSPROUT (Week 3-4)                                │
│   ├── Garden visualization                                  │
│   ├── Plant growth mechanics                                │
│   ├── Activity logging                                      │
│   └── Celebration animations                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---
