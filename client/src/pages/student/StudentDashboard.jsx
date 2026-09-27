import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCircle,
  BedDouble,
  Bell,
  ArrowRight,
  PlusCircle,
  Calendar,
  Building
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/student');
      setData(res.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard..." />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={20} />
        <span>{error}</span>
        <button onClick={fetchDashboardData} className="btn btn-sm btn-outline ml-auto">
          Retry
        </button>
      </div>
    );
  }

  const { stats, recentComplaints, latestNotices, room } = data || {};

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-tag">RESIDENT STUDENT PORTAL</span>
          <h1 className="welcome-title">Welcome, {user?.name}!</h1>
          <p className="welcome-subtitle">
            Here is your live hostel activity overview and complaint tracking center.
          </p>
        </div>
        <div className="welcome-room-card">
          <div className="welcome-room-icon">
            <BedDouble size={26} />
          </div>
          <div>
            <span className="room-card-label">Assigned Room</span>
            <h3 className="room-card-val">
              {user?.roomNumber ? `Room ${user.roomNumber}` : 'Not Assigned'}
            </h3>
            <span className="room-card-block">{user?.hostelBlock || 'Hostel Block'}</span>
          </div>
        </div>
      </div>

      {/* Complaint Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon-wrapper">
            <AlertCircle size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Total Complaints</span>
            <h3 className="stat-number">{stats?.total ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Pending</span>
            <h3 className="stat-number">{stats?.pending ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card stat-progress">
          <div className="stat-icon-wrapper">
            <RefreshCw size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">In Progress</span>
            <h3 className="stat-number">{stats?.inProgress ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card stat-resolved">
          <div className="stat-icon-wrapper">
            <CheckCircle size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Resolved</span>
            <h3 className="stat-number">{stats?.resolved ?? 0}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Complaints + Latest Notices */}
      <div className="dashboard-grid-2">
        {/* Recent Complaints Section */}
        <div className="card">
          <div className="card-header flex-between">
            <div className="card-title-group">
              <h2 className="card-title">Recent Complaints</h2>
              <p className="card-subtitle">Your latest logged maintenance issues</p>
            </div>
            <Link to="/student/complaints/new" className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>New Complaint</span>
            </Link>
          </div>

          <div className="card-body">
            {!recentComplaints || recentComplaints.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No complaints filed yet"
                description="Everything seems to be working fine in your room."
                actionText="File a Complaint"
                onAction={() => window.location.assign('/student/complaints/new')}
              />
            ) : (
              <div className="complaints-list">
                {recentComplaints.map((item) => (
                  <div key={item._id} className="complaint-list-item">
                    <div className="complaint-item-left">
                      <div className="flex-align-gap mb-1">
                        <CategoryBadge category={item.category} />
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="complaint-item-desc">{item.description}</p>
                      <span className="complaint-item-date">
                        <Calendar size={12} className="inline-mr" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <Link
                      to={`/student/complaints/${item._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      <span>Track</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentComplaints && recentComplaints.length > 0 && (
            <div className="card-footer text-right">
              <Link to="/student/complaints" className="card-footer-link">
                View all complaints <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Latest Notices Section */}
        <div className="card">
          <div className="card-header flex-between">
            <div className="card-title-group">
              <h2 className="card-title">Latest Hostel Notices</h2>
              <p className="card-subtitle">Official announcements from administration</p>
            </div>
            <Link to="/student/notices" className="btn btn-outline btn-sm">
              <Bell size={15} />
              <span>All Notices</span>
            </Link>
          </div>

          <div className="card-body">
            {!latestNotices || latestNotices.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notices available"
                description="There are currently no active announcements from the warden."
              />
            ) : (
              <div className="notices-list">
                {latestNotices.map((notice) => (
                  <div key={notice._id} className="notice-card-item">
                    <div className="flex-between mb-1">
                      <CategoryBadge category={notice.category} type="notice" />
                      <span className="notice-date">
                        {new Date(notice.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h4 className="notice-item-title">{notice.title}</h4>
                    <p className="notice-item-desc">{notice.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {latestNotices && latestNotices.length > 0 && (
            <div className="card-footer text-right">
              <Link to="/student/notices" className="card-footer-link">
                View notice board <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
