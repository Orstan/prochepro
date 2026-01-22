import React from 'react';

interface TaskUrgencyBadgeProps {
  isUrgent?: boolean;
  deadline?: string | Date;
  createdAt?: string | Date;
  className?: string;
}

const TaskUrgencyBadge: React.FC<TaskUrgencyBadgeProps> = ({
  isUrgent = false,
  deadline,
  createdAt,
  className = '',
}) => {
  // Calculate urgency based on deadline or creation time
  const calculateUrgency = (): { isHot: boolean; label: string; color: string } => {
    // If explicitly marked as urgent
    if (isUrgent) {
      return {
        isHot: true,
        label: 'Urgent - Aujourd\'hui',
        color: 'bg-red-500',
      };
    }
    
    // If has deadline
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        return {
          isHot: true,
          label: 'Urgent - Aujourd\'hui',
          color: 'bg-red-500',
        };
      } else if (diffDays === 1) {
        return {
          isHot: true,
          label: 'Urgent - Demain',
          color: 'bg-red-500',
        };
      } else if (diffDays <= 2) {
        return {
          isHot: true,
          label: 'Bientôt - 2 jours',
          color: 'bg-orange-500',
        };
      }
    }
    
    // If recently created (within last 2 hours)
    if (createdAt) {
      const creationDate = new Date(createdAt);
      const now = new Date();
      const diffTime = now.getTime() - creationDate.getTime();
      const diffHours = diffTime / (1000 * 60 * 60);
      
      if (diffHours <= 2) {
        return {
          isHot: true,
          label: 'Nouveau',
          color: 'bg-emerald-500',
        };
      }
    }
    
    // Default - not urgent
    return {
      isHot: false,
      label: '',
      color: '',
    };
  };
  
  const urgency = calculateUrgency();
  
  if (!urgency.isHot) {
    return null;
  }
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className={`flex items-center gap-1 rounded-full ${urgency.color} px-2 py-0.5 text-xs font-medium text-white`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        {urgency.label}
      </span>
    </div>
  );
};

export default TaskUrgencyBadge;
