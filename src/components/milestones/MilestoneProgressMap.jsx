import React, { useRef, useEffect } from 'react';
import MilestoneCard from './MilestoneCard';
import { format } from 'date-fns';

/**
 * MilestoneProgressMap - A horizontal roadmap showing milestone progress
 */
const MilestoneProgressMap = ({ milestones, currentAmount, targetAmount, onEditMilestone, onDeleteMilestone }) => {
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate the progress percentage
  const progressPercentage = Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));

  // Scroll to the latest achieved milestone
  useEffect(() => {
    if (!containerRef.current) return;

    // Find the latest achieved milestone
    const achievedMilestones = milestones.filter(m => m.achieved);
    if (achievedMilestones.length > 0) {
      const latestMilestone = achievedMilestones.reduce((latest, current) => {
        if (!latest.achievedDate) return current;
        if (!current.achievedDate) return latest;
        return new Date(current.achievedDate) > new Date(latest.achievedDate) ? current : latest;
      }, achievedMilestones[0]);

      // Find the milestone's index
      const milestoneIndex = milestones.findIndex(m => m.id === latestMilestone.id);
      if (milestoneIndex >= 0) {
        // Calculate the position to scroll to
        const milestoneElements = containerRef.current.querySelectorAll('.milestone-card');
        if (milestoneElements[milestoneIndex]) {
          const element = milestoneElements[milestoneIndex];
          const containerWidth = containerRef.current.clientWidth;
          const elementLeft = element.offsetLeft;
          
          // Center the element in view
          containerRef.current.scrollLeft = elementLeft - (containerWidth / 2) + (element.clientWidth / 2);
        }
      }
    }
  }, [milestones]);

  // Animate the progress bar
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
      setTimeout(() => {
        progressBarRef.current.style.width = `${progressPercentage}%`;
      }, 100);
    }
  }, [progressPercentage]);

  if (milestones.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600 dark:text-gray-300">
          No milestones have been created yet. Add your first milestone!
        </p>
      </div>
    );
  }

  // Sort milestones by amount
  const sortedMilestones = [...milestones].sort((a, b) => a.amount - b.amount);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">Your Milestone Journey</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)} saved ({progressPercentage.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <div 
          ref={progressBarRef}
          className="absolute left-0 top-0 h-full bg-primary dark:bg-primary rounded-full transition-all duration-1000 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Milestone roadmap */}
      <div 
        ref={containerRef}
        className="relative overflow-x-auto pb-4 hide-scrollbar" 
        style={{ scrollBehavior: 'smooth' }}
      >
        <div 
          className="flex space-x-4 relative"
          style={{ width: 'max-content', minWidth: '100%' }}
        >
          {/* Start marker */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary dark:bg-primary flex items-center justify-center text-white mb-2">
              <span>🏁</span>
            </div>
            <div className="text-center text-sm">
              <p className="font-medium dark:text-white">Start</p>
              <p className="text-gray-600 dark:text-gray-400">{formatCurrency(0)}</p>
            </div>
          </div>

          {/* Line connecting milestones */}
          <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-300 dark:bg-gray-600 -z-10" />

          {/* Milestone markers */}
          {sortedMilestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className="milestone-card flex-shrink-0"
              style={{ 
                marginLeft: index === 0 ? '1rem' : '0',
                marginRight: index === sortedMilestones.length - 1 ? '1rem' : '0'
              }}
            >
              <MilestoneCard 
                milestone={milestone}
                currentAmount={currentAmount}
                targetAmount={targetAmount}
                onEdit={onEditMilestone}
                onDelete={onDeleteMilestone}
              />
            </div>
          ))}

          {/* End/Goal marker */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary dark:bg-primary flex items-center justify-center text-white mb-2">
              <span>🏎️</span>
            </div>
            <div className="text-center text-sm">
              <p className="font-medium dark:text-white">Goal</p>
              <p className="text-gray-600 dark:text-gray-400">{formatCurrency(targetAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current progress indicator */}
      <div className="mt-8">
        <h3 className="font-medium dark:text-white">Next Milestone</h3>
        {sortedMilestones.some(m => m.amount > currentAmount) ? (
          (() => {
            const nextMilestone = sortedMilestones.find(m => m.amount > currentAmount);
            const remainingAmount = nextMilestone.amount - currentAmount;
            const nextPercentage = (nextMilestone.amount / targetAmount) * 100;
            
            return (
              <div className="mt-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{nextMilestone.title}</span>: {formatCurrency(remainingAmount)} more needed
                </p>
                <div className="mt-2 relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary dark:bg-primary rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  <div 
                    className="absolute top-0 w-0.5 h-3 bg-gray-500"
                    style={{ left: `${nextPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Current: {formatCurrency(currentAmount)}</span>
                  <span>Next: {formatCurrency(nextMilestone.amount)}</span>
                </div>
              </div>
            );
          })()
        ) : (
          <p className="mt-2 text-green-600 dark:text-green-400">
            You've reached all milestones! Congratulations! 🎉
          </p>
        )}
      </div>

      {/* Recently achieved milestones */}
      <div className="mt-8">
        <h3 className="font-medium dark:text-white mb-2">Recent Achievements</h3>
        {sortedMilestones.filter(m => m.achieved).length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No milestones achieved yet. Keep saving!
          </p>
        ) : (
          <div className="space-y-2">
            {sortedMilestones
              .filter(m => m.achieved)
              .sort((a, b) => new Date(b.achievedDate) - new Date(a.achievedDate))
              .slice(0, 3)
              .map(milestone => (
                <div 
                  key={milestone.id}
                  className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex-shrink-0 w-6 h-6 mr-3 flex items-center justify-center">
                    <span>{milestone.icon}</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium dark:text-white">{milestone.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Achieved on {format(new Date(milestone.achievedDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-semibold dark:text-white">{formatCurrency(milestone.amount)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {milestone.percentage}% of goal
                    </p>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Custom CSS for hiding scrollbar but keeping functionality */}
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 0px;
          background: transparent;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MilestoneProgressMap; 