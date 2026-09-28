import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = '',
  actionText = '',
  onAction = null
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-circle">
        <Icon size={32} />
      </div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm mt-3">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
