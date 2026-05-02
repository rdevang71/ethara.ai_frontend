# Project Flow

**A Collaborative Project & Task Management System**

A full-stack web application for managing projects, tasks, and teams with role-based access control. Built with React + Vite (frontend) and Node.js + Express (backend), deployed on Vercel and Render.

---

## 🚀 Live Application

- **Frontend**: [https://etharaaifrontend.vercel.app](https://etharaaifrontend.vercel.app)
- **Backend API**: [https://ethara-ai-backend-gxo6.onrender.com](https://ethara-ai-backend-gxo6.onrender.com)

---

## ✨ Key Features

### User Management
- Secure authentication with JWT tokens
- Role-based access control (User / Admin)
- User profiles and team assignments
- Admin dashboard for user management

### Project Management
- Create, update, and delete projects
- Assign projects to teams
- Track status (planning, active, on-hold, completed)
- Priority levels (low, medium, high, critical)
- Real-time progress tracking
- Assign team members to projects

### Task Management
- Create and manage tasks within projects
- Task status tracking (todo, in-progress, review, done)
- Priority levels and due dates
- Assign tasks to team members
- Progress indicators
- Admins can manage all tasks; users can update their own

### Team Organization
- Create and manage teams
- Add/remove team members
- Team-based project organization

### Dashboard
- Overview of recent activities
- Task summary and metrics
- Quick access to key information

---

## 🏗️ Architecture

```
Frontend (Vercel)          Backend (Render)
├── React + Vite      ←→   ├── Express.js
├── Axios API Client       ├── MongoDB
└── React Router           └── JWT Auth
```

**Database**: MongoDB Atlas

---

## 💻 Tech Stack

### Frontend
- React 18, Vite, Axios, React Router, React Hot Toast

### Backend
- Node.js, Express.js, MongoDB, Mongoose, JWT

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
# Create .env with: PORT=5000, MONGODB_URI=..., JWT_SECRET=...
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env with: VITE_API_URL=http://localhost:5000
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project (admin) |
| GET | `/api/tasks/my` | Get my tasks |
| GET | `/api/tasks` | Get all tasks (admin) |
| POST | `/api/tasks` | Create task (admin) |

---

## ⚙️ Environment Variables

### Backend
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_ORIGINS=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
```

---

## 🌐 Deployment

### Vercel (Frontend)
- Root Directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Set `VITE_API_URL` env variable

### Render (Backend)
- Set `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_ORIGINS`
- Auto-deploys on push to main

---

## 👥 User Roles

### User
- View assigned projects/tasks
- Update own tasks and profile

### Admin
- Full access to all projects, tasks, users, teams
- Create and manage all resources

---

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage
- Sent with each request: `Authorization: Bearer <token>`

---

## 📊 Database Models

- **User**: name, email, password, role, team, isActive
- **Team**: name, description, members, color
- **Project**: name, description, status, priority, team, assignedTo, progress
- **Task**: title, description, status, priority, project, assignedTo, progress

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Set `VITE_API_URL` in Vercel, set `FRONTEND_ORIGINS` on backend |
| Login 404 | Verify backend URL in `VITE_API_URL` |
| Build fails | Vite script uses Node path to avoid permission issues |
| Tasks missing | Check if logged in as admin, refresh page |

---

## 📝 Recent Updates

✅ Admin task management  
✅ Team dropdown fixes  
✅ Robust CORS configuration  
✅ Environment variable configuration  
✅ Deployment ready  

---

## 📚 More Information

- Backend: See `backend/README.txt`
- Frontend: See `frontend/README.txt`
- Deployment: See `frontend/DEPLOY.md`

---

**Last Updated**: May 2, 2026
