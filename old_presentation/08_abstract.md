# Abstract

---

## Project Overview

### Title
**Therapy Unit Booking System - A Web-Based Platform for Managing Therapy Sessions for Children with Special Needs**

---

## Problem Statement

> The manual management of therapy sessions at special needs therapy centers results in scheduling inefficiencies, poor record keeping, lack of progress visibility, and communication gaps between parents, therapists, and administrative staff. There is a need for a centralized digital platform that streamlines booking, documentation, and tracking of therapy sessions while ensuring secure access for multiple user roles.

---

## Proposed Solution

```
┌─────────────────────────────────────────────────────────────┐
│              THERAPY UNIT BOOKING SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   A comprehensive MERN stack web application that:         │
│                                                             │
│   • Enables online booking with real-time availability     │
│   • Provides multi-role secure authentication              │
│   • Supports session documentation and progress tracking   │
│   • Offers administrative dashboard with analytics         │
│   • Ensures data security and access control               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Solution Approach

### Architecture Overview

```
    ┌─────────────────────────────────────────────────────────┐
    │                     FRONTEND                            │
    │              React.js + Tailwind CSS                    │
    │                  (Vercel)                               │
    └──────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
                           ▼
    ┌─────────────────────────────────────────────────────────┐
    │                     BACKEND                             │
    │             Node.js + Express.js                        │
    │                  (Render)                               │
    ├─────────────────────────────────────────────────────────┤
    │  • JWT Authentication    • Role-Based Access Control   │
    │  • OTP Verification      • Rate Limiting               │
    │  • Input Validation      • Error Handling              │
    └──────────────────────┬──────────────────────────────────┘
                           │ Mongoose ODM
                           ▼
    ┌─────────────────────────────────────────────────────────┐
    │                    DATABASE                             │
    │                  MongoDB Atlas                          │
    ├─────────────────────────────────────────────────────────┤
    │  • Patient Records       • Booking Data                │
    │  • Session Notes         • Staff Information           │
    │  • Assessments           • System Settings             │
    └─────────────────────────────────────────────────────────┘
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Role Authentication** | OTP for parents, email/password for staff |
| **Real-Time Booking** | 7 daily slots, conflict prevention |
| **Patient Management** | Registration, profiles, medical history |
| **Session Documentation** | Notes, progress levels, recommendations |
| **Therapist Dashboard** | Schedule, sessions, assessments |
| **Admin Analytics** | Statistics, utilization, trends |

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                         │
├───────────────┬─────────────────────────────────────────────┤
│   FRONTEND    │  React 18, Vite, Tailwind CSS, Axios       │
│               │  React Router, React Hook Form              │
├───────────────┼─────────────────────────────────────────────┤
│   BACKEND     │  Node.js, Express.js, JWT, bcrypt          │
│               │  Helmet, Express-validator, Multer          │
├───────────────┼─────────────────────────────────────────────┤
│   DATABASE    │  MongoDB Atlas, Mongoose ODM               │
├───────────────┼─────────────────────────────────────────────┤
│   SERVICES    │  MessageCentral (SMS), Cloudinary (Images) │
│               │  Nodemailer (Email), PDFKit (Reports)       │
├───────────────┼─────────────────────────────────────────────┤
│   DEPLOYMENT  │  Render (Backend), Vercel (Frontend)       │
└───────────────┴─────────────────────────────────────────────┘
```

---

## User Roles

```
                          ┌─────────────┐
                          │    ADMIN    │
                          │  (Oversee)  │
                          └──────┬──────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
    │  RECEPTIONIST │    │   THERAPIST   │    │    PARENT     │
    │  (Register)   │    │   (Treat)     │    │   (Book)      │
    └───────────────┘    └───────────────┘    └───────────────┘
```

---

## Expected Outcomes

1. **Elimination** of double-booking incidents
2. **Reduction** in administrative overhead
3. **Improved** communication between stakeholders
4. **Enhanced** progress tracking and documentation
5. **Secure** access to patient information
6. **Data-driven** insights for management

---

## Keywords

`Therapy Management` `MERN Stack` `Healthcare IT` `Appointment Scheduling` `Special Needs` `OTP Authentication` `RBAC` `MongoDB` `React.js` `Node.js`

---
