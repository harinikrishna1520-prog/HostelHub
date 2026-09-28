import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Eye,
  ArrowRight,
  ImageIcon
} from 'lucide-react';

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = [
    'All',
    'Water',
    'Electricity',
    'Cleaning',
    'Bathroom',
    'Wi-Fi',
    'Furniture',
    'Maintenance',
    'Other'
  ];

  const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search.trim() !== '') params.search = search.trim();

      const res = await api.get('/complaints', { params });
      setComplaints(res.data.complaints || []);
      setError('');
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError('Unable to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaint History</h1>
          <p className="page-subtitle">
            View, track, and monitor resolution updates on your submitted issues
          </p>
        </div>
        <Link to="/student/complaints/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Lodge Complaint</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="input-group">
            <span className="input-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search description, room, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input search-input"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div className="filter-group-container">
          <div className="filter-item">
            <label className="filter-label">
              <Filter size={14} className="inline-mr" /> Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading complaints history..." />
      ) : error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No complaints found."
          description={
            search || statusFilter !== 'All' || categoryFilter !== 'All'
              ? 'Try adjusting your search criteria or filter options.'
              : 'You have not submitted any complaints yet. Everything is in order!'
          }
          actionText={
            search || statusFilter !== 'All' || categoryFilter !== 'All'
              ? 'Clear Filters'
              : 'File New Complaint'
          }
          onAction={() => {
            if (search || statusFilter !== 'All' || categoryFilter !== 'All') {
              setSearch('');
              setStatusFilter('All');
              setCategoryFilter('All');
            } else {
              window.location.assign('/student/complaints/new');
            }
          }}
        />
      ) : (
        <div className="complaints-grid">
          {complaints.map((item) => (
            <div key={item._id} className="complaint-card">
              <div className="complaint-card-header">
                <CategoryBadge category={item.category} />
                <StatusBadge status={item.status} />
              </div>

              <div className="complaint-card-body">
                <p className="complaint-card-desc">{item.description}</p>

                <div className="complaint-card-meta">
                  <span className="meta-info">
                    <Calendar size={13} className="inline-mr" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="meta-info room-meta">
                    Room {item.roomNumber} ({item.hostelBlock})
                  </span>
                  {item.image && (
                    <span className="meta-info image-attached-badge" title="Image attached">
                      <ImageIcon size={13} className="inline-mr" /> Photo
                    </span>
                  )}
                </div>
              </div>

              <div className="complaint-card-footer">
                <Link
                  to={`/student/complaints/${item._id}`}
                  className="btn btn-outline btn-block"
                >
                  <Eye size={15} />
                  <span>View Details</span>
                  <ArrowRight size={14} className="ml-auto" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentComplaints;
