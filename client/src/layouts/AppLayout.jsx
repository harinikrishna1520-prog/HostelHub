import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const studentItems = [
  ['Dashboard', '/student/dashboard', '◫'], ['My room', '/student/room', '⌂'], ['Complaints', '/student/complaints', '≡'], ['Notices', '/student/notices', '▤'], ['Profile', '/student/profile', '○']
];
const adminItems = [
  ['Dashboard', '/admin/dashboard', '◫'], ['Complaints', '/admin/complaints', '≡'], ['Students', '/admin/students', '♧'], ['Rooms', '/admin/rooms', '⌂'], ['Notices', '/admin/notices', '▤'], ['Profile', '/admin/profile', '○']
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin';
  const items = isAdmin ? adminItems : studentItems;
  function logout() { signOut(); navigate('/login'); }

  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="brand"><span className="brand-mark">H</span><span>hostel<span className="brand-light">hub</span><small>SMART HOSTEL LIVING</small></span></NavLink>
      <div className="nav-label">WORKSPACE</div>
      <nav className="side-nav">{items.map(([label, to, icon]) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><span className="nav-icon">{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-note"><span className="help-dot" /><span>Everything in<br />one place.</span></div><button className="nav-item logout-button" onClick={logout}><span className="nav-icon">↪</span>Sign out</button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-context">{isAdmin ? 'ADMINISTRATION' : 'STUDENT PORTAL'} <span> / </span> {items.find(([, to]) => location.pathname === to || (to !== '/student/dashboard' && to !== '/admin/dashboard' && location.pathname.startsWith(to)))?.[0] || 'OVERVIEW'}</div><div className="top-user"><span className="online-dot" /><div><strong>{user.name}</strong><small>{isAdmin ? 'Hostel administrator' : `Room ${user.roomNumber || '—'} · Block ${user.hostelBlock || '—'}`}</small></div><span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span></div></header>
      <div className="page-wrap"><Outlet /></div>
    </main>
  </div>;
}