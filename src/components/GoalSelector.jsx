import React, { useState } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Target, Edit, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { ChevronDown, Pencil, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ScrollArea } from './ui/scroll-area';

const GoalSelector = ({ theme }) => {
  const { 
    goals, 
    currentGoal, 
    switchGoal, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    duplicateGoal,
    importGoalFromJSON
  } = useGoals();

  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [showEditGoalDialog, setShowEditGoalDialog] = useState(false);
  const [showImportGoalDialog, setShowImportGoalDialog] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [importText, setImportText] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);

  const handleAddGoal = () => {
    if (!newGoalName.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    if (!newGoalTarget || isNaN(Number(newGoalTarget)) || Number(newGoalTarget) <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    addGoal({
      goalName: newGoalName.trim(),
      target: Number(newGoalTarget)
    });

    // Reset form
    setNewGoalName('');
    setNewGoalTarget('');
    setShowAddGoalDialog(false);
  };

  const handleEditGoal = () => {
    if (!editingGoal) return;

    if (!editingGoal.goalName.trim()) {
      toast.error('Please enter a goal name');
      return;
    }

    if (!editingGoal.target || isNaN(Number(editingGoal.target)) || Number(editingGoal.target) <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    updateGoal(editingGoal.id, {
      goalName: editingGoal.goalName.trim(),
      target: Number(editingGoal.target)
    });

    setShowEditGoalDialog(false);
  };

  const handleImportGoal = () => {
    if (!importText.trim()) {
      toast.error('Please paste valid JSON data');
      return;
    }

    const success = importGoalFromJSON(importText);
    if (success) {
      setImportText('');
      setShowImportGoalDialog(false);
    }
  };

  const startEditGoal = (goal) => {
    setEditingGoal({
      id: goal.id,
      goalName: goal.goalName,
      target: goal.target
    });
    setShowEditGoalDialog(true);
  };

  const handleDeleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoal(id);
    }
  };

  return (
    <>
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary-color" />
            Goals
          </CardTitle>
          <CardDescription>
            Manage and switch between your savings goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current goal info */}
            {currentGoal && (
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
                    {currentGoal.goalName}
                  </h3>
                  <div className={`px-2 py-0.5 text-xs rounded bg-primary-color text-white font-medium`}>
                    Active
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Target</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
                      ${currentGoal.target.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Started</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
                      {format(new Date(currentGoal.startDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-1">
                  <div 
                    className="bg-primary-color h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (currentGoal.weeks[currentGoal.weeks.length - 1]?.cumulative || 0) / currentGoal.target * 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-xs mb-4">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    $0
                  </span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    ${currentGoal.target.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Other goals */}
            {goals.length > 1 && (
              <div className="space-y-2">
                <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Goals
                </h4>
                
                <div className="space-y-2">
                  {goals
                    .filter(goal => goal.id !== currentGoal.id)
                    .map(goal => (
                      <div 
                        key={goal.id}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                        } cursor-pointer transition-colors`}
                        onClick={() => switchGoal(goal.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${goal.themeColor}-500/20`}>
                            <Target className={`h-4 w-4 text-${goal.themeColor}-500`} />
                          </div>
                          <div>
                            <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
                              {goal.goalName}
                            </h5>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              ${goal.target.toLocaleString()} • {Math.round((goal.weeks[goal.weeks.length - 1]?.cumulative || 0) / goal.target * 100)}% complete
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            switchGoal(goal.id);
                          }}
                        >
                          Switch
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {/* Add new goal button */}
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setShowAddGoalDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* New Goal Dialog */}
      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Create a new savings goal to track your progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                placeholder="Porsche 911 GT3"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetAmount">Target Amount ($)</Label>
              <Input
                id="targetAmount"
                placeholder="150000"
                type="number"
                min="1"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={showEditGoalDialog} onOpenChange={setShowEditGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your savings goal details.
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editGoalName">Goal Name</Label>
                <Input
                  id="editGoalName"
                  value={editingGoal.goalName}
                  onChange={(e) => setEditingGoal({...editingGoal, goalName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editTargetAmount">Target Amount ($)</Label>
                <Input
                  id="editTargetAmount"
                  type="number"
                  min="1"
                  value={editingGoal.target}
                  onChange={(e) => setEditingGoal({...editingGoal, target: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGoal}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Goal Dialog */}
      <Dialog open={showImportGoalDialog} onOpenChange={setShowImportGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Goal</DialogTitle>
            <DialogDescription>
              Paste the JSON data of a previously exported goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="importText">Goal JSON Data</Label>
              <textarea
                id="importText"
                className="min-h-[200px] p-2 border rounded-md"
                placeholder='{"goalName": "Porsche 911 GT3", "target": 150000, ...}'
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportGoal}>
              Import Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalSelector; 