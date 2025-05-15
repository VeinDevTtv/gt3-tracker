import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar, TrendingUp, DollarSign, Calculator, BarChart2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useGoals } from '../../contexts/GoalsContext';
import WeekInput from '../WeekInput';
import WeeklyEntryForm from './WeeklyEntryForm';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

/**
 * Component for displaying and managing weekly savings entries for a goal
 */
const WeeklyEntryList = ({ goalId, onEntryChange }) => {
  const { 
    updateWeekData,
    calculateProgress,
    goals,
    activeGoal,
    addTradeEntry,
    deleteTradeEntry,
    updateTradeEntry
  } = useGoals();

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [tradeToEdit, setTradeToEdit] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [theme, setTheme] = useState('light');
  
  // Get the current theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('savings-tracker-theme');
    setTheme(savedTheme || 'light');
    
    // Listen for theme changes
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('savings-tracker-theme');
      setTheme(savedTheme || 'light');
    };
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'savings-tracker-theme') {
        handleThemeChange();
      }
    });
    
    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);
  
  // Get the current goal data based on goalId prop or activeGoal from context
  useEffect(() => {
    // First try goalId if provided
    if (goalId) {
      const foundGoal = goals.find(g => g.id === goalId);
      if (foundGoal) {
        setCurrentGoal(foundGoal);
        return;
      }
    }
    
    // Fallback to active goal
    if (activeGoal) {
      setCurrentGoal(activeGoal);
    } else {
      setCurrentGoal(null);
    }
  }, [goalId, activeGoal, goals]);
  
  if (!currentGoal) {
    return (
      <div className="text-center p-12 bg-muted/20 rounded-lg border flex flex-col items-center">
        <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Active Goal Selected</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Please select or create a goal to track your weekly savings entries.
        </p>
      </div>
    );
  }
  
  // Get the weeks data, maintain original order
  const weeks = [...(currentGoal.weeks || [])];
  
  // Get progress data
  const progress = calculateProgress(currentGoal.id);
  
  // Calculate weekly average target
  const weeklyTargetAverage = currentGoal.target / 52;
  
  // Calculate streak info
  const calculateStreak = () => {
    // Filter to only consider filled weeks
    const filledWeeks = weeks.filter(week => week.isFilled);
    
    // If no filled weeks, return 0
    if (filledWeeks.length === 0) {
      return 0;
    }
    
    // Sort weeks by week number in ascending order
    const sortedWeeks = [...filledWeeks].sort((a, b) => a.week - b.week);
    
    // Find the current streak
    let currentStreak = 0;
    for (let i = sortedWeeks.length - 1; i >= 0; i--) {
      if (sortedWeeks[i].profit > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };
  
  const currentStreak = calculateStreak();
  
  const handleAddEntry = (entryData) => {
    try {
      // Find the next week number if not editing an existing week
      const weekNum = entryData.week || (Math.max(0, ...weeks.map(w => w.week)) + 1);
      
      // Update the week data
      updateWeekData(currentGoal.id, weekNum - 1, entryData.profit, {
        notes: entryData.notes,
        date: entryData.date
      });
      
      // Close the dialog
      setShowEntryForm(false);
      setEditingEntry(null);
      
      // Notify parent component
      if (onEntryChange) {
        onEntryChange();
      }
      
      toast.success('Savings entry added successfully!');
    } catch (err) {
      console.error('Error adding savings entry:', err);
      toast.error('Failed to add savings entry');
    }
  };
  
  const handleDeleteEntry = (weekIndex) => {
    try {
      // Set the entry's profit to 0
      updateWeekData(currentGoal.id, weekIndex, 0, {
        notes: '',
        date: null
      });
      
      setEntryToDelete(null);
      
      // Notify parent component
      if (onEntryChange) {
        onEntryChange();
      }
      
      toast.success('Entry deleted successfully');
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('Failed to delete entry');
    }
  };

  const handleProfitChange = (weekIndex, value) => {
    try {
      // Parse the value as a number
      const profitValue = value === '' ? 0 : parseFloat(value);
      
      // Update the week's profit
      updateWeekData(currentGoal.id, weekIndex, profitValue);
      
      // Notify parent component
      if (onEntryChange) {
        onEntryChange();
      }
    } catch (err) {
      console.error('Error updating profit:', err);
      toast.error('Failed to update profit');
    }
  };
  
  const handleTradeEntry = (entry, weekNum) => {
    try {
      console.log(`WeeklyEntryList: Processing trade entry for Week ${weekNum} in goal ${currentGoal.name} (${currentGoal.id})`);
      console.log(`Entry amount: ${entry.amount}, Note: ${entry.note || 'none'}`);
      
      // Validate goal consistency
      if (!currentGoal || !currentGoal.id) {
        console.error('WeeklyEntryList: Cannot add trade - no current goal');
        toast.error('No active goal selected');
        return false;
      }
      
      // Store initial values for verification
      const originalWeeks = JSON.parse(JSON.stringify(currentGoal.weeks || []));
      const weekIndex = weekNum - 1;
      const originalProfit = weekIndex >= 0 && weekIndex < originalWeeks.length 
        ? originalWeeks[weekIndex].profit || 0 
        : 0;
      
      // Add the trade entry with full logging
      console.log(`WeeklyEntryList: Calling addTradeEntry for goal ${currentGoal.id}`);
      const success = addTradeEntry(currentGoal.id, entry, weekNum);
      
      if (success) {
        // Verify the update by checking if the profit was updated
        console.log('WeeklyEntryList: Trade entry added successfully, verifying update...');
        
        // Get the updated goal from context
        const updatedGoal = goals.find(g => g.id === currentGoal.id);
        if (updatedGoal) {
          const updatedWeek = updatedGoal.weeks[weekIndex];
          console.log(`WeeklyEntryList: Verification - Week ${weekNum} profit before: ${originalProfit}, after: ${updatedWeek.profit}`);
          
          // Calculate difference to confirm update
          const difference = updatedWeek.profit - originalProfit;
          if (Math.abs(difference - entry.amount) > 0.01) {
            console.warn(`WeeklyEntryList: Unexpected profit difference. Expected ~${entry.amount}, got ${difference}`);
          } else {
            console.log(`WeeklyEntryList: Profit updated correctly by ${difference}`);
          }
        }
        
        // Notify parent component to refresh UI
        if (onEntryChange) {
          console.log('WeeklyEntryList: Calling onEntryChange to propagate UI updates');
          onEntryChange();
          
          // Call it again after a delay to ensure renders complete
          setTimeout(() => {
            console.log('WeeklyEntryList: Calling delayed onEntryChange for final UI sync');
            onEntryChange();
          }, 200);
        }
        
        toast.success(`Trade entry added to Week ${weekNum}: ${formatCurrency(entry.amount)}`);
        return true;
      } else {
        console.error('WeeklyEntryList: addTradeEntry returned false');
        toast.error('Failed to add trade entry');
        return false;
      }
    } catch (err) {
      console.error('WeeklyEntryList: Error adding trade entry:', err);
      toast.error('Failed to add trade entry');
      return false;
    }
  };
  
  const handleEditTradeEntry = (weekNum, entry, entryIndex) => {
    setTradeToEdit({
      weekNum,
      entry,
      entryIndex
    });
  };
  
  const handleDeleteTradeEntry = (weekNum, entryIndex) => {
    try {
      // Delete the trade entry
      deleteTradeEntry(currentGoal.id, weekNum, entryIndex);
      
      // Notify parent component
      if (onEntryChange) {
        onEntryChange();
      }
      
      toast.success('Trade entry deleted successfully');
    } catch (err) {
      console.error('Error deleting trade entry:', err);
      toast.error('Failed to delete trade entry');
    }
  };
  
  const handleSaveTradeEdit = (updatedEntry) => {
    try {
      if (!tradeToEdit) return;
      
      // Update the trade entry
      updateTradeEntry(
        currentGoal.id, 
        tradeToEdit.weekNum, 
        tradeToEdit.entryIndex, 
        updatedEntry
      );
      
      // Reset edit state
      setTradeToEdit(null);
      
      // Notify parent component
      if (onEntryChange) {
        onEntryChange();
      }
      
      toast.success('Trade entry updated successfully');
    } catch (err) {
      console.error('Error updating trade entry:', err);
      toast.error('Failed to update trade entry');
    }
  };
  
  // Check if any weeks are filled (have a profit value > 0)
  const hasEntries = weeks.some(w => w.profit > 0);
  
  // Helper function for consistent formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Weekly Savings for {currentGoal.name}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="ml-2">
            <BarChart2 className="h-3 w-3 mr-1" />
            Progress: {Math.round(progress.percentComplete)}%
          </Badge>
          <Button 
            onClick={() => setShowEntryForm(true)} 
            size="sm" 
            className="bg-primary text-primary-foreground"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Week
          </Button>
        </div>
      </div>
      
      <div className="bg-muted/20 rounded-lg p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm font-medium">Target: </span>
          <span className="ml-1 text-sm">{formatCurrency(currentGoal.target)}</span>
        </div>
        
        <div className="flex items-center ml-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm font-medium">Progress: </span>
          <span className="ml-1 text-sm">{Math.round(progress.percentComplete)}%</span>
        </div>
        
        <div className="flex items-center ml-4">
          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm font-medium">Started: </span>
          <span className="ml-1 text-sm">{formatDate(currentGoal.startDate)}</span>
        </div>
        
        {currentGoal.deadline && (
          <div className="flex items-center ml-4">
            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm font-medium">Deadline: </span>
            <span className="ml-1 text-sm">{formatDate(currentGoal.deadline)}</span>
          </div>
        )}
      </div>
      
      {!hasEntries ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20 flex flex-col items-center">
          <Calculator className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Savings Entries Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Track your progress by adding weekly savings entries. Each entry represents money you've saved toward your goal.
          </p>
          <Button 
            onClick={() => setShowEntryForm(true)} 
            className="bg-primary text-primary-foreground"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" /> Add First Entry
          </Button>
        </div>
      ) : (
        <WeekInput
          weeks={weeks}
          onProfitChange={handleProfitChange}
          onTradeEntry={handleTradeEntry}
          onDeleteEntry={handleDeleteTradeEntry}
          onEditEntry={handleEditTradeEntry}
          weeklyTargetAverage={weeklyTargetAverage}
          theme={theme}
          currentStreak={currentStreak}
          goalStartDate={currentGoal.startDate}
        />
      )}
      
      {/* Add/Edit Entry Dialog */}
      <Dialog open={showEntryForm || !!editingEntry} onOpenChange={(open) => {
        if (!open) {
          setShowEntryForm(false);
          setEditingEntry(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Savings Entry' : 'Add Savings Entry'}
            </DialogTitle>
          </DialogHeader>
          <WeeklyEntryForm 
            onSubmit={handleAddEntry}
            onCancel={() => {
              setShowEntryForm(false);
              setEditingEntry(null);
            }}
            initialValues={editingEntry}
            weekNumber={editingEntry?.week}
            isEditing={!!editingEntry}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Trade Dialog */}
      {tradeToEdit && (
        <Dialog 
          open={!!tradeToEdit} 
          onOpenChange={(open) => !open && setTradeToEdit(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Trade Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="number" 
                    className="w-full pl-8 py-2 border rounded-md"
                    value={tradeToEdit.entry.amount}
                    onChange={(e) => setTradeToEdit({
                      ...tradeToEdit, 
                      entry: {
                        ...tradeToEdit.entry, 
                        amount: parseFloat(e.target.value) || 0
                      }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <textarea 
                  className="w-full p-2 border rounded-md"
                  value={tradeToEdit.entry.note || ''}
                  onChange={(e) => setTradeToEdit({
                    ...tradeToEdit, 
                    entry: {
                      ...tradeToEdit.entry, 
                      note: e.target.value
                    }
                  })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setTradeToEdit(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleSaveTradeEdit(tradeToEdit.entry)}
                className="bg-primary text-primary-foreground"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the entry for Week {entryToDelete?.week}?
              This action cannot be undone.
            </p>
            
            {entryToDelete && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <div><strong>Week:</strong> {entryToDelete.week}</div>
                <div><strong>Amount:</strong> {formatCurrency(entryToDelete.profit)}</div>
                {entryToDelete.date && <div><strong>Date:</strong> {formatDate(entryToDelete.date)}</div>}
                {entryToDelete.notes && <div><strong>Notes:</strong> {entryToDelete.notes}</div>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteEntry(entryToDelete.week - 1)}
            >
              Delete Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyEntryList; 