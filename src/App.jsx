import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TeamsPage from './pages/TeamsPage';
import UsersPage from './pages/UsersPage';
import MyTasksPage from './pages/MyTasksPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/shared/Layout';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2330',
              color: '#e8ecf5',
              border: '1px solid #252b3b',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e2330' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e2330' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="my-tasks" element={<MyTasksPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="users" element={<RequireAdmin><UsersPage /></RequireAdmin>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
