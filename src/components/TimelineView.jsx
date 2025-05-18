import React, { useState } from 'react';
import { format, parseISO, isToday, isSameWeek, differenceInWeeks } from 'date-fns';
import { Calendar, ArrowRight, ChevronRight, Info, Clock, Calendar as CalendarIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency } from '@/utils/formatters';

/**
 * Get color class for a week based on its profit and target
 */
const getColorIntensity = (profit, target, duration = 52) => {
  if (profit === 0) return 'bg-muted/30';
  if (profit < 0) return 'bg-red-500/40 dark:bg-red-500/30';
  
  // For positive profits, calculate intensity as a percentage of the target
  const weeklyTarget = target / duration; // Calculate based on goal duration
  const ratio = profit / weeklyTarget;
  
  if (ratio >= 1.5) return 'bg-green-500/90 dark:bg-green-500/80'; // Excellent
  if (ratio >= 1.0) return 'bg-green-500/70 dark:bg-green-500/60'; // Good
  if (ratio >= 0.5) return 'bg-green-500/50 dark:bg-green-500/40'; // Okay
  return 'bg-green-500/30 dark:bg-green-500/20'; // Minimal
};

/**
 * TimelineView component - Visualizes goal weeks in a timeline
 */
const TimelineView = ({ theme = 'light' }) => {
  const { activeGoal, getCurrentWeekNumber } = useGoals();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // If no active goal, return placeholder
  if (!activeGoal) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            No active goal selected
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get weeks from active goal
  const { weeks = [], startDate, target, duration = 52 } = activeGoal;
  const currentWeekNum = getCurrentWeekNumber();
  const today = new Date();
  const goalStartDate = parseISO(startDate);
  
  // Calculate weeks passed
  const weeksPassed = differenceInWeeks(today, goalStartDate) + 1;
  
  // Group weeks by month for better visualization, respecting the goal duration
  const weeksByMonth = {};
  
  weeks
    .filter(week => week.week <= duration) // Only include weeks up to the goal's duration
    .forEach(week => {
      if (!week.startDate) return;
      
      const startDateObj = parseISO(week.startDate);
      const monthKey = format(startDateObj, 'MMM yyyy');
      
      if (!weeksByMonth[monthKey]) {
        weeksByMonth[monthKey] = [];
      }
      
      weeksByMonth[monthKey].push(week);
    });
  
  // Open dialog with week details
  const handleWeekClick = (week) => {
    setSelectedWeek(week);
    setDialogOpen(true);
  };
  
  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Timeline View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex justify-between items-center">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>
                Week {currentWeekNum} of your journey
                {weeksPassed > 0 ? ` (${weeksPassed} ${weeksPassed === 1 ? 'week' : 'weeks'} passed)` : ''}
              </span>
            </div>
            <div className="text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center cursor-help">
                      <Info className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                      <span>Color Legend</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-sm bg-green-500/90 dark:bg-green-500/80 mr-2"></div>
                        <span>Excellent (≥150% target)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-sm bg-green-500/70 dark:bg-green-500/60 mr-2"></div>
                        <span>Good (≥100% target)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-sm bg-green-500/50 dark:bg-green-500/40 mr-2"></div>
                        <span>Okay (≥50% target)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-sm bg-green-500/30 dark:bg-green-500/20 mr-2"></div>
                        <span>Minimal (&gt;0)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-sm bg-red-500/40 dark:bg-red-500/30 mr-2"></div>
                        <span>Loss (negative)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-sm bg-muted/30 mr-2"></div>
                        <span>No data (0)</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Timeline by month */}
          <div className="space-y-4">
            {Object.keys(weeksByMonth).map(monthKey => (
              <div key={monthKey} className="space-y-1">
                <div className="text-sm font-medium flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> 
                  {monthKey}
                </div>
                
                <div className="flex gap-1 flex-wrap">
                  {weeksByMonth[monthKey].map((week) => {
                    const isCurrentWeek = week.week === currentWeekNum;
                    const isFilled = week.isFilled || (week.profit !== 0);
                    const isUpcoming = week.week > currentWeekNum;
                    const hasEntries = week.entries && week.entries.length > 0;
                    
                    // Check if this week contains today
                    const weekStartDate = parseISO(week.startDate);
                    const weekEndDate = parseISO(week.endDate);
                    const containsToday = isToday(weekStartDate) || 
                      (weekStartDate <= today && today <= weekEndDate);
                    
                    return (
                      <TooltipProvider key={week.week}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className={`h-9 w-9 rounded-md border shadow-sm flex items-center justify-center text-xs relative transition-all
                                ${isCurrentWeek || containsToday ? 'ring-2 ring-primary' : ''}
                                ${getColorIntensity(week.profit, target, duration)}
                                ${!isFilled ? 'border-dashed opacity-60' : ''}
                                ${isUpcoming ? 'opacity-40' : ''}
                                hover:opacity-100 hover:scale-110
                              `}
                              onClick={() => handleWeekClick(week)}
                            >
                              {(isCurrentWeek || containsToday) && (
                                <div className="absolute -top-1 -right-1">
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                </div>
                              )}
                              {hasEntries && (
                                <div className="absolute -bottom-1 -right-1">
                                  <div className="h-2 w-2 rounded-full bg-primary opacity-60"></div>
                                </div>
                              )}
                              {week.week}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-xs">
                              <div className="font-medium">Week {week.week}</div>
                              {week.displayName && <div>{week.displayName}</div>}
                              {week.startDate && week.endDate && (
                                <div>{format(parseISO(week.startDate), 'MMM d')} - {format(parseISO(week.endDate), 'MMM d, yyyy')}</div>
                              )}
                              <div className="flex items-center">
                                <span>Profit: {formatCurrency(week.profit)}</span>
                                {isCurrentWeek && (
                                  <Badge className="ml-2 bg-primary text-xs px-1 py-0">Current</Badge>
                                )}
                                {containsToday && !isCurrentWeek && (
                                  <Badge className="ml-2 bg-primary text-xs px-1 py-0">Today</Badge>
                                )}
                              </div>
                              <div>Cumulative: {formatCurrency(week.cumulative)}</div>
                              {week.entries?.length > 0 && (
                                <div>{week.entries.length} {week.entries.length === 1 ? 'entry' : 'entries'}</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {Object.keys(weeksByMonth).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No week data available
              </div>
            )}
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground flex items-center justify-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Click on any week to view details</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Week Details Dialog */}
      {selectedWeek && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Week {selectedWeek.week} Details</DialogTitle>
              <DialogDescription>
                {selectedWeek.displayName || `Week ${selectedWeek.week}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-2 py-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Week Profit:</span>
                <span className={`ml-1 font-medium ${
                  selectedWeek.profit > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : selectedWeek.profit < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : ''
                }`}>
                  {formatCurrency(selectedWeek.profit)}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Cumulative:</span>
                <span className="ml-1 font-medium">
                  {formatCurrency(selectedWeek.cumulative)}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="ml-1">
                  {selectedWeek.startDate && format(parseISO(selectedWeek.startDate), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">End Date:</span>
                <span className="ml-1">
                  {selectedWeek.endDate && format(parseISO(selectedWeek.endDate), 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="text-sm col-span-2">
                <span className="text-muted-foreground">Weekly Target:</span>
                <span className="ml-1 font-medium">
                  {formatCurrency(activeGoal.target / duration)}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({selectedWeek.profit > 0 ? Math.round((selectedWeek.profit / (activeGoal.target / duration)) * 100) : 0}% of target)
                </span>
              </div>
            </div>
            
            {/* Entries in this week */}
            {selectedWeek.entries && selectedWeek.entries.length > 0 ? (
              <div className="space-y-2 mt-2">
                <h4 className="text-sm font-medium">Entries ({selectedWeek.entries.length})</h4>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {selectedWeek.entries.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`text-xs p-2 rounded-md ${
                        entry.amount >= 0 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className={`font-medium ${
                        entry.amount >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(entry.amount)}
                      </div>
                      
                      <div className="text-muted-foreground">
                        {entry.timestamp && format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                      </div>
                      
                      {entry.note && (
                        <div className="mt-1">{entry.note}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-2">
                No trade entries for this week
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TimelineView; 