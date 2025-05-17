import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, DollarSign, Plus, Check, Clock, HelpCircle, AlertCircle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGoals } from '@/contexts/GoalsContext';
import { format, parseISO, startOfWeek, endOfWeek, addDays, isSameWeek } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import { CalendarIcon } from 'lucide-react';
import { DialogFooter } from '../ui/dialog';

/**
 * Component for backfilling week data for past periods with real-time calendar dates
 */
const BackfillWeekForm = ({ goalId, onBackfillComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backfillDate, setBackfillDate] = useState(new Date());
  const [profit, setProfit] = useState('');
  const [note, setNote] = useState('');
  const { backfillWeekData, activeGoal, goals, findWeekForDate } = useGoals();
  
  // Find the week for the selected date
  const selectedWeek = findWeekForDate ? findWeekForDate(backfillDate) : null;
  
  // Calculate week date range for display
  const weekStart = startOfWeek(backfillDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(backfillDate, { weekStartsOn: 1 });
  
  // Check if this is trying to backfill the current week
  const isSameWeekAsCurrent = activeGoal?.weeks?.some(week => {
    if (!week.startDate || !week.endDate) return false;
    const weekStartDate = parseISO(week.startDate);
    const weekEndDate = parseISO(week.endDate);
    return isSameWeek(backfillDate, new Date()) && 
           isSameWeek(weekStartDate, backfillDate);
  });
  
  // Check if we have no goals
  if (!goals || goals.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Backfill Past Week Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-2">No Goals Created Yet</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Create a goal to start tracking weekly data and backfill past weeks.
            </p>
            <Button asChild className="gap-1">
              <a href="/goals">
                <Plus className="h-4 w-4" /> Create Goal
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Check if we have no active goal
  if (!activeGoal && !goalId) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Backfill Past Week Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">
              No active goal selected. Please select a goal to backfill data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleBackfill = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!profit || isNaN(parseFloat(profit))) {
      toast.error('Please enter a valid profit/loss amount');
      return;
    }
    
    if (!backfillDate) {
      toast.error('Please select a date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the entries array if there's a note
      const entries = note.trim() ? [
        {
          timestamp: backfillDate.toISOString(),
          amount: parseFloat(profit),
          note: note.trim(),
        }
      ] : [];
      
      // Format date as ISO string
      const dateString = format(backfillDate, 'yyyy-MM-dd');
      
      // Call backfill function
      const result = await backfillWeekData(
        goalId || activeGoal?.id,
        dateString,
        parseFloat(profit),
        entries
      );
      
      if (result.success) {
        toast.success(`Successfully added data for ${result.displayName}`);
        
        // Reset form
        setProfit('');
        setNote('');
        
        // Notify parent component
        if (onBackfillComplete) {
          onBackfillComplete(result);
        }
      } else {
        toast.error(result.error || 'Failed to backfill week data');
      }
    } catch (error) {
      console.error('Error backfilling week data:', error);
      toast.error('An error occurred while saving week data');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Backfill Past Week Data
        </CardTitle>
        <CardDescription>
          Add profit/loss data for previous weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBackfill} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="backfillDate" className="flex items-center gap-1">
                  Select Week
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm max-w-[250px]">
                          Select any date within the week you want to backfill. 
                          The entire week containing this date will be updated.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
              
              <DatePicker
                id="backfillDate"
                date={backfillDate}
                setDate={setBackfillDate}
                className="w-full"
              />
              
              {/* Week date range display */}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</span>
              </div>
              
              {/* If this is the current week, show a warning */}
              {isSameWeekAsCurrent && (
                <div className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>This appears to be the current week</span>
                </div>
              )}
              
              {/* If we found an existing week, show that information */}
              {selectedWeek && (
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Week {selectedWeek.week}:</span>
                  {' '}
                  <span className={selectedWeek.profit > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : selectedWeek.profit < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-muted-foreground'
                  }>
                    {selectedWeek.profit 
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedWeek.profit)
                      : 'No data'
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="profit" className="mb-2 block">
                Profit/Loss Amount
              </Label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profit"
                  value={profit}
                  onChange={(e) => setProfit(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="note" className="mb-2 block">
              Note (Optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add details about this week's trades or results..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary text-primary-foreground"
              disabled={!backfillDate || !profit || isNaN(parseFloat(profit)) || isSubmitting}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Plus size={16} className="mr-1" /> Add Past Week
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BackfillWeekForm; 