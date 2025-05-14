import React, { useState } from 'react';
import { format } from 'date-fns';

/**
 * MilestoneCard - Displays an individual milestone in the progress map
 */
const MilestoneCard = ({ milestone, currentAmount, targetAmount, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate percentage of target
  const percentage = (milestone.amount / targetAmount) * 100;
  
  // Check if milestone is achieved
  const isAchieved = milestone.achieved || currentAmount >= milestone.amount;

  // Calculate progress towards this milestone
  const milestoneProgress = Math.min(100, Math.max(0, (currentAmount / milestone.amount) * 100));

  return (
    <div className="flex flex-col items-center">
      {/* Milestone marker */}
      <div 
        className={`relative cursor-pointer ${isAchieved ? 'animate-pulse' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Vertical line */}
        <div className="absolute top-0 left-1/2 h-10 w-0.5 -mt-10 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2" />
        
        {/* Badge */}
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 relative ${
            isAchieved 
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <span className="text-lg">{milestone.icon}</span>
          
          {/* Checkmark for achieved milestones */}
          {isAchieved && (
            <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
              <span className="text-xs">✓</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Milestone label */}
      <div 
        className="text-center cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <p className={`text-sm font-medium ${isAchieved ? 'text-green-600 dark:text-green-400' : 'dark:text-white'}`}>
          {milestone.title}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {formatCurrency(milestone.amount)}
        </p>
      </div>
      
      {/* Detailed information */}
      {showDetails && (
        <div className="absolute mt-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 w-64">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold dark:text-white">{milestone.title}</h3>
            <div className="flex space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(milestone);
                }}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span role="img" aria-label="Edit">✏️</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this milestone?')) {
                    onDelete(milestone.id);
                  }
                }}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <span role="img" aria-label="Delete">🗑️</span>
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">{milestone.description}</p>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between mb-1 text-xs">
              <span className="font-medium dark:text-white">Progress</span>
              <span className="text-gray-600 dark:text-gray-400">{milestoneProgress.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isAchieved ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-xs font-medium dark:text-white">Reward</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{milestone.reward}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Amount</p>
              <p className="font-semibold dark:text-white">{formatCurrency(milestone.amount)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Percentage</p>
              <p className="font-semibold dark:text-white">{percentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Status</p>
              <p className={`font-semibold ${isAchieved ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'}`}>
                {isAchieved ? 'Achieved' : 'In Progress'}
              </p>
            </div>
            {milestone.achieved && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Date Achieved</p>
                <p className="font-semibold dark:text-white">
                  {format(new Date(milestone.achievedDate), 'MMM d, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Click anywhere to close */}
          <div 
            className="fixed inset-0 h-full w-full z-0"
            onClick={() => setShowDetails(false)}
          />
        </div>
      )}
    </div>
  );
};

export default MilestoneCard; 