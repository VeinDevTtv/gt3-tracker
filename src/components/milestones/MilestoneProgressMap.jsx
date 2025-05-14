import React, { useEffect, useState } from 'react';
import { Trophy, Target, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../utils/formatters';
import useSavingsProgress from '../../utils/useSavingsProgress';
import milestoneService from '../../services/MilestoneService';
import { Button } from '../ui/button';

/**
 * Displays a horizontal map of milestone progress for a goal
 */
const MilestoneProgressMap = ({ goalId = null, refreshKey }) => {
  console.log('MilestoneProgressMap rendered with:', { goalId, refreshKey });
  
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  
  // Force refresh when refreshKey prop changes
  useEffect(() => {
    if (refreshKey) {
      console.log('MilestoneProgressMap: External refresh triggered');
      setInternalRefreshKey(prev => prev + 1);
    }
  }, [refreshKey]);

  const { 
    isLoading, 
    goal, 
    progress, 
    milestones, 
    nextMilestone 
  } = useSavingsProgress(goalId);
  
  // Debug goal changes
  useEffect(() => {
    console.log('MilestoneProgressMap: Goal changed', {
      id: goal?.id,
      name: goal?.name,
      target: goal?.target
    });
  }, [goal]);

  // Create default milestones if none exist
  useEffect(() => {
    if (goal && (!milestones || milestones.length === 0)) {
      console.log('No milestones found, creating defaults for goal:', goal.id);
      milestoneService.createDefaultMilestones(goal.id, goal.target);
      // Force refresh
      setInternalRefreshKey(prev => prev + 1);
    }
  }, [goal, milestones, internalRefreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 bg-muted/20 animate-pulse rounded-lg">
        <span className="text-muted-foreground">Loading milestones...</span>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-muted/20 rounded-lg">
        <Target className="h-8 w-8 text-muted-foreground mb-2" />
        <span className="text-muted-foreground">No goal selected</span>
        <p className="text-xs text-muted-foreground mt-1">Create or select a goal to track your milestones</p>
      </div>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-muted/20 rounded-lg">
        <Trophy className="h-8 w-8 text-muted-foreground mb-2" />
        <span className="text-muted-foreground font-medium">Setting up milestones...</span>
        <p className="text-xs text-muted-foreground mt-2 mb-4">
          We're creating default milestones for your goal
        </p>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            console.log('Creating milestones for goal:', goal.id);
            milestoneService.createDefaultMilestones(goal.id, goal.target);
            // Force a refresh by updating the component state
            setInternalRefreshKey(prev => prev + 1);
          }}
        >
          Create Milestones Now
        </Button>
      </div>
    );
  }

  // Sort milestones by amount
  const sortedMilestones = [...milestones].sort((a, b) => a.amount - b.amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Milestone Progress</h3>
          <p className="text-sm text-muted-foreground">
            {progress.percentComplete >= 100 
              ? "Congratulations! You've reached your goal!"
              : nextMilestone 
                ? `Next milestone: ${nextMilestone.title} at ${formatCurrency(nextMilestone.amount)}`
                : "You've achieved all milestones!"}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-medium">
            {formatCurrency(progress.saved)} / {formatCurrency(goal.target)}
          </div>
          <p className="text-sm text-muted-foreground">
            {Math.round(progress.percentComplete)}% complete
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative pt-6 pb-12">
        {/* Main progress bar */}
        <div className="h-2 bg-muted rounded-full mb-3">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress.percentComplete > 100 ? 100 : progress.percentComplete}%` }}
          />
        </div>
        
        {/* Milestone markers */}
        <div className="absolute top-0 left-0 w-full flex">
          {sortedMilestones.map((milestone, index) => {
            // Calculate position as percentage of goal
            const position = (milestone.amount / goal.target) * 100;
            // Cap at 100% for display purposes
            const cappedPosition = position > 100 ? 100 : position;
            // Check if milestone is achieved
            const isAchieved = milestone.achieved || progress.saved >= milestone.amount;
            
            return (
              <div 
                key={milestone.id}
                className="absolute -top-1"
                style={{ left: `${cappedPosition}%` }}
              >
                <div className={cn(
                  "flex flex-col items-center transform -translate-x-1/2",
                  isAchieved ? "text-primary" : "text-muted-foreground"
                )}>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border-2",
                    isAchieved 
                      ? "text-primary-foreground bg-primary border-primary" 
                      : "bg-muted border-muted-foreground"
                  )}>
                    {isAchieved ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Trophy className="h-3 w-3" />
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs whitespace-nowrap">
                    {milestone.percentage}%
                  </div>
                  
                  <div className={cn(
                    "text-xs font-medium mt-1 max-w-[80px] text-center",
                    !isAchieved && "opacity-70"
                  )}>
                    {formatCurrency(milestone.amount)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MilestoneProgressMap; 