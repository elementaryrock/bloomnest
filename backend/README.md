# Therapy Booking System - Backend API

Express.js REST API for the Therapy Unit Booking System.

## Structure

```
backend/
├── config/
│   └── database.js      # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── patientController.js
│   └── ...
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── errors.js        # Custom error classes
│   ├── rateLimiter.js   # Rate limiting
│   ├── security.js      # Security headers
│   └── validator.js     # Request validation
├── models/
│   ├── Patient.js
│   ├── Booking.js
│   ├── Session.js
│   └── ...
├── routes/
│   ├── auth.routes.js
│   ├── patient.routes.js
│   ├── booking.routes.js
│   └── ...
├── utils/
│   ├── cloudinary.js    # Image uploads
│   ├── email.js         # Email service
│   ├── otp.js           # OTP handling
│   └── scheduler.js     # Cron jobs
├── .env.example
├── render.yaml          # Deployment config
└── server.js            # Entry point
```

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret for JWT signing |
| CLOUDINARY_* | Cloudinary credentials |
| TWILIO_* | Twilio credentials for SMS |
| EMAIL_* | SMTP email credentials |

## API Response Format

All endpoints return JSON in this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```
