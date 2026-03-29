# DESK — IT Helpdesk System

A full-stack IT helpdesk ticketing system built with React, Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | React 18, Tailwind CSS, Axios, React Router v6       |
| Backend    | Node.js, Express.js, MVC architecture                |
| Database   | MongoDB with Mongoose ODM                            |
| Auth       | JWT (jsonwebtoken) + bcryptjs password hashing       |
| File Upload| Multer (local storage, swappable to AWS S3)          |
| Charts     | Recharts                                             |
| Validation | express-validator + client-side form validation      |

---

## Project Structure

```
helpdesk/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Login, register, profile, password
│   │   ├── ticketController.js  # Full CRUD + stats
│   │   └── otherControllers.js  # Comments, users, notifications, audit
│   ├── middleware/
│   │   ├── auth.js              # JWT protect + role authorize
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── notFound.js          # 404 handler
│   │   └── upload.js            # Multer config (10MB, 5 files)
│   ├── models/
│   │   ├── User.js              # User schema (bcrypt, JWT)
│   │   ├── Ticket.js            # Ticket schema (auto-ID, attachments)
│   │   └── index.js             # Comment, Notification, AuditLog schemas
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── comments.js
│   │   ├── users.js
│   │   ├── notifications.js
│   │   ├── audit.js
│   │   └── uploads.js
│   ├── utils/
│   │   └── seeder.js            # Database seeder
│   ├── uploads/                 # Uploaded files (auto-created)
│   ├── server.js                # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── index.js         # Axios instance + all API calls
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── AdminUsersPage.jsx
    │   │   │   └── AuditTrailPage.jsx
    │   │   ├── common/
    │   │   │   └── index.jsx    # Badge, Avatar, Modal, etc.
    │   │   ├── dashboard/
    │   │   │   ├── Dashboard.jsx
    │   │   │   └── ReportsPage.jsx
    │   │   ├── layout/
    │   │   │   └── AppLayout.jsx  # Sidebar + Topbar + Bell
    │   │   └── tickets/
    │   │       ├── NewTicketModal.jsx
    │   │       ├── TicketDetailModal.jsx
    │   │       └── TicketsTable.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── NotificationContext.jsx
    │   ├── pages/
    │   │   ├── AuthPages.jsx    # Login + Register
    │   │   └── ProfilePage.jsx
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx              # Router + protected routes
    │   ├── index.css            # Tailwind + custom utilities
    │   └── index.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and install

```bash
# Install all dependencies
npm run install:all

# Or manually:
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/helpdesk_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:3000
```

### 3. Seed the database

```bash
npm run seed
```

This creates 7 users and 8 sample tickets with comments and audit logs.

### 4. Run development servers

```bash
# Run both frontend and backend simultaneously
npm run dev

# Or separately:
npm run dev:backend    # → http://localhost:5000
npm run dev:frontend   # → http://localhost:3000
```

---

## Demo Accounts

| Role        | Email                | Password    |
|-------------|----------------------|-------------|
| Employee    | sarah@company.com    | password123 |
| Employee    | mike@company.com     | password123 |
| Employee    | lindi@company.com    | password123 |
| Technician  | alex@company.com     | password123 |
| Technician  | priya@company.com    | password123 |
| Admin       | david@company.com    | password123 |

---

## API Reference

### Authentication
| Method | Endpoint                     | Access  | Description          |
|--------|------------------------------|---------|----------------------|
| POST   | /api/auth/register           | Public  | Register new employee |
| POST   | /api/auth/login              | Public  | Login + get JWT      |
| GET    | /api/auth/me                 | Private | Get current user     |
| PUT    | /api/auth/profile            | Private | Update profile       |
| PUT    | /api/auth/change-password    | Private | Change password      |

### Tickets
| Method | Endpoint              | Access           | Description              |
|--------|-----------------------|------------------|--------------------------|
| GET    | /api/tickets          | Private          | List (role-scoped)       |
| POST   | /api/tickets          | Private          | Create ticket            |
| GET    | /api/tickets/:id      | Private          | Get ticket detail        |
| PUT    | /api/tickets/:id      | Private          | Update ticket            |
| DELETE | /api/tickets/:id      | Admin only       | Delete ticket            |
| GET    | /api/tickets/stats    | Tech + Admin     | Get analytics stats      |

### Comments
| Method | Endpoint                   | Access   | Description         |
|--------|----------------------------|----------|---------------------|
| GET    | /api/comments/:ticketId    | Private  | Get ticket comments |
| POST   | /api/comments/:ticketId    | Private  | Add comment         |
| DELETE | /api/comments/:id          | Private  | Delete comment      |

### Users (Admin)
| Method | Endpoint               | Access | Description         |
|--------|------------------------|--------|---------------------|
| GET    | /api/users             | Admin  | List all users      |
| POST   | /api/users             | Admin  | Create user         |
| PUT    | /api/users/:id         | Admin  | Update user         |
| PATCH  | /api/users/:id/toggle  | Admin  | Toggle active status |
| GET    | /api/users/technicians | Staff  | List technicians    |

### Notifications
| Method | Endpoint                | Access  | Description           |
|--------|-------------------------|---------|-----------------------|
| GET    | /api/notifications      | Private | Get my notifications  |
| PUT    | /api/notifications/read | Private | Mark read             |

### Audit Logs
| Method | Endpoint    | Access | Description    |
|--------|-------------|--------|----------------|
| GET    | /api/audit  | Admin  | Get audit logs |

---

## Role Permissions

| Feature                          | Employee | Technician | Admin |
|----------------------------------|----------|------------|-------|
| Submit tickets                   | ✅       | ✅         | ✅    |
| View own tickets                 | ✅       | ✅         | ✅    |
| View all tickets                 | ❌       | ✅         | ✅    |
| Update ticket status/assignment  | ❌       | ✅         | ✅    |
| Add internal notes               | ❌       | ✅         | ✅    |
| View internal notes              | ❌       | ✅         | ✅    |
| Add resolution notes             | ❌       | ✅         | ✅    |
| View reports & analytics         | ❌       | ✅         | ✅    |
| Manage users                     | ❌       | ❌         | ✅    |
| View audit trail                 | ❌       | ❌         | ✅    |
| Delete tickets                   | ❌       | ❌         | ✅    |

---

## File Upload

- Handled by **Multer** middleware
- Max file size: **10MB** per file
- Max files per ticket: **5**
- Allowed types: Images (PNG, JPG, GIF, WebP), PDF, Word (.doc/.docx), Plain text
- Files stored in `backend/uploads/` directory
- Accessible at `http://localhost:5000/uploads/<filename>`

### Switching to AWS S3
Replace the `multer.diskStorage` in `middleware/upload.js` with `multer-s3`:
```js
const multerS3 = require('multer-s3');
const s3 = new S3Client({ region: process.env.AWS_REGION });
const storage = multerS3({ s3, bucket: process.env.S3_BUCKET, key: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) });
```

---

## Security Features

- JWT authentication with 7-day expiry
- bcrypt password hashing (salt rounds: 12)
- Helmet.js HTTP security headers
- Rate limiting (200 req / 15 min per IP)
- CORS restricted to frontend origin
- Role-based route protection (middleware)
- Input validation with express-validator
- Mongoose schema-level validation
- File type whitelist + size limits
- No sensitive fields in API responses

---

## Production Deployment

### Backend (e.g. Railway, Render, DigitalOcean)
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<strong-random-string>
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend (e.g. Vercel, Netlify)
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
```
Update `frontend/package.json` proxy or configure your hosting to proxy `/api` requests.
