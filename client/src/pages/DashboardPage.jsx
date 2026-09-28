import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ComplaintLink, DateText, EmptyState, Loading, PageHeading, StatusBadge } from '../components/Primitives.jsx';

const studentStats = [['total', 'All complaints', '01'], ['pending', 'Awaiting action', '02'], ['inProgress', 'Being handled', '03'], ['resolved', 'Resolved', '04']];
const adminStats = [['totalStudents', 'Students', '01'], ['totalRooms', 'Rooms', '02'], ['totalComplaints', 'Complaints', '03'], ['pending', 'Awaiting action', '04'], ['inProgress', 'In progress', '05'], ['resolved', 'Resolved', '06']];

function Metric({ index, label, value, tone }) { return <div className={`metric metric-${tone || 'mint'}`}><div className="metric-top"><span>{index}</span><span className="metric-mark">↗</span></div><strong>{value ?? '—'}</strong><small>{label}</small></div>; }

export default function DashboardPage({ admin = false }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/dashboard/${admin ? 'admin' : 'student'}`).then(({ data: result }) => setData(result)).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load dashboard.')); }, [admin]);
  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <Loading label="Loading dashboard…" />;
  const stats = admin ? adminStats : studentStats;
  const values = admin ? data.statistics : { ...data.statistics };

  return <div className={`dashboard-page ${admin ? 'admin-dashboard' : 'student-dashboard'}`}>
    <PageHeading eyebrow={admin ? 'HOSTEL OVERVIEW' : `YOUR SPACE · ${user.hostelBlock || 'HOSTEL'}`} title={admin ? 'Good morning.' : `Welcome, ${user.name.split(' ')[0]}.`} subtitle={admin ? 'A clear view of what’s happening across your hostel.' : 'Here’s what’s happening in your corner of the hostel.'} action={!admin && <Link className="button button-dark" to="/student/complaints/new">＋ New complaint</Link>} />
    {!admin && <div className="room-banner"><div className="room-banner-icon">⌂</div><div><span>YOUR ROOM</span><strong>{user.roomNumber || 'Not assigned'} <small>·</small> Block {user.hostelBlock || '—'}</strong></div><Link to="/student/room">Room details <span>↗</span></Link></div>}
    <section className="metric-grid">{stats.map(([key, label, index], position) => <Metric key={key} index={index} label={label} value={values[key]} tone={['mint', 'peach', 'lilac', 'yellow', 'blue', 'rose'][position]} />)}</section>
    <section className="dashboard-grid"><div className="section-panel"><div className="section-head"><div><span className="eyebrow">{admin ? 'LATEST ACTIVITY' : 'YOUR ACTIVITY'}</span><h2>{admin ? 'Recent complaints' : 'Recent complaints'}</h2></div><Link to={admin ? '/admin/complaints' : '/student/complaints'}>See all <span>↗</span></Link></div>{data.recentComplaints.length ? <div className="recent-list">{data.recentComplaints.map((complaint) => <div className="recent-row" key={complaint._id}><span className="category-icon">{complaint.category.slice(0, 1)}</span><div className="recent-description"><strong>{complaint.category}</strong><small>{admin ? `${complaint.student?.name || 'Student'} · ` : ''}{complaint.roomNumber} · {complaint.hostelBlock} <span>·</span> <DateText value={complaint.createdAt} /></small></div><StatusBadge status={complaint.status} />{!admin && <ComplaintLink complaint={complaint} />}</div>)}</div> : <EmptyState>No complaints found.</EmptyState>}</div>
      <div className="section-panel notice-peek"><div className="section-head"><div><span className="eyebrow">BULLETIN</span><h2>Latest notices</h2></div><Link to={admin ? '/admin/notices' : '/student/notices'}>See all <span>↗</span></Link></div>{data.latestNotices?.length ? data.latestNotices.map((notice) => <Link className="notice-peek-row" to={admin ? '/admin/notices' : '/student/notices'} key={notice._id}><span className={`notice-symbol notice-${notice.category.toLowerCase()}`}>{notice.category.slice(0, 1)}</span><span><strong>{notice.title}</strong><small>{notice.category} <span>·</span> <DateText value={notice.createdAt} /></small></span></Link>) : <EmptyState>No notices available.</EmptyState>}</div></section>
  </div>;
}