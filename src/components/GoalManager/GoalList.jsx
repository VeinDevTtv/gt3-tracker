import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trophy, Check, Edit, ListPlus, ArrowRightCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { formatCurrency } from '../../utils/formatters';
import { useGoals } from '../../contexts/GoalsContext';
import NewGoalForm from './NewGoalForm';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const GoalList = ({ onGoalChange, onCreateNewGoal, refreshTrigger = 0 }) => {
  // Get context data
  const { 
    goals: contextGoals, 
    activeGoal: contextActiveGoal,
    switchGoal,
    addGoal,
    updateGoal,
    calculateProgress
  } = useGoals();
  
  // Local state
  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [error, setError] = useState(null);

  // Debug flag to log state for troubleshooting
  const DEBUG = true;
  
  // Initialize and update state from context
  useEffect(() => {
    setGoals(contextGoals || []);
    setActiveGoalId(contextActiveGoal?.id || null);
    
    if (DEBUG) console.log('GoalList state updated from context:', contextGoals, contextActiveGoal);
  }, [contextGoals, contextActiveGoal, refreshTrigger]);
  
  // Handle selection of a goal (setting as active)
  const handleSelectGoal = (goalId) => {
    try {
      if (DEBUG) console.log('Switching to goal:', goalId);
      
      switchGoal(goalId);
      
      // Call parent's onChange handler
      if (onGoalChange) {
        onGoalChange(goalId);
      }
    } catch (err) {
      console.error('Error selecting goal:', err);
      toast.error('Failed to switch goal');
    }
  };
  
  // Handle goal creation
  const handleCreateGoal = (newGoalData) => {
    try {
      if (DEBUG) console.log('Creating goal:', newGoalData);
      
      const goalId = addGoal(newGoalData);
      
      if (goalId) {
        setShowNewGoalDialog(false);
        toast.success('Goal created successfully!');
        
        // Call parent's onChange handler
        if (onGoalChange) {
          onGoalChange(goalId);
        }
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error('Failed to create goal');
    }
  };
  
  // Handle goal update
  const handleUpdateGoal = (goalId, updates) => {
    try {
      if (DEBUG) console.log('Updating goal:', goalId, updates);
      
      const success = updateGoal(goalId, updates);
      
      if (success) {
        setEditingGoal(null);
        toast.success('Goal updated successfully!');
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      toast.error('Failed to update goal');
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/30 flex flex-col items-center col-span-1 md:col-span-2">
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
            const progress = calculateProgress(goal.id);
            const isActive = goal.id === activeGoalId;
            const progressPercentage = Math.round(progress.percentComplete);
            const totalSaved = progress.totalSaved || 0;
            
            return (
              <Card 
                key={goal.id} 
                className={cn(
                  "border transition-all",
                  isActive ? "border-primary shadow-md" : "hover:border-primary/50"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {isActive && (
                          <Badge className="bg-primary text-primary-foreground">Active</Badge>
                        )}
                        {progress.percentComplete >= 100 && (
                          <Badge className="bg-yellow-500">
                            <Trophy className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {goal.description || "No description"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-medium">${goal.target.toLocaleString()}</span>
                      </div>
                      
                      <div className="w-full bg-accent h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            progressPercentage >= 100 ? "bg-green-500" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(100, progressPercentage)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          ${totalSaved.toLocaleString()} ({progressPercentage}%)
                        </span>
                      </div>

                      {goal.weeks && goal.weeks.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Latest weekly entry: ${goal.weeks[goal.weeks.length - 1]?.profit?.toLocaleString() || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2 pb-4 flex justify-between">
                  {isActive ? (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Check className="h-3 w-3 mr-1" /> Current Goal
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSelectGoal(goal.id)}
                      className="gap-1"
                    >
                      <ArrowRightCircle className="h-4 w-4" /> Switch
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setEditingGoal(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={editingGoal.name || ''}
                  onChange={(e) => setEditingGoal({...editingGoal, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Target Amount</Label>
                <Input
                  id="target"
                  type="number"
                  min="1"
                  value={editingGoal.target || ''}
                  onChange={(e) => setEditingGoal({...editingGoal, target: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={editingGoal.description || ''}
                  onChange={(e) => setEditingGoal({...editingGoal, description: e.target.value})}
                  rows={3}
                  placeholder="Describe your savings goal"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGoal(null)}>Cancel</Button>
              <Button onClick={() => handleUpdateGoal(editingGoal.id, {
                name: editingGoal.name,
                target: editingGoal.target,
                description: editingGoal.description
              })}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Create Goal Dialog */}
      <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <NewGoalForm 
            onSubmit={handleCreateGoal}
            onCancel={() => setShowNewGoalDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalList; 