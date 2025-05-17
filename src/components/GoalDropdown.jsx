import React from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { ChevronDown, Target, Plus, Check, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';
import { toast } from 'react-hot-toast';

const GoalDropdown = ({ className }) => {
  const { goals, activeGoal, switchGoal, addGoal, deleteGoal, calculateProgress } = useGoals();
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const handleCreateGoal = (goalData) => {
    const newGoalId = addGoal(goalData);
    if (newGoalId) {
      setShowNewGoalDialog(false);
    }
  };

  const handleDeleteGoal = () => {
    if (!goalToDelete) return;
    
    if (goals.length <= 1) {
      toast.error('Cannot delete the only goal. Create another goal first.');
      setGoalToDelete(null);
      return;
    }
    
    const success = deleteGoal(goalToDelete.id);
    if (success) {
      setGoalToDelete(null);
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
                  "flex items-center justify-between cursor-pointer group",
                  isActive && "bg-accent"
                )}
              >
                <div 
                  className="flex items-center gap-2 flex-1"
                  onClick={() => !isActive && switchGoal(goal.id)}
                >
                  {isActive && <Check size={16} className="text-primary" />}
                  <span>{goal.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-70">{goalProgressPercentage}%</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-1 text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGoalToDelete(goal);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Delete this goal</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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

      {/* Create Goal Dialog */}
      <CreateGoalDialog
        open={showNewGoalDialog}
        onOpenChange={setShowNewGoalDialog}
        onSubmit={handleCreateGoal}
      />

      {/* Delete Goal Confirmation Dialog */}
      <Dialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Delete Goal</span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete "{goalToDelete?.name}"? This action cannot be undone.
              All data including milestones, weekly entries, and achievements linked to this goal will be permanently lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGoal}
            >
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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