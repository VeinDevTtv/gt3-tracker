import React from 'react';

const ProgressBar = ({ percentage, theme = 'light' }) => {
  return (
    <div className="mb-4">
      <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>0%</span>
        <span className="text-primary-color font-medium">{percentage.toFixed(1)}% of target</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default ProgressBar; 