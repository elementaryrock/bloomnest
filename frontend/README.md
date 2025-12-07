# Therapy Booking System - Frontend

React + Vite frontend for the Therapy Unit Booking System.

## Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx
│   │   ├── FileUpload.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── UI.jsx
│   │   └── index.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── parent/
│   │   ├── receptionist/
│   │   └── therapist/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## Quick Start

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

## Role-Based Access

| Role | Routes | Description |
|------|--------|-------------|
| Parent | /parent/* | Dashboard, booking, history |
| Receptionist | /receptionist/* | Patient registration, search |
| Therapist | /therapist/* | Schedule, session notes |
| Admin | /admin/* | Stats, staff management |

## Key Components

- **AuthContext**: Manages authentication state
- **ProtectedRoute**: Role-based route protection
- **ErrorBoundary**: Graceful error handling
- **LoadingSpinner**: Loading states and skeletons
