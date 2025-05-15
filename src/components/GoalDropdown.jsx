import React from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { ChevronDown, Target, Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useState } from 'react';
import NewGoalForm from './GoalManager/NewGoalForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';

const GoalDropdown = ({ className }) => {
  const { goals, activeGoal, switchGoal, addGoal, calculateProgress } = useGoals();
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);

  const handleCreateGoal = (goalData) => {
    const newGoalId = addGoal(goalData);
    if (newGoalId) {
      setShowNewGoalDialog(false);
    }
  };

  // If there's no active goal yet, show a button to create one
  if (!activeGoal) {
    return (
      <div className={className}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowNewGoalDialog(true)}
          className="gap-2"
        >
          <Plus size={16} /> Create Goal
        </Button>
        <CreateGoalDialog
          open={showNewGoalDialog}
          onOpenChange={setShowNewGoalDialog}
          onSubmit={handleCreateGoal}
        />
      </div>
    );
  }

  // Get progress for the active goal
  const progress = calculateProgress(activeGoal.id);
  const progressPercentage = Math.round(progress.percentComplete);

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 h-9 pl-3 pr-2 font-medium"
          >
            <Target size={16} className="text-primary flex-shrink-0" />
            <span className="truncate max-w-[180px]">{activeGoal.name}</span>
            <span className="opacity-50">•</span>
            <span className="text-sm">{progressPercentage}%</span>
            <ChevronDown size={16} className="ml-1 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold">
            Switch Goal
          </div>
          <DropdownMenuSeparator />
          {goals.map(goal => {
            const isActive = goal.id === activeGoal.id;
            const goalProgress = calculateProgress(goal.id);
            const goalProgressPercentage = Math.round(goalProgress.percentComplete);
            
            return (
              <DropdownMenuItem 
                key={goal.id}
                disabled={isActive}
                className={cn(
                  "flex items-center justify-between cursor-pointer",
                  isActive && "bg-accent"
                )}
                onClick={() => switchGoal(goal.id)}
              >
                <div className="flex items-center gap-2">
                  {isActive && <Check size={16} className="text-primary" />}
                  <span>{goal.name}</span>
                </div>
                <span className="text-xs opacity-70">{goalProgressPercentage}%</span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowNewGoalDialog(true)}>
            <Plus size={16} className="mr-2" />
            <span>New Goal</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateGoalDialog
        open={showNewGoalDialog}
        onOpenChange={setShowNewGoalDialog}
        onSubmit={handleCreateGoal}
      />
    </div>
  );
};

// Create Goal Dialog component
const CreateGoalDialog = ({ open, onOpenChange, onSubmit }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        <NewGoalForm 
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default GoalDropdown; 