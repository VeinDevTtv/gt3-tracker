import React, { useState, useEffect } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import milestoneService from '@/services/MilestoneService';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Clock, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Displays a visual milestone progress map for the current goal
 */
const MilestoneProgressMap = ({ goalId, refreshKey = 0 }) => {
  const [milestones, setMilestones] = useState([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const { activeGoal, getGoalProgressData, toggleMilestoneTimeSensitivity } = useGoals();
  
  // Derive goalId if not provided
  const targetGoalId = goalId || (activeGoal ? activeGoal.id : null);
  
  useEffect(() => {
    if (!targetGoalId) return;
    
    // Use the new context method to get goal-specific filtered data
    const progressData = getGoalProgressData(targetGoalId);
    if (!progressData) return;
    
    // Get milestones for the current goal
    const goalMilestones = milestoneService.getMilestonesForGoal(targetGoalId) || [];
    
    // Set milestones and progress
    setMilestones(goalMilestones);
    setTotalProgress(progressData.progress.percentComplete || 0);
  }, [targetGoalId, refreshKey, getGoalProgressData]);
  
  // Handle milestone time sensitivity toggle
  const handleToggleTimeSensitivity = (milestoneId) => {
    if (toggleMilestoneTimeSensitivity) {
      toggleMilestoneTimeSensitivity(targetGoalId, milestoneId);
    }
  };
  
  // Show help tooltip with detailed achievement info
  const getMilestoneAchievementInfo = (milestone) => {
    if (!milestone || !milestone.achieved) {
      return 'Not yet achieved';
    }
    
    let info = 'Achieved';
    if (milestone.achieved.date) {
      const formattedDate = format(parseISO(milestone.achieved.date), 'MMM d, yyyy');
      info += ` on ${formattedDate}`;
    }
    
    if (milestone.achieved.weekNumber) {
      info += `, Week ${milestone.achieved.weekNumber}`;
    }
    
    if (milestone.achieved.progress) {
      info += `, at $${milestone.achieved.progress.toLocaleString()}`;
    }
    
    return info;
  };
  
  if (!targetGoalId || milestones.length === 0) {
    return (
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div className="text-center text-muted-foreground">
          No milestones available for this goal
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <div className="font-medium">Overall Progress</div>
          <div>{Math.round(totalProgress)}%</div>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>
      
      {/* Milestones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {milestones.map((milestone) => {
          const isCompleted = milestone.completed;
          
          let statusColor = 'bg-muted';
          if (isCompleted) {
            statusColor = 'bg-green-500';
          }
          
          return (
            <TooltipProvider key={milestone.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`
                      relative p-4 rounded-lg border transition-all
                      ${isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
                    `}
                  >
                    {/* Time Sensitivity Toggle */}
                    <button 
                      onClick={() => handleToggleTimeSensitivity(milestone.id)}
                      className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
                      title={milestone.isTimeSensitive !== false 
                        ? "Time-sensitive: Only counts activities within this goal's date range" 
                        : "Not time-sensitive: Counts all activities regardless of date"}
                    >
                      {milestone.isTimeSensitive !== false ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Milestone Indicator */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${statusColor} text-white flex-shrink-0`}>
                        <div className="text-xl">{milestone.icon || '🏆'}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium">{milestone.name}</div>
                        <div className="text-sm text-muted-foreground">{milestone.description}</div>
                        
                        {/* Milestone Achievement Info */}
                        {isCompleted && milestone.achieved && (
                          <div className="flex items-center gap-1 text-xs mt-1 text-green-600 dark:text-green-400">
                            <Clock className="h-3 w-3" />
                            {milestone.achieved.date && (
                              <span>{format(parseISO(milestone.achieved.date), 'MMM d, yyyy')}</span>
                            )}
                            
                            {milestone.achieved.weekNumber && (
                              <Badge variant="outline" className="text-xs ml-1">
                                Week {milestone.achieved.weekNumber}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1 p-1">
                    <div className="font-medium">{milestone.name}</div>
                    <div className="text-sm">{milestone.description}</div>
                    <div className="text-xs flex items-center gap-1 mt-1">
                      <Info className="h-3 w-3" />
                      <span>
                        {milestone.isTimeSensitive !== false 
                          ? "Time-sensitive: Only counts activities within this goal's date range" 
                          : "Not time-sensitive: Counts all activities regardless of date"}
                      </span>
                    </div>
                    {isCompleted ? (
                      <div className="text-xs mt-1 text-green-600 dark:text-green-400">
                        {getMilestoneAchievementInfo(milestone)}
                      </div>
                    ) : (
                      <div className="text-xs mt-1">Not yet achieved</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneProgressMap; 