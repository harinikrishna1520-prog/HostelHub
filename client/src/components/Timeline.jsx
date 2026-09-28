import React from 'react';
import { Check, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

const Timeline = ({ currentStatus, submittedDate, updatedDate }) => {
  // Define the ordered steps
  const steps = [
    {
      key: 'Submitted',
      label: 'Complaint Submitted',
      sublabel: submittedDate ? new Date(submittedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Logged',
      icon: Check
    },
    {
      key: 'Pending',
      label: 'Pending Review',
      sublabel: 'Awaiting admin assignment',
      icon: Clock
    },
    {
      key: 'In Progress',
      label: 'In Progress',
      sublabel: 'Maintenance team dispatched',
      icon: RefreshCw
    },
    {
      key: 'Resolved',
      label: 'Resolved',
      sublabel: currentStatus === 'Resolved' && updatedDate ? new Date(updatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Work completed',
      icon: CheckCircle2
    }
  ];

  // Determine stage progression index:
  // Submitted: index 0
  // Pending: index 1
  // In Progress: index 2
  // Resolved: index 3
  const getActiveIndex = () => {
    switch (currentStatus) {
      case 'Pending':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
        return 3;
      default:
        return 1;
    }
  };

  const activeIndex = getActiveIndex();

  return (
    <div className="timeline-container">
      <div className="timeline-track">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`timeline-step ${
                isCompleted ? 'step-completed' : ''
              } ${isCurrent ? 'step-current' : ''}`}
            >
              <div className="timeline-node">
                <Icon size={16} />
              </div>
              <div className="timeline-content">
                <h4 className="timeline-step-title">{step.label}</h4>
                <span className="timeline-step-sublabel">{step.sublabel}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`timeline-line ${
                    idx < activeIndex ? 'line-completed' : ''
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
