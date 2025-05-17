import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parse, startOfWeek, addDays, isValid } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useGoals } from "../contexts/GoalsContext";

const BackfillWeekForm = ({ theme, goalId }) => {
  const [date, setDate] = useState('');
  const [profit, setProfit] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { backfillWeekData } = useGoals();

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleProfitChange = (e) => {
    setProfit(e.target.value);
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const calculateWeekStart = (dateString) => {
    try {
      const dateObj = parse(dateString, 'yyyy-MM-dd', new Date());
      if (!isValid(dateObj)) return null;
      
      // Get the Monday of that week (start of week)
      const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 });
      return format(weekStart, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error calculating week start:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    
    if (!profit || isNaN(parseFloat(profit))) {
      toast.error('Please enter a valid profit amount');
      return;
    }
    
    const weekStartDate = calculateWeekStart(date);
    if (!weekStartDate) {
      toast.error('Invalid date selected');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create an entry if there's a note
      const entries = note.trim() ? [
        {
          timestamp: new Date(date).toISOString(),
          amount: parseFloat(profit),
          note: note.trim(),
        }
      ] : [];
      
      // Call the backfill function
      const result = await backfillWeekData(
        goalId,
        weekStartDate,
        parseFloat(profit),
        entries
      );
      
      if (result.success) {
        toast.success(`Data added for week of ${format(new Date(weekStartDate), 'MMM d, yyyy')}`);
        // Reset form
        setDate('');
        setProfit('');
        setNote('');
      } else {
        toast.error(result.error || 'Failed to add week data');
      }
    } catch (error) {
      console.error('Error in backfill submission:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className={theme === 'dark' ? 'text-white' : ''}>
          Backfill Week Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date" className={`mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
              Date
            </Label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={handleDateChange}
                className={`pl-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select any date within the week you want to backfill
            </p>
          </div>
          
          <div>
            <Label htmlFor="profit" className={`mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
              Week Profit/Loss
            </Label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="profit"
                value={profit}
                onChange={handleProfitChange}
                placeholder="0.00"
                inputMode="decimal"
                className={`pl-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : ''}`}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="note" className={`mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>
              Note (Optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={handleNoteChange}
              placeholder="Add details about this entry..."
              className={theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : ''}
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Add Week Data'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BackfillWeekForm; 