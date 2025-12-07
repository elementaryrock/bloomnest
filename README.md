# Therapy Unit Booking System

A comprehensive therapy booking and management system for Marian Engineering College's therapy unit.

## Features

### For Parents
- **OTP-based Login**: Secure login using Special ID and phone number
- **Dashboard**: View child's info, upcoming appointments, and session history
- **Booking**: Book therapy sessions up to 30 days in advance
- **Session History**: View completed sessions with therapist notes

### For Receptionists
- **Patient Registration**: Multi-step form for new patient registration
- **Patient Search**: Search and manage patient records
- **Dashboard**: Overview of daily registrations and appointments

### For Therapists
- **Daily Schedule**: View today's sessions at a glance
- **Session Notes**: Document activities, progress, and recommendations
- **Assessment Module**: Complete comprehensive assessments

### For Administrators
- **Dashboard**: System-wide statistics and activity monitoring
- **Staff Management**: Add, edit, and manage staff members
- **Reports**: Generate utilization and summary reports

## Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling
- Axios for API calls
- React Toastify for notifications

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for emails
- Twilio for SMS OTP
- Cloudinary for image storage

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Twilio account (for SMS)
- Cloudinary account (for images)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file from `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

Run the server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Run the development server:
```bash
npm run dev
```

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set environment variables
5. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/staff/login` - Staff login

### Patients
- `POST /api/patients/register` - Register new patient
- `GET /api/patients/search` - Search patients
- `GET /api/patients/:specialId` - Get patient details
- `PUT /api/patients/:specialId` - Update patient
- `DELETE /api/patients/:specialId` - Deactivate patient

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/available-slots` - Get available slots
- `GET /api/bookings/upcoming` - Get upcoming bookings
- `POST /api/bookings/:id/cancel` - Cancel booking

### Sessions
- `GET /api/sessions/today` - Get today's sessions
- `POST /api/sessions/:id/complete` - Complete session with notes
- `GET /api/sessions/history` - Get session history

## License

MIT License - Marian Engineering College
