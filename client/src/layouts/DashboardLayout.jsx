import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BedDouble,
  AlertCircle,
  Bell,
  User,
  Users,
  Building,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/room', label: 'My Room', icon: BedDouble },
    { to: '/student/complaints', label: 'Complaints', icon: AlertCircle },
    { to: '/student/notices', label: 'Notices', icon: Bell },
    { to: '/student/profile', label: 'Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/rooms', label: 'Rooms', icon: Building },
    { to: '/admin/notices', label: 'Notices', icon: Bell },
    { to: '/admin/profile', label: 'Profile', icon: User }
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="layout-root">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <Building size={22} />
          </div>
          <div className="brand-text-container">
            <span className="brand-title">HostelHub</span>
            <span className="brand-badge">
              {isAdmin ? (
                <>
                  <ShieldCheck size={11} className="inline-mr" /> Admin
                </>
              ) : (
                <>
                  <GraduationCap size={11} className="inline-mr" /> Student
                </>
              )}
            </span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN MENU</div>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith('/dashboard') || item.to.endsWith('/room') || item.to.endsWith('/profile')}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-mini-info">
              <span className="user-mini-name">{user?.name}</span>
              <span className="user-mini-role">
                {user?.role === 'admin'
                  ? 'Administrator'
                  : `${user?.hostelBlock || 'Hostel'} • Room ${user?.roomNumber || 'N/A'}`}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              <Menu size={22} />
            </button>
            <h2 className="topbar-welcome">
              Welcome back, <span className="font-semibold text-primary">{user?.name}</span>
            </h2>
          </div>

          <div className="topbar-right">
            {!isAdmin && user?.roomNumber && (
              <div className="topbar-room-pill">
                <span className="pill-dot"></span>
                <span>{user.hostelBlock} — Room {user.roomNumber}</span>
              </div>
            )}
            <div className="topbar-role-badge">
              {isAdmin ? 'Hostel Warden / Admin' : 'Resident Student'}
            </div>
          </div>
        </header>

        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
