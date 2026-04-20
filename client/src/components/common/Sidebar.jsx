import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const icons = {
  dashboard: '▦', jobs: '💼', profile: '👤', applications: '📋',
  users: '👥', reviews: '⭐', browse: '🔍', post: '➕', logout: '⏻',
};

const navsByRole = {
  jobposter: [
    { to: '/poster/dashboard', label: 'Dashboard',   icon: icons.dashboard },
    { to: '/poster/jobs',      label: 'My Jobs',     icon: icons.jobs },
    { to: '/poster/jobs/new',  label: 'Post a Job',  icon: icons.post },
    { to: '/poster/profile',   label: 'Profile',     icon: icons.profile },
  ],
  jobseeker: [
    { to: '/seeker/dashboard',    label: 'Dashboard',    icon: icons.dashboard },
    { to: '/seeker/jobs',         label: 'Browse Jobs',  icon: icons.browse },
    { to: '/seeker/applications', label: 'Applications', icon: icons.applications },
    { to: '/seeker/profile',      label: 'My Profile',   icon: icons.profile },
  ],
  systemadmin: [
    { to: '/admin/dashboard',    label: 'Dashboard',    icon: icons.dashboard },
    { to: '/admin/users',        label: 'Users',        icon: icons.users },
    { to: '/admin/jobs',         label: 'Jobs',         icon: icons.jobs },
    { to: '/admin/applications', label: 'Applications', icon: icons.applications },
    { to: '/admin/reviews',      label: 'Reviews',      icon: icons.reviews },
  ],
};

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navs = navsByRole[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Work<span>Bridge</span></div>
      <nav className="sidebar-nav">
        {navs.map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span>{n.icon}</span> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="avatar">{initials(user?.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ color: 'var(--text3)', fontSize: '.75rem', textTransform: 'capitalize' }}>{user?.role?.replace('systemadmin','Admin')}</div>
        </div>
        <button onClick={handleLogout} title="Logout" style={{ background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:'1.1rem' }}>⏻</button>
      </div>
    </aside>
  );
}
