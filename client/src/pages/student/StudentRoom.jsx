import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  BedDouble,
  Building,
  Layers,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const StudentRoom = () => {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms/my-room');
      setRoom(res.data.room);
      setError('');
    } catch (err) {
      console.error('Failed to load room details:', err);
      setError(
        err.response?.data?.message || 'Unable to retrieve your room details. Please contact the hostel office.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching room assignment information..." />;
  }

  if (error && !room) {
    return (
      <div className="page-container">
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <EmptyState
          icon={BedDouble}
          title="No Room Assigned"
          description="Your profile currently has no verified room record in the database. Please request the warden to assign your room."
        />
      </div>
    );
  }

  const occupants = room?.occupants || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Room Information</h1>
          <p className="page-subtitle">
            Verified room allocation details and roommates directory
          </p>
        </div>
        <div>
          <StatusBadge status={room?.status || 'Available'} type="room" />
        </div>
      </div>

      <div className="room-overview-grid">
        {/* Primary Room Card */}
        <div className="card room-main-card">
          <div className="room-hero-badge">
            <BedDouble size={28} />
            <div>
              <span className="room-hero-tag">ALLOTMENT</span>
              <h2 className="room-hero-title">
                {room?.hostelBlock} — Room {room?.roomNumber}
              </h2>
            </div>
          </div>

          <div className="room-specs-grid">
            <div className="room-spec-item">
              <span className="room-spec-icon">
                <Building size={20} />
              </span>
              <div>
                <span className="room-spec-label">Hostel Block</span>
                <p className="room-spec-val">{room?.hostelBlock || 'N/A'}</p>
              </div>
            </div>

            <div className="room-spec-item">
              <span className="room-spec-icon">
                <BedDouble size={20} />
              </span>
              <div>
                <span className="room-spec-label">Room Number</span>
                <p className="room-spec-val">{room?.roomNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="room-spec-item">
              <span className="room-spec-icon">
                <Sparkles size={20} />
              </span>
              <div>
                <span className="room-spec-label">Room Type</span>
                <p className="room-spec-val">{room?.roomType || 'Standard'}</p>
              </div>
            </div>

            <div className="room-spec-item">
              <span className="room-spec-icon">
                <Layers size={20} />
              </span>
              <div>
                <span className="room-spec-label">Floor</span>
                <p className="room-spec-val">Floor {room?.floor ?? 1}</p>
              </div>
            </div>

            <div className="room-spec-item">
              <span className="room-spec-icon">
                <Users size={20} />
              </span>
              <div>
                <span className="room-spec-label">Room Capacity</span>
                <p className="room-spec-val">{room?.capacity || 2} Students</p>
              </div>
            </div>

            <div className="room-spec-item">
              <span className="room-spec-icon">
                <ShieldCheck size={20} />
              </span>
              <div>
                <span className="room-spec-label">Status</span>
                <p className="room-spec-val">{room?.status || 'Active'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Room Occupants Section */}
        <div className="card">
          <div className="card-header flex-between">
            <div className="card-title-group">
              <h2 className="card-title">Current Occupants</h2>
              <p className="card-subtitle">
                {occupants.length} of {room?.capacity || 2} beds occupied
              </p>
            </div>
            <span className="occupancy-pill">
              {occupants.length} / {room?.capacity || 2}
            </span>
          </div>

          <div className="card-body">
            {occupants.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No occupants listed"
                description="There are currently no registered occupants in this room record."
              />
            ) : (
              <div className="occupants-list">
                {occupants.map((occ, idx) => {
                  const isCurrentUser =
                    occ._id === user?._id || occ.email === user?.email;
                  return (
                    <div
                      key={occ._id || idx}
                      className={`occupant-card ${
                        isCurrentUser ? 'occupant-current-user' : ''
                      }`}
                    >
                      <div className="occupant-avatar">
                        {occ.name ? occ.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="occupant-details">
                        <div className="occupant-name-row">
                          <h4 className="occupant-name">{occ.name}</h4>
                          {isCurrentUser && (
                            <span className="you-pill">You</span>
                          )}
                        </div>
                        <div className="occupant-contact-info">
                          <span className="contact-item">
                            <Mail size={13} className="inline-mr" />
                            {occ.email}
                          </span>
                          {occ.phone && (
                            <span className="contact-item">
                              <Phone size={13} className="inline-mr" />
                              {occ.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRoom;
