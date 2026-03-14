<div align="center">

<img src="frontend/public/logos/BloomNest-glass.png" alt="BloomNest Logo" width="180" />

# 🌸 BloomNest

### *Where Every Mind Finds Its Garden*

[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google/)

---

**BloomNest** is a compassionate, all-in-one digital ecosystem designed to nurture the growth, development, and well-being of children with intellectual and developmental disabilities. More than just a booking system — it's a **holistic therapy management platform** that brings together therapists, parents, and caregivers under one roof, empowering every child to bloom at their own pace.

*Built with 💚 at Marian Engineering College*

[✨ Features](#-features) · [🧠 AI-Powered Tools](#-ai-powered-tools) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [🚀 Getting Started](#-getting-started) · [👥 Team](#-meet-the-team)

---

</div>

## 🌱 The Philosophy

> *"Every child is a different kind of flower, and all together, they make this world a beautiful garden."*

Children with developmental challenges don't need fixing — they need **fertile ground to grow**. BloomNest reimagines therapy management by turning clinical milestones into **living, breathing gardens** where every small victory is celebrated, every skill learned becomes a tree in a growing forest, and every family's journey is supported with care, empathy, and intelligent tools.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🌿 For Parents & Families
- **Personalized Dashboard** — A warm, at-a-glance view of your child's upcoming sessions, therapy history, and growth progress  
- **Smart Booking System** — Book therapy sessions up to 30 days in advance with real-time slot availability  
- **Session History & Notes** — Review completed sessions with detailed therapist notes and recommendations  
- **Assessment Reports** — Access comprehensive developmental assessments with downloadable PDF reports  
- **Child Profile** — Complete clinical identity card with therapy type, diagnosis, and progress metrics  

</td>
<td width="50%">

### 🩺 For Therapists
- **Daily Schedule View** — See today's sessions at a glance with patient details and therapy types  
- **Session Documentation** — Record activities, progress observations, and personalized recommendations  
- **Comprehensive Assessments** — Complete multi-domain evaluations covering motor skills, language, social-adaptive behavior, and more  
- **SkillSprout Management** — Set, track, and nurture skill goals for each patient across 9 developmental categories  
- **Patient Insights** — Deep-dive into individual patient history, growth logs, and therapy journey  

</td>
</tr>
<tr>
<td width="50%">

### 🏥 For Receptionists
- **Patient Registration** — Streamlined multi-step registration with photo upload and clinical details  
- **Powerful Search** — Find and manage patient records instantly by name, ID, or contact  
- **Booking Management** — Schedule, view, and manage therapy appointments with conflict detection  
- **Daily Overview** — Dashboard with real-time stats on registrations, bookings, and check-ins  

</td>
<td width="50%">

### ⚙️ For Administrators
- **System Analytics** — Organization-wide statistics, activity monitoring, and utilization insights  
- **Staff Management** — Add, edit, and manage therapists and receptionists with role-based access  
- **Schedule Configuration** — Define time slots, therapy types, session limits, and working hours  
- **Report Generation** — Generate comprehensive summary and utilization reports  

</td>
</tr>
</table>

---

## 🧠 AI-Powered Tools

BloomNest integrates cutting-edge AI to make therapy more engaging, personal, and impactful:

<table>
<tr>
<td align="center" width="33%">

### 🌱 SkillSprout
**Gamified Skill Development**

Turn therapy goals into a **magical garden**. Each skill goal becomes a plant — from a tiny seed 🌱 to a flourishing tree 🌳. Children earn **XP**, unlock **badges**, maintain **watering streaks**, and watch their personal **forest grow** as they master communication, motor, cognitive, social, emotional, speech, sensory, and self-care skills.

*Categories: 9 skill domains · 5 growth stages · XP & leveling system · Seasonal forest themes*

</td>
<td align="center" width="33%">

### 📖 NeuralNarrative
**AI-Generated Storybooks**

Personalized, illustrated storybooks generated using **Google Imagen 4** and **Gemini AI**. Parents choose a real-life scenario their child is learning to navigate — like visiting the dentist or sleeping alone — and BloomNest crafts a beautiful multi-page storybook with custom illustrations featuring the child as the hero of their own story.

*Powered by: Imagen 4 · Gemini 2.5 Flash · Multi-provider fallback*

</td>
<td align="center" width="33%">

### 🌊 TherapyRipple
**Family Wellbeing Tracker**

Because therapy doesn't exist in a vacuum. TherapyRipple helps parents log **weekly family stress levels**, track **sibling emotional states**, and visualize the **ripple effect** of therapy on the entire family with beautiful animated ripple visualizations, sparkline trends, and AI-powered insights.

*Features: Stress tracking · Sibling monitoring · Trend analysis · Ripple visualizations*

</td>
</tr>
</table>

---

## 🔐 Security & Reliability

| Feature | Details |
|---|---|
| **🔑 Dual Authentication** | OTP-based login for parents (via Twilio SMS) · JWT token auth for staff |
| **🛡️ Security Middleware** | Helmet.js · Rate limiting · HTTPS enforcement · XSS & clickjacking protection |
| **📋 Audit Logging** | Structured audit trails for all sensitive operations (login, patient records, bookings) |
| **🔒 Role-Based Access** | Four distinct roles — Parent, Therapist, Receptionist, Admin — with granular permissions |
| **📡 Real-time Notifications** | Email (Nodemailer) + SMS (Twilio) for booking confirmations, reminders & session updates |

---

## 🏗️ Architecture

```
BloomNest/
├── 🎨 frontend/                    # React 18 + Vite 5 SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/               # Parent Login · Staff Login · OTP Verification
│   │   │   ├── parent/             # Dashboard · Booking · SkillSprout · NeuralNarrative · TherapyRipple
│   │   │   ├── therapist/          # Schedule · Sessions · Assessments · Patient Details · SkillSprout
│   │   │   ├── receptionist/       # Dashboard · Registration · Search · Booking Management
│   │   │   └── admin/              # Dashboard · Staff Management · Schedule Config
│   │   ├── context/                # Auth Context (React Context API)
│   │   └── services/               # Axios API client
│   └── public/logos/               # BloomNest branding assets
│
├── ⚙️ backend/                     # Node.js + Express REST API
│   ├── models/                     # 15 Mongoose schemas
│   │   ├── Patient · Booking · Session · Assessment
│   │   ├── SkillGoal · ChildXP · GrowthLog          # SkillSprout system
│   │   ├── Narrative                                  # NeuralNarrative stories
│   │   ├── FamilyWellbeing                            # TherapyRipple data
│   │   └── Staff · Therapist · OTP · Notification · Report · SystemSettings
│   ├── controllers/                # 10 route controllers
│   ├── routes/                     # 12 route modules
│   ├── services/
│   │   ├── imageGenerationService  # Imagen 4 + Gemini AI integration
│   │   ├── imageProviders/         # Multi-provider fallback (Pollinations, Cloudflare, Imagen)
│   │   ├── notificationService     # Email + SMS notifications
│   │   ├── pdfService              # Assessment PDF generation (PDFKit)
│   │   ├── bookingService          # Smart booking with conflict detection
│   │   └── authService             # OTP + JWT authentication
│   ├── middleware/                  # Auth · Validation · Security · Error handling
│   └── config/                     # Database configuration
│
└── 📄 docs/                        # SRS & SDD documentation
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **Vite 5** | Lightning-fast build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling with custom themes |
| **React Router 6** | Client-side routing & navigation |
| **React Hook Form** | Performant form handling & validation |
| **Lucide React** | Beautiful, consistent icon library |
| **React Toastify** | Elegant toast notifications |
| **Axios** | HTTP client for API communication |

</td>
<td valign="top" width="50%">

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | RESTful API server |
| **MongoDB + Mongoose** | NoSQL database with schema validation |
| **JWT + Bcrypt** | Secure token auth & password hashing |
| **Twilio** | SMS OTP delivery |
| **Nodemailer** | Email notifications & reports |
| **Cloudinary** | Cloud image storage & management |
| **PDFKit** | Dynamic assessment PDF generation |
| **Google AI (Imagen 4 & Gemini)** | AI story & image generation |
| **Helmet + Express Rate Limit** | Security hardening |
| **Node-Cron** | Scheduled tasks & reminders |

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ &nbsp;·&nbsp; **MongoDB Atlas** account &nbsp;·&nbsp; **Twilio** account (SMS) &nbsp;·&nbsp; **Cloudinary** account (images)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/elementaryrock/mini-project.git
cd mini-project
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Email
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password

# Google AI (for NeuralNarrative)
GEMINI_API_KEY=your_gemini_api_key

FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

> 🌐 The app will be live at **http://localhost:5173**

---

## 🌍 Deployment

| Layer | Platform | Steps |
|---|---|---|
| **Backend** | Railway | Push to GitHub → Create Web Service → Set env variables → Deploy |
| **Frontend** | Vercel | Push to GitHub → Import project → Set `VITE_API_URL` → Deploy |

---

## 👥 Meet the Team

<div align="center">

<table>
<tr>
<td align="center" width="25%">

<a href="https://github.com/elementaryrock/">
<img src="https://github.com/elementaryrock.png" width="100" style="border-radius:50%" alt="Maanas M S"/>
<br />
<b>Maanas M S</b>
</a>
<br />
<sub>💻 Developer</sub>

</td>
<td align="center" width="25%">

<a href="https://github.com/NotNalin">
<img src="https://github.com/NotNalin.png" width="100" style="border-radius:50%" alt="Nalin Jyothy"/>
<br />
<b>Nalin Jyothy</b>
</a>
<br />
<sub>💻 Developer</sub>

</td>
<td align="center" width="25%">

<a href="https://github.com/Aishuuupb">
<img src="https://github.com/Aishuuupb.png" width="100" style="border-radius:50%" alt="Aiswarya P B"/>
<br />
<b>Aiswarya P B</b>
</a>
<br />
<sub>💻 Developer</sub>

</td>
<td align="center" width="25%">

<a href="https://github.com/kartfi">
<img src="https://github.com/kartfi.png" width="100" style="border-radius:50%" alt="Karthik S P"/>
<br />
<b>Karthik S P</b>
</a>
<br />
<sub>💻 Developer</sub>

</td>
</tr>
</table>

</div>

---

<div align="center">

### 🌸 *"In a world of labels, BloomNest sees potential."*

**Every child deserves a place to grow.**

Made with 💚 and a whole lot of ☕

---

<sub>📄 Licensed under MIT · Marian Engineering College · 2026</sub>

</div>
