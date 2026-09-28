import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { Loading } from './components/Primitives.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { ComplaintDetailPage, ComplaintsPage, NewComplaintPage } from './pages/ComplaintsPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import NoticesPage from './pages/NoticesPage.jsx';
import { RoomsPage, StudentsPage } from './pages/AdminPages.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function Protected({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading label="Restoring your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  return <AppLayout />;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<Protected role="student" />}>
      <Route path="/student/dashboard" element={<DashboardPage />} />
      <Route path="/student/room" element={<RoomPage />} />
      <Route path="/student/complaints" element={<ComplaintsPage />} />
      <Route path="/student/complaints/new" element={<NewComplaintPage />} />
      <Route path="/student/complaints/:id" element={<ComplaintDetailPage />} />
      <Route path="/student/notices" element={<NoticesPage />} />
      <Route path="/student/profile" element={<ProfilePage />} />
    </Route>
    <Route element={<Protected role="admin" />}>
      <Route path="/admin/dashboard" element={<DashboardPage admin />} />
      <Route path="/admin/complaints" element={<ComplaintsPage admin />} />
      <Route path="/admin/complaints/:id" element={<ComplaintDetailPage admin />} />
      <Route path="/admin/students" element={<StudentsPage />} />
      <Route path="/admin/rooms" element={<RoomsPage />} />
      <Route path="/admin/notices" element={<NoticesPage admin />} />
      <Route path="/admin/profile" element={<ProfilePage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}