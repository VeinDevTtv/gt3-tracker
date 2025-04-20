import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trophy, Check, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { formatCurrency } from '../../utils/formatters';
import goalManager from '../../services/GoalManager';
import NewGoalForm from './NewGoalForm';
import { cn } from '../../lib/utils';

const GoalList = ({ onGoalChange }) => {
  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [error, setError] = useState(null);

  // Debug flag to log state for troubleshooting
  const DEBUG = true;

  useEffect(() => {
    try {
      // Load all goals and active goal ID
      const loadedGoals = goalManager.getGoals();
      const activeId = goalManager.getActiveGoalId();
      
      if (DEBUG) {
        console.log('GoalList - loadedGoals:', loadedGoals);
        console.log('GoalList - activeId:', activeId);
      }
      
      setGoals(loadedGoals);
      setActiveGoalId(activeId);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError('Failed to load goals');
    }
  }, []);

  // Calculate total progress for each goal
  const calculateProgress = (goal) => {
    if (!goal.weeks || goal.weeks.length === 0 || !goal.target) return 0;
    
    const totalSaved = goal.weeks.reduce((sum, week) => sum + (week.profit || 0), 0);
    return Math.min(100, (totalSaved / goal.target) * 100);
  };

  const handleSelectGoal = (goalId) => {
    try {
      if (DEBUG) console.log('Selecting goal:', goalId);
      
      if (goalManager.setActiveGoal(goalId)) {
        setActiveGoalId(goalId);
        // Notify parent component of goal change
        if (onGoalChange) {
          onGoalChange(goalId);
        }
        toast.success('Goal switched successfully');
      }
    } catch (err) {
      console.error('Error selecting goal:', err);
      toast.error('Failed to switch goals');
    }
  };

  const handleCreateGoal = (newGoalData) => {
    try {
      if (DEBUG) console.log('Creating new goal:', newGoalData);
      
      // Ensure we have the required fields
      if (!newGoalData.name || !newGoalData.target) {
        toast.error('Goal name and target amount are required');
        return null;
      }
      
      const newGoalId = goalManager.createGoal(newGoalData);
      
      if (DEBUG) console.log('New goal created with ID:', newGoalId);
      
      // Refresh goals list
      setGoals(goalManager.getGoals());
      setShowNewGoalDialog(false);
      
      toast.success('New goal created successfully!');
      
      // Automatically select the new goal
      if (newGoalId) {
        handleSelectGoal(newGoalId);
      }
      
      return newGoalId;
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error('Failed to create new goal');
      return null;
    }
  };

  const handleUpdateGoal = (goalId, updates) => {
    try {
      if (DEBUG) console.log(`Updating goal ${goalId}:`, updates);
      
      if (goalManager.updateGoal(goalId, updates)) {
        // Refresh goals list
        setGoals(goalManager.getGoals());
        setEditingGoal(null);
        
        toast.success('Goal updated successfully!');
        
        // Notify parent component if the active goal was updated
        if (goalId === activeGoalId && onGoalChange) {
          onGoalChange(goalId);
        }
      } else {
        toast.error('Failed to update goal');
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      toast.error('Failed to update goal');
    }
  };

  const handleDeleteGoal = (goalId) => {
    try {
      if (deleteConfirmText !== 'DELETE') {
        toast.error('Please type DELETE to confirm');
        return;
      }
      
      if (goals.length <= 1) {
        toast.error('Cannot delete the only goal. Create another goal first.');
        return;
      }
      
      if (DEBUG) console.log('Deleting goal:', goalId);
      
      if (goalManager.deleteGoal(goalId)) {
        // Refresh goals list
        const updatedGoals = goalManager.getGoals();
        setGoals(updatedGoals);
        setGoalToDelete(null);
        setDeleteConfirmText('');
        
        // If the active goal was deleted, onGoalChange would have been
        // called by the goal manager already
        const newActiveId = goalManager.getActiveGoalId();
        setActiveGoalId(newActiveId);
        
        if (goalId === activeGoalId && onGoalChange) {
          onGoalChange(newActiveId);
        }
        
        toast.success('Goal deleted successfully');
      } else {
        toast.error('Failed to delete goal');
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.error('Failed to delete goal');
    }
  };

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
        <h3 className="font-semibold">Error loading goals</h3>
        <p>{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          Reload page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Goals</h2>
        <Button 
          onClick={() => setShowNewGoalDialog(true)} 
          size="sm" 
          className="bg-primary text-primary-foreground"
        >
          <Plus className="mr-1 h-4 w-4" /> New Goal
        </Button>
      </div>
      
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-6 border rounded-lg bg-muted/30">
            <p>No goals yet. Create your first goal!</p>
            <Button 
              onClick={() => setShowNewGoalDialog(true)} 
              className="mt-4 bg-primary text-primary-foreground"
            >
              <Plus className="mr-1 h-4 w-4" /> Create Goal
            </Button>
          </div>
        ) : (
          goals.map(goal => {
            const progress = calculateProgress(goal);
            const isActive = goal.id === activeGoalId;
            
            return (
              <div 
                key={goal.id} 
                className={cn(
                  "p-3 rounded-md border cursor-pointer transition-all",
                  isActive ? "border-primary bg-primary/10" : "hover:bg-accent/50"
                )}
                onClick={() => !isActive && handleSelectGoal(goal.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                    <h3 className="font-medium">{goal.name}</h3>
                    {progress >= 100 && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGoal(goal);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGoalToDelete(goal);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Target: {formatCurrency(goal.target)}
                </div>
                
                <div className="w-full h-2 bg-secondary mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(progress)}% complete</span>
                  {!isActive && (
                    <span className="text-primary">Click to activate</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* New Goal Dialog */}
      <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <NewGoalForm onSubmit={handleCreateGoal} onCancel={() => setShowNewGoalDialog(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <NewGoalForm 
              initialValues={editingGoal}
              onSubmit={(updates) => handleUpdateGoal(editingGoal.id, updates)}
              onCancel={() => setEditingGoal(null)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{goalToDelete?.name}</strong>?
              This action cannot be undone.
            </p>
            
            <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
              <p>To confirm, type <strong>DELETE</strong> below:</p>
            </div>
            
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteGoal(goalToDelete.id)}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalList; 