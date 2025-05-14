import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trophy, Check, Edit, Trash2, ExternalLink, ListPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { formatCurrency } from '../../utils/formatters';
import goalManager from '../../services/GoalManager';
import NewGoalForm from './NewGoalForm';
import { cn } from '../../lib/utils';

const GoalList = ({ onGoalChange, onCreateNewGoal, refreshTrigger = 0 }) => {
  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [error, setError] = useState(null);

  // Debug flag to log state for troubleshooting
  const DEBUG = false;

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
  }, [refreshTrigger, DEBUG]);

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

  // Forward to parent's create goal handler if available
  const handleNewGoalClick = () => {
    if (onCreateNewGoal) {
      onCreateNewGoal();
    } else {
      setShowNewGoalDialog(true);
    }
  };

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:border-red-800">
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
          onClick={handleNewGoalClick} 
          size="sm" 
          className="bg-primary text-primary-foreground"
        >
          <Plus className="mr-1 h-4 w-4" /> New Goal
        </Button>
      </div>
      
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/30 flex flex-col items-center">
            <ListPlus className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">No goals yet. Create your first goal to start tracking your savings progress!</p>
            <Button 
              onClick={handleNewGoalClick} 
              className="bg-primary text-primary-foreground"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" /> Create First Goal
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
                  "p-4 rounded-md border cursor-pointer transition-all",
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
                
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium">{formatCurrency(goal.target)}</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-muted-foreground">
                    Started: {new Date(goal.startDate).toLocaleDateString()}
                  </span>
                  <span>
                    {Math.round(progress)}% complete
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Create Goal Dialog */}
      {!onCreateNewGoal && (
        <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <NewGoalForm 
              onSubmit={handleCreateGoal}
              onCancel={() => setShowNewGoalDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <NewGoalForm 
              onSubmit={(updates) => handleUpdateGoal(editingGoal.id, updates)}
              onCancel={() => setEditingGoal(null)}
              initialValues={editingGoal}
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
          <div className="py-4">
            <p className="mb-4">
              Are you sure you want to delete the goal "{goalToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="mb-4">
              <Label htmlFor="confirm" className="text-sm font-medium mb-2 block">
                Type DELETE to confirm
              </Label>
              <Input
                id="confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setGoalToDelete(null)}
            >
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