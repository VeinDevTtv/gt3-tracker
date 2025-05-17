import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useGoals } from '@/contexts/GoalsContext';
import { Switch } from '@/components/ui/switch';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays } from 'date-fns';

const GoalForm = ({ onSuccess, initialGoal, isEditing = false }) => {
  const { addGoal, updateGoal } = useGoals();
  
  const [formData, setFormData] = useState({
    name: initialGoal?.name || '',
    target: initialGoal?.target || '',
    description: initialGoal?.description || '',
    startDate: initialGoal?.startDate ? new Date(initialGoal.startDate) : new Date(),
    deadline: initialGoal?.deadline ? new Date(initialGoal.deadline) : null,
    isTimeSensitive: initialGoal?.isTimeSensitive !== false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, startDate: date }));
    if (errors.startDate) {
      setErrors(prev => ({ ...prev, startDate: null }));
    }
  };
  
  const handleDeadlineChange = (date) => {
    setFormData(prev => ({ ...prev, deadline: date }));
    if (errors.deadline) {
      setErrors(prev => ({ ...prev, deadline: null }));
    }
  };
  
  const handleTimeSensitivityChange = (checked) => {
    setFormData(prev => ({ ...prev, isTimeSensitive: checked }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.target) {
      newErrors.target = 'Target amount is required';
    } else if (isNaN(formData.target) || parseFloat(formData.target) <= 0) {
      newErrors.target = 'Target must be a positive number';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    // If deadline is set, ensure it's after start date
    if (formData.deadline && formData.startDate && formData.deadline < formData.startDate) {
      newErrors.deadline = 'Deadline must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format dates as ISO strings
      const formattedData = {
        ...formData,
        target: parseFloat(formData.target),
        startDate: formData.startDate.toISOString().split('T')[0],
        deadline: formData.deadline ? formData.deadline.toISOString().split('T')[0] : null
      };
      
      let success;
      if (isEditing && initialGoal) {
        // Update existing goal
        success = await updateGoal(initialGoal.id, formattedData);
      } else {
        // Create new goal
        success = await addGoal(formattedData);
      }
      
      if (success) {
        if (onSuccess) {
          onSuccess(success);
        }
      } else {
        setErrors({ form: 'Failed to save goal. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrors({ form: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate estimated weekly target
  const weeklyTarget = formData.target ? (parseFloat(formData.target) / 52).toFixed(2) : '0.00';
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Annual Trading Goal 2024"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Amount ($)</Label>
            <Input
              id="target"
              name="target"
              value={formData.target}
              onChange={handleChange}
              placeholder="e.g., 10000"
              type="number"
              min="0"
              step="100"
              className={errors.target ? 'border-red-500' : ''}
            />
            {errors.target && <p className="text-sm text-red-500">{errors.target}</p>}
            {formData.target && (
              <p className="text-sm text-muted-foreground mt-1">
                Est. weekly target: ${weeklyTarget}
              </p>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your goal..."
              rows={3}
            />
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                date={formData.startDate}
                setDate={handleDateChange}
                className="w-full"
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>
            
            {/* Deadline (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="deadline">Target End Date (Optional)</Label>
                {formData.deadline && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeadlineChange(null)}
                    className="h-6 text-xs text-muted-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <DatePicker
                date={formData.deadline}
                setDate={handleDeadlineChange}
                className="w-full"
              />
              {errors.deadline && <p className="text-sm text-red-500">{errors.deadline}</p>}
            </div>
          </div>
          
          {/* Time Sensitivity Option */}
          <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Label className="text-base">Time-Sensitive Goal</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircledIcon className="h-4 w-4 text-muted-foreground ml-2" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        When enabled, only trades and progress within the goal's date range will count toward its completion.
                        Turn this off if you want all trades to count regardless of when they occurred.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Only count trades within goal's time window
              </p>
            </div>
            <Switch
              checked={formData.isTimeSensitive}
              onCheckedChange={handleTimeSensitivityChange}
            />
          </div>
          
          {/* General Error Message */}
          {errors.form && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
              {errors.form}
            </div>
          )}
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoalForm; 