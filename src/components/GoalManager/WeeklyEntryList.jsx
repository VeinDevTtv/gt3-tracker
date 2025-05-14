import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useGoals } from '../../contexts/GoalsContext';
import WeeklyEntryForm from './WeeklyEntryForm';
import { cn } from '../../lib/utils';

/**
 * Component for displaying and managing weekly savings entries for a goal
 */
const WeeklyEntryList = ({ goalId, onEntryChange }) => {
  const { 
    updateWeekData,
    calculateProgress,
    goals,
    activeGoal
  } = useGoals();

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  
  // Get the current goal data
  const goal = goalId 
    ? goals.find(g => g.id === goalId) 
    : activeGoal;
  
  if (!goal) {
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
  
  // Get the weeks data, sorted newest first
  const weeks = [...(goal.weeks || [])].sort((a, b) => b.week - a.week);
  
  // Get progress data
  const progress = calculateProgress(goal.id);
  
  const handleAddEntry = (entryData) => {
    try {
      // Find the next week number if not editing an existing week
      const weekNum = entryData.week || (Math.max(0, ...weeks.map(w => w.week)) + 1);
      
      // Update the week data
      updateWeekData(goal.id, weekNum - 1, entryData.profit, {
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
      updateWeekData(goal.id, weekIndex, 0, {
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
  
  const hasEntries = weeks.some(w => w.profit > 0);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Weekly Savings Entries</h3>
        <Button 
          onClick={() => setShowEntryForm(true)} 
          size="sm" 
          className="bg-primary text-primary-foreground"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Entry
        </Button>
      </div>
      
      <div className="bg-muted/20 rounded-lg p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm font-medium">Target: </span>
          <span className="ml-1 text-sm">{formatCurrency(goal.target)}</span>
        </div>
        
        <div className="flex items-center ml-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm font-medium">Progress: </span>
          <span className="ml-1 text-sm">{Math.round(progress.percentComplete)}%</span>
        </div>
        
        <div className="flex items-center ml-4">
          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
          <span className="text-sm font-medium">Started: </span>
          <span className="ml-1 text-sm">{formatDate(goal.startDate)}</span>
        </div>
        
        {goal.deadline && (
          <div className="flex items-center ml-4">
            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm font-medium">Deadline: </span>
            <span className="ml-1 text-sm">{formatDate(goal.deadline)}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2 mt-4">
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
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3">Week</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Notes</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {weeks
                  .filter(week => week.profit > 0)
                  .map((week) => (
                    <tr 
                      key={week.week} 
                      className="border-t hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3">{week.week}</td>
                      <td className="p-3">{week.date ? formatDate(week.date) : '-'}</td>
                      <td className="p-3 font-medium">
                        {formatCurrency(week.profit)}
                      </td>
                      <td className="p-3 text-muted-foreground">{week.notes || '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => setEditingEntry(week)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive/80 hover:bg-destructive/10" 
                            onClick={() => setEntryToDelete(week)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
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