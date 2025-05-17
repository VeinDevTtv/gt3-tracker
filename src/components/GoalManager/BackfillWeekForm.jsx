import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, DollarSign, Plus, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useGoals } from '@/contexts/GoalsContext';
import { format, parseISO } from 'date-fns';

/**
 * Component for backfilling week data for past periods
 */
const BackfillWeekForm = ({ goalId, onBackfillComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backfillDate, setBackfillDate] = useState(new Date());
  const [profit, setProfit] = useState('');
  const [note, setNote] = useState('');
  const { backfillWeekData, activeGoal } = useGoals();
  
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
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBackfill} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backfillDate" className="mb-2 block">
                Select Week
              </Label>
              <DatePicker
                id="backfillDate"
                date={backfillDate}
                setDate={setBackfillDate}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Select any date within the week you want to backfill
              </p>
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