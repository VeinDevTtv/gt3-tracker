import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DialogFooter } from '../ui/dialog';
import { formatCurrency } from '../../utils/formatters';
import { CalendarIcon } from 'lucide-react';

/**
 * Form component for adding or editing weekly savings entries
 */
const WeeklyEntryForm = ({ 
  onSubmit, 
  onCancel, 
  initialValues = null, 
  weekNumber = null, 
  isEditing = false 
}) => {
  const [formValues, setFormValues] = useState({
    profit: initialValues?.profit || '',
    notes: initialValues?.notes || '',
    date: initialValues?.date || new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'profit' ? value.replace(/[^0-9.-]/g, '') : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.profit) {
      newErrors.profit = 'Amount is required';
    } else if (isNaN(parseFloat(formValues.profit))) {
      newErrors.profit = 'Amount must be a number';
    }
    
    if (!formValues.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Format data for submission
    const entryData = {
      profit: parseFloat(formValues.profit),
      notes: formValues.notes.trim(),
      date: formValues.date,
      week: weekNumber
    };
    
    onSubmit(entryData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profit">Amount Saved This Week</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="profit"
            name="profit"
            value={formValues.profit}
            onChange={handleChange}
            className="pl-7"
            placeholder="0.00"
            autoFocus
          />
        </div>
        {errors.profit && (
          <p className="text-sm text-destructive">{errors.profit}</p>
        )}
        {formValues.profit && !errors.profit && (
          <p className="text-sm text-muted-foreground">
            {formatCurrency(formValues.profit)}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className="relative">
          <Input
            id="date"
            name="date"
            type="date"
            value={formValues.date}
            onChange={handleChange}
          />
          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          name="notes"
          value={formValues.notes}
          onChange={handleChange}
          placeholder="Add any notes about this entry..."
        />
      </div>
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground">
          {isEditing ? 'Update Entry' : 'Add Entry'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default WeeklyEntryForm; 