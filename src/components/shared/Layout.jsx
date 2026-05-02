import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const ICONS = {
  dashboard: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>),
  projects:  (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 3h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>),
  teams:     (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 20v-1a6 6 0 0112 0v1"/><circle cx="18" cy="8" r="2.5"/><path d="M22 20v-.5a4.5 4.5 0 00-6-4.24"/></svg>),
  tasks:     (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/></svg>),
  users:     (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>),
  profile:   (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a8 8 0 0116 0v1"/></svg>),
  logout:    (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>),
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { to: '/projects',  label: 'Projects',  icon: ICONS.projects  },
    { to: '/teams',     label: 'Teams',     icon: ICONS.teams     },
    { to: '/my-tasks',  label: 'My Tasks',  icon: ICONS.tasks     },
    ...(user?.role === 'admin' ? [{ to: '/users', label: 'Users', icon: ICONS.users }] : []),
    { to: '/profile',   label: 'Profile',   icon: ICONS.profile   },
  ];

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">PF</div>
          <span className="logo-text">ProjectFlow</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar-sm">{initials}</div>
            <div className="user-meta">
              <div className="user-name">{user?.name}</div>
              <div className={`user-role ${user?.role}`}>{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            {ICONS.logout}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper animate-fade">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
