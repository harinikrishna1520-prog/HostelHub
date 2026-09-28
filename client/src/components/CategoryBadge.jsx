import React from 'react';
import {
  Droplets,
  Zap,
  Sparkles,
  Bath,
  Wifi,
  Armchair,
  Wrench,
  HelpCircle,
  Bell,
  Utensils,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const CategoryBadge = ({ category, type = 'complaint' }) => {
  const getIcon = () => {
    switch (category) {
      case 'Water':
        return <Droplets size={13} />;
      case 'Electricity':
        return <Zap size={13} />;
      case 'Cleaning':
        return <Sparkles size={13} />;
      case 'Bathroom':
        return <Bath size={13} />;
      case 'Wi-Fi':
        return <Wifi size={13} />;
      case 'Furniture':
        return <Armchair size={13} />;
      case 'Maintenance':
        return <Wrench size={13} />;
      case 'Mess':
        return <Utensils size={13} />;
      case 'Event':
        return <Calendar size={13} />;
      case 'Emergency':
        return <AlertTriangle size={13} />;
      case 'General':
        return <Bell size={13} />;
      default:
        return <HelpCircle size={13} />;
    }
  };

  const getColorClass = () => {
    switch (category) {
      case 'Water':
        return 'cat-cyan';
      case 'Electricity':
        return 'cat-amber';
      case 'Cleaning':
        return 'cat-emerald';
      case 'Bathroom':
        return 'cat-blue';
      case 'Wi-Fi':
        return 'cat-indigo';
      case 'Furniture':
        return 'cat-purple';
      case 'Maintenance':
        return 'cat-orange';
      case 'Emergency':
        return 'cat-red';
      case 'Mess':
        return 'cat-lime';
      case 'Event':
        return 'cat-pink';
      default:
        return 'cat-gray';
    }
  };

  return (
    <span className={`cat-badge ${getColorClass()}`}>
      {getIcon()}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
