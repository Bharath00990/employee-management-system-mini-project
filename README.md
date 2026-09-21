# EMS Pro - Employee Management System

A production-quality, full-stack Employee Management System built with React, Node.js, Express, and MongoDB. Features a modern SaaS-style admin dashboard with JWT authentication, role-based authorization, interactive charts, and full CRUD operations.

---

## Features

- **JWT Authentication** with bcrypt password hashing
- **Role-Based Access Control** (Admin / User)
- **Beautiful Dashboard** with Recharts analytics
- **Full Employee CRUD** with search, filter, pagination, sort
- **Dark / Light Mode** with localStorage persistence
- **Framer Motion Animations** (page transitions, card entrances, hover effects)
- **Responsive Design** — desktop, tablet, mobile
- **Snackbar Notifications** for all actions
- **Skeleton Loading States**
- **Confirmation Dialogs** for destructive actions

---

## Tech Stack

| Frontend | Backend |
|---|---|
| React 18 + Vite | Node.js + Express |
| Material UI (MUI) | MongoDB + Mongoose |
| Recharts | JWT + bcryptjs |
| Framer Motion | express-validator |
| React Router v6 | helmet, cors, morgan |
| Axios | dotenv |

---

## Project Structure

```
employee-management-system/
├── backend/          # Express REST API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   └── server.js
└── frontend/         # React + Vite
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── services/
        ├── theme/
        └── utils/
```

---

## Installation & Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone <repo-url>
cd employee-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee-management-system
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Seed Database

```bash
cd backend
npm run seed
```

**Seeded Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ems.com | Admin@123 |
| User | john@ems.com | User@123 |

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Private | Get current user |

### Employees
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/employees | Private | List employees (search, filter, paginate) |
| GET | /api/employees/:id | Private | Get single employee |
| POST | /api/employees | Admin only | Create employee |
| PUT | /api/employees/:id | Admin only | Update employee |
| DELETE | /api/employees/:id | Admin only | Delete employee |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/dashboard/stats | Private | Summary statistics |
| GET | /api/dashboard/department-distribution | Private | Dept distribution |
| GET | /api/dashboard/employee-growth | Private | Growth over 6 months |
| GET | /api/dashboard/status-breakdown | Private | Status counts |

---

## Sample API Request

```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Authentication Flow

1. User POSTs credentials to `/api/auth/login`
2. Server validates, returns JWT token
3. Frontend stores token in `localStorage`
4. All subsequent requests include `Authorization: Bearer <token>` header
5. JWT middleware verifies token on protected routes

---

## Future Improvements

- Email notifications on employee creation
- Export employees to CSV/PDF
- Leave management module
- Performance review system
- Multi-tenant support
- 2FA authentication
