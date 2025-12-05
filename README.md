# Therapy Unit Booking System

A comprehensive web application for Jyothi Central School to manage therapy sessions for special needs children.

## Project Structure

```
therapy-booking-system/
├── backend/          # Express.js API server
├── frontend/         # React.js application
└── README.md
```

## Features

- OTP-based authentication for parents
- Password-based authentication for staff
- Patient registration and management
- Therapy session booking with validation
- Therapist schedule management
- Session notes documentation
- Bi-monthly assessments with PDF generation
- Admin dashboard with system statistics
- Notification system (Email/SMS)

## Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- React Router
- Axios
- React Hook Form

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer & Twilio

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Storage: Cloudinary

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account
- Cloudinary account
- Twilio account (for OTP)
- Gmail account (for email notifications)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your credentials

5. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API URL

5. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories for required environment variables.

## License

ISC
