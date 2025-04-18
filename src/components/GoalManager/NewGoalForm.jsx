import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DialogFooter } from '../ui/dialog';
import { formatCurrency } from '../../utils/formatters';

const NewGoalForm = ({ onSubmit, onCancel, initialValues, isEditing = false }) => {
  const [formValues, setFormValues] = useState({
    name: initialValues?.name || '',
    target: initialValues?.target || '',
    startDate: initialValues?.startDate || new Date().toISOString().split('T')[0],
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'target' ? value.replace(/[^0-9.]/g, '') : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Goal name is required';
    }
    
    if (!formValues.target) {
      newErrors.target = 'Target amount is required';
    } else if (isNaN(parseFloat(formValues.target)) || parseFloat(formValues.target) <= 0) {
      newErrors.target = 'Target must be a positive number';
    }
    
    if (!formValues.startDate) {
      newErrors.startDate = 'Start date is required';
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
    const goalData = {
      name: formValues.name.trim(),
      target: parseFloat(formValues.target),
      startDate: formValues.startDate,
    };
    
    onSubmit(goalData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          placeholder="e.g. New Car, Vacation, Emergency Fund"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="target">Target Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="target"
            name="target"
            value={formValues.target}
            onChange={handleChange}
            className="pl-7"
            placeholder="0.00"
          />
        </div>
        {errors.target && (
          <p className="text-sm text-destructive">{errors.target}</p>
        )}
        {formValues.target && !errors.target && (
          <p className="text-sm text-muted-foreground">
            {formatCurrency(formValues.target)}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={formValues.startDate}
          onChange={handleChange}
        />
        {errors.startDate && (
          <p className="text-sm text-destructive">{errors.startDate}</p>
        )}
      </div>
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground">
          {isEditing ? 'Update Goal' : 'Create Goal'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default NewGoalForm; 