import React from 'react';
import { Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status, type = 'complaint' }) => {
  if (type === 'complaint') {
    switch (status) {
      case 'Pending':
        return (
          <span className="badge badge-pending">
            <Clock size={13} className="badge-icon" />
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="badge badge-in-progress">
            <RefreshCw size={13} className="badge-icon spin-slow" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="badge badge-resolved">
            <CheckCircle size={13} className="badge-icon" />
            Resolved
          </span>
        );
      default:
        return <span className="badge badge-default">{status || 'Unknown'}</span>;
    }
  }

  // Room status badges
  switch (status) {
    case 'Available':
      return (
        <span className="badge badge-available">
          <CheckCircle size={13} className="badge-icon" />
          Available
        </span>
      );
    case 'Partially Occupied':
      return (
        <span className="badge badge-partial">
          <Clock size={13} className="badge-icon" />
          Partially Occupied
        </span>
      );
    case 'Full':
      return (
        <span className="badge badge-full">
          <AlertCircle size={13} className="badge-icon" />
          Full
        </span>
      );
    case 'Maintenance':
      return (
        <span className="badge badge-maintenance">
          <RefreshCw size={13} className="badge-icon" />
          Maintenance
        </span>
      );
    default:
      return <span className="badge badge-default">{status || 'Available'}</span>;
  }
};

export default StatusBadge;
