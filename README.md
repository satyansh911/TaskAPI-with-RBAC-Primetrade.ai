# 🚀 Primetrade.ai — TaskAPI

A **Scalable REST API** with JWT Authentication & Role-Based Access Control, built for the Primetrade.ai Backend Developer Intern Assignment.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Neon Serverless) |
| Authentication | JWT + bcrypt |
| Validation | Joi |
| API Docs | Swagger UI |
| Frontend | Vite + React.js |
| HTTP Client | Axios |

## Project Structure

```
├── backend/               # Express.js REST API
│   ├── src/
│   │   ├── config/        # DB + Swagger configuration
│   │   ├── middleware/    # Auth, RBAC, validation, error handler
│   │   ├── modules/
│   │   │   ├── auth/      # Register, Login, /me
│   │   │   └── tasks/     # CRUD + Admin endpoints
│   │   └── utils/         # Logger, ApiResponse, ApiError
│   └── server.js
├── frontend/              # Vite + React SPA
│   └── src/
│       ├── api/           # Axios client
│       ├── context/       # AuthContext (JWT state)
│       ├── components/    # Navbar, TaskModal, ProtectedRoute
│       └── pages/         # Login, Register, Dashboard, AdminPanel
└── README.md
```

## Setup & Running

### Prerequisites
- Node.js v18+
- npm

### Backend

```bash
cd backend
cp .env.example .env  # Fill in your values
npm install
npm run dev           # Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # Runs on http://localhost:5173
```

## API Endpoints

### Base URL: `http://localhost:5000/api/v1`

#### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register (add `adminKey` for admin role) |
| POST | `/auth/login` | Public | Login → returns JWT |
| GET | `/auth/me` | Authenticated | Get current user profile |

#### Tasks (User)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/tasks` | User | List own tasks (filter, sort, paginate) |
| GET | `/tasks/:id` | User | Get single task |
| POST | `/tasks` | User | Create task |
| PUT | `/tasks/:id` | User | Update task |
| DELETE | `/tasks/:id` | User | Delete task |

#### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/tasks` | Admin | All tasks across all users |
| DELETE | `/admin/tasks/:id` | Admin | Delete any task |
| GET | `/admin/users` | Admin | All registered users |

### 📚 Swagger UI
Open `http://localhost:5000/api/docs` in your browser after starting the backend.

## Authentication

1. Register or login to get a JWT token
2. Include in request headers:
   ```
   Authorization: Bearer <your_token>
   ```

### Admin Registration
Pass `adminKey` in the register body:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin123",
  "adminKey": "primetrade_admin_secret_2024"
}
```

## Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_KEY=your_admin_key
FRONTEND_URL=http://localhost:5173
```

## Security Features

- ✅ bcrypt password hashing (12 salt rounds)
- ✅ JWT authentication with expiry
- ✅ Role-based access control (user / admin)
- ✅ Helmet.js HTTP security headers
- ✅ CORS configured to frontend origin only
- ✅ Rate limiting on auth routes (100 req / 15 min)
- ✅ Joi input validation & sanitization
- ✅ Parameterized SQL queries (no injection)
- ✅ Global error handling (no stack traces in production)
