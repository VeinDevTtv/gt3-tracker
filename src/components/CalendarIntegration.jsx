import React, { useState, useMemo } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { format, addDays, addWeeks, isAfter } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'react-hot-toast';

const CalendarIntegration = ({ theme }) => {
  const { activeGoal } = useGoals();
  const [calendarType, setCalendarType] = useState('google');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  // Calculate estimated completion date based on average weekly progress
  const projectionData = useMemo(() => {
    if (!activeGoal) return null;
    
    const totalSaved = activeGoal.weeks[activeGoal.weeks.length - 1]?.cumulative || 0;
    const remainingAmount = activeGoal.target - totalSaved;
    
    // Get weeks with positive profit for average calculation
    const weeksWithProfit = activeGoal.weeks.filter(week => week.profit > 0);
    
    // Calculate average weekly savings
    const avgWeeklySavings = weeksWithProfit.length > 0
      ? weeksWithProfit.reduce((sum, week) => sum + week.profit, 0) / weeksWithProfit.length
      : 0;
    
    // If no savings or all saved already
    if (avgWeeklySavings <= 0 || remainingAmount <= 0) {
      return {
        estimatedWeeks: remainingAmount <= 0 ? 0 : null,
        estimatedDate: remainingAmount <= 0 ? new Date() : null,
        daysRemaining: remainingAmount <= 0 ? 0 : null,
        hasData: weeksWithProfit.length > 0,
        isComplete: remainingAmount <= 0,
        percentComplete: totalSaved / activeGoal.target * 100,
      };
    }
    
    // Calculate estimated time to completion
    const estimatedWeeks = Math.ceil(remainingAmount / avgWeeklySavings);
    const estimatedDate = addWeeks(new Date(), estimatedWeeks);
    const daysRemaining = estimatedWeeks * 7;
    
    return {
      estimatedWeeks,
      estimatedDate,
      daysRemaining,
      avgWeeklySavings,
      hasData: true,
      isComplete: false,
      percentComplete: totalSaved / activeGoal.target * 100,
    };
  }, [activeGoal]);

  // Format time remaining in a human-readable way
  const formatTimeRemaining = () => {
    if (!projectionData) return 'N/A';
    
    if (projectionData.isComplete) {
      return 'Goal completed!';
    }
    
    if (!projectionData.hasData) {
      return 'Add weekly savings to see estimate';
    }
    
    if (!projectionData.daysRemaining) {
      return 'Unable to calculate';
    }
    
    const { daysRemaining } = projectionData;
    
    if (daysRemaining < 14) {
      return `${daysRemaining} days`;
    } else if (daysRemaining < 30) {
      return `${Math.floor(daysRemaining / 7)} weeks`;
    } else if (daysRemaining < 365) {
      return `${Math.floor(daysRemaining / 30)} months`;
    } else {
      return `${(daysRemaining / 365).toFixed(1)} years`;
    }
  };
  
  // Handle adding to calendar
  const handleAddToCalendar = () => {
    if (!projectionData || !projectionData.estimatedDate) {
      toast.error('Unable to create calendar event without a valid completion date');
      return;
    }
    
    const event = {
      title: `${activeGoal.name} Goal Completion`,
      description: `Estimated completion date for your ${activeGoal.name} savings goal.`,
      location: '',
      startDate: format(projectionData.estimatedDate, "yyyy-MM-dd'T'HH:mm:ss"),
      endDate: format(addDays(projectionData.estimatedDate, 1), "yyyy-MM-dd'T'HH:mm:ss"),
    };
    
    let calendarUrl = '';
    
    switch (calendarType) {
      case 'google':
        calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(projectionData.estimatedDate, 'yyyyMMdd')}/${format(addDays(projectionData.estimatedDate, 1), 'yyyyMMdd')}&details=${encodeURIComponent(event.description)}`;
        break;
      case 'outlook':
        calendarUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${event.startDate}&enddt=${event.endDate}&body=${encodeURIComponent(event.description)}`;
        break;
      case 'apple':
        calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(projectionData.estimatedDate, 'yyyyMMdd')}
DTEND:${format(addDays(projectionData.estimatedDate, 1), 'yyyyMMdd')}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;
        break;
      default:
        break;
    }
    
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
      setShowCalendarModal(false);
      toast.success('Calendar event created');
    }
  };
  
  // Generate milestone dates
  const generateMilestoneDates = () => {
    if (!activeGoal || !projectionData || !projectionData.estimatedDate || !projectionData.hasData) return [];
    
    const milestones = [];
    const { percentComplete } = projectionData;
    
    // Only generate future milestones
    const milestonePercentages = [25, 50, 75, 90];
    const futureMilestones = milestonePercentages.filter(p => p > percentComplete);
    
    if (futureMilestones.length === 0) return [];
    
    const totalDaysToComplete = projectionData.daysRemaining / (100 - percentComplete) * 100;
    
    futureMilestones.forEach(milestone => {
      const daysToMilestone = totalDaysToComplete * (milestone / 100);
      const daysFromNow = daysToMilestone - (totalDaysToComplete * (percentComplete / 100));
      const milestoneDate = addDays(new Date(), daysFromNow);
      
      milestones.push({
        percentage: milestone,
        date: milestoneDate,
        daysFromNow: Math.round(daysFromNow)
      });
    });
    
    return milestones;
  };

  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-color" />
          Countdown Calendar
        </CardTitle>
        <CardDescription>
          Track estimated completion date and milestone dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!activeGoal ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a goal to see countdown information</p>
          </div>
        ) : (
          <>
            <div className={`flex flex-col items-center p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'} mb-4`}>
              <h3 className="text-lg font-medium mb-1">Estimated Time Remaining</h3>
              <div className="text-3xl font-bold text-primary-color mb-2">
                {formatTimeRemaining()}
              </div>
              {projectionData?.estimatedDate && projectionData.hasData && !projectionData.isComplete && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Estimated completion on {format(projectionData.estimatedDate, 'MMMM d, yyyy')}
                </p>
              )}
              {projectionData?.isComplete && (
                <Badge className="bg-green-500 hover:bg-green-600">Goal Completed!</Badge>
              )}
            </div>
  
            {projectionData?.hasData && !projectionData?.isComplete && (
              <>
                <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Upcoming Milestones
                </h4>
                <div className="space-y-3 mb-4">
                  {generateMilestoneDates().map((milestone) => (
                    <div 
                      key={milestone.percentage}
                      className={`flex justify-between items-center p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50 border border-gray-100'}`}
                    >
                      <div className="flex items-center">
                        <Badge 
                          className="mr-3 bg-primary-color" 
                          variant="secondary"
                        >
                          {milestone.percentage}%
                        </Badge>
                        <span className="text-sm">
                          {format(milestone.date, 'MMM d, yyyy')}
                        </span>
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {milestone.daysFromNow} days
                      </span>
                    </div>
                  ))}
                  
                  {generateMilestoneDates().length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-2">
                      No upcoming milestones to display
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          disabled={!projectionData?.estimatedDate || !projectionData?.hasData || projectionData?.isComplete}
          onClick={() => setShowCalendarModal(true)}
        >
          Add to Calendar
        </Button>
      </CardFooter>
      
      {/* Calendar Selection Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className={`sm:max-w-[425px] ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
          <DialogHeader>
            <DialogTitle>Add to Calendar</DialogTitle>
            <DialogDescription>
              Select your preferred calendar application
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select defaultValue={calendarType} onValueChange={(value) => setCalendarType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select calendar" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Outlook Calendar</SelectItem>
                <SelectItem value="apple">Apple Calendar</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-4 text-sm">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                This will create a calendar event for your estimated goal completion date: 
                <span className="font-medium block mt-1">
                  {projectionData?.estimatedDate ? format(projectionData.estimatedDate, 'MMMM d, yyyy') : 'Unknown date'}
                </span>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalendarModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToCalendar}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarIntegration; 