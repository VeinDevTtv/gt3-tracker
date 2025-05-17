import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Download, FileText, Award, TrendingUp, BarChart2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import html2canvas from 'html2canvas';
import { format, differenceInDays, parseISO, startOfWeek, endOfWeek, formatDistance } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

/**
 * Component for generating a goal summary report with real-time calendar data
 */
const GoalSummaryReport = ({ theme = 'light' }) => {
  const { activeGoal, goals, getCurrentWeekNumber } = useGoals();
  const [expandedSections, setExpandedSections] = useState(['overview']);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);
  
  // If no active goal, show placeholder
  if (!activeGoal) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Goal Summary Report
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
  
  // Calculate summary data
  const { weeks = [], target, startDate, name } = activeGoal;
  const currentWeekNum = getCurrentWeekNumber();
  const currentDate = new Date();
  const startDateObj = parseISO(startDate);
  const daysActive = differenceInDays(currentDate, startDateObj);
  const weeksActive = Math.max(1, Math.ceil(daysActive / 7));
  
  // Format duration in a human-readable way
  const formattedDuration = formatDistance(startDateObj, currentDate, { addSuffix: false });
  
  // Calculate weekly average
  const filledWeeks = weeks.filter(week => week.isFilled || week.profit !== 0);
  let totalProfit = 0;
  let totalProfitableWeeks = 0;
  let totalLossWeeks = 0;
  let biggestGain = 0;
  let biggestLoss = 0;
  let biggestGainWeek = null;
  let biggestLossWeek = null;
  
  filledWeeks.forEach(week => {
    totalProfit += week.profit || 0;
    if (week.profit > 0) {
      totalProfitableWeeks++;
      if (week.profit > biggestGain) {
        biggestGain = week.profit;
        biggestGainWeek = week;
      }
    }
    if (week.profit < 0) {
      totalLossWeeks++;
      if (week.profit < biggestLoss) {
        biggestLoss = week.profit;
        biggestLossWeek = week;
      }
    }
  });
  
  const weeklyAverage = filledWeeks.length > 0 ? totalProfit / filledWeeks.length : 0;
  const weeklyAveragePercent = target ? (weeklyAverage / (target / 52)) * 100 : 0;
  const weeklyTarget = target / 52;
  
  // Get estimated completion calculations
  const weeksToComplete = weeklyAverage > 0 ? Math.ceil((target - totalProfit) / weeklyAverage) : 0;
  const estimatedCompletionDate = weeklyAverage > 0 
    ? new Date(currentDate.getTime() + (weeksToComplete * 7 * 24 * 60 * 60 * 1000))
    : null;
  
  // Get total trades
  const totalTrades = weeks.reduce((total, week) => total + (week.entries?.length || 0), 0);
  
  // Calculate win rate
  const profitableRatio = filledWeeks.length > 0 ? totalProfitableWeeks / filledWeeks.length : 0;
  
  // Milestone progress
  const progress = activeGoal.target > 0 ? (totalProfit / activeGoal.target) * 100 : 0;
  const milestones = [
    { percentage: 25, label: '25% Progress', achieved: progress >= 25 },
    { percentage: 50, label: '50% Progress', achieved: progress >= 50 },
    { percentage: 75, label: '75% Progress', achieved: progress >= 75 },
    { percentage: 100, label: '100% Complete', achieved: progress >= 100 }
  ];
  
  // Export report as image
  const exportAsImage = async () => {
    try {
      if (!reportRef.current) return;
      
      setIsExporting(true);
      
      // Generate a timestamp for the filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const filename = `${activeGoal.name}_Report_${timestamp}.png`.replace(/\s+/g, '_');
      
      // Capture the report as an image
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
      });
      
      // Convert to image and download
      const imageUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = imageUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Goal Summary Report
        </CardTitle>
      </CardHeader>
      
      <div ref={reportRef}>
        <CardContent className="space-y-6">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold">{activeGoal.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Started on {formatDate(startDate)} ({formattedDuration} ago)
            </p>
          </div>
          
          {/* Overview Section */}
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            <AccordionItem value="overview">
              <AccordionTrigger className="text-base font-medium py-2">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Overview
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Target</div>
                    <div className="font-medium">{formatCurrency(target)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Current Progress</div>
                    <div className="font-medium">
                      {formatCurrency(totalProfit)} ({Math.round(progress)}%)
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Avg Weekly Gain</div>
                    <div className="font-medium">
                      {formatCurrency(weeklyAverage)}
                      <span className="text-xs ml-1 text-muted-foreground">
                        ({Math.round(weeklyAveragePercent)}% of weekly target)
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Weekly Target</div>
                    <div className="font-medium">{formatCurrency(weeklyTarget)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Est. Completion</div>
                    <div className="font-medium">
                      {estimatedCompletionDate && weeklyAverage > 0 ? (
                        <>
                          {format(estimatedCompletionDate, 'MMM d, yyyy')}
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({weeksToComplete} weeks)
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total Trades</div>
                    <div className="font-medium">{totalTrades}</div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Win/Loss Weeks</div>
                    <div className="font-medium">
                      {totalProfitableWeeks} / {totalLossWeeks}
                      <span className="text-xs ml-1 text-muted-foreground">
                        ({Math.round(profitableRatio * 100)}% profitable)
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Best/Worst Weeks</div>
                    <div className="font-medium flex flex-col">
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(biggestGain)}
                        {biggestGainWeek?.displayName && (
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({biggestGainWeek.displayName.replace('Week of ', '')})
                          </span>
                        )}
                      </span>
                      {biggestLoss !== 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(biggestLoss)}
                          {biggestLossWeek?.displayName && (
                            <span className="text-xs ml-1 text-muted-foreground">
                              ({biggestLossWeek.displayName.replace('Week of ', '')})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2.5 mb-6 mt-4">
                  <div 
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  ></div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Milestones Section */}
            <AccordionItem value="milestones">
              <AccordionTrigger className="text-base font-medium py-2">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Milestones
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {milestones.map((milestone) => (
                    <div 
                      key={milestone.percentage}
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        milestone.achieved 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' 
                          : 'bg-muted/10'
                      }`}
                    >
                      <div>
                        <span className="font-medium">{milestone.label}</span>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(target * (milestone.percentage / 100))}
                        </div>
                      </div>
                      {milestone.achieved ? (
                        <Badge className="bg-green-600">Achieved</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          {Math.round(progress)}% of {milestone.percentage}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Weekly Results Section */}
            <AccordionItem value="weekly">
              <AccordionTrigger className="text-base font-medium py-2">
                <div className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Weekly Results
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {filledWeeks.length > 0 ? (
                    filledWeeks.map((week) => (
                      <div 
                        key={week.week}
                        className={`flex items-center justify-between p-2 rounded-md border ${
                          week.profit > 0
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' 
                            : week.profit < 0
                            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900'
                            : 'bg-muted/10'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-medium flex items-center">
                            Week {week.week}
                            {week.week === currentWeekNum && (
                              <Badge className="ml-2 bg-primary text-xs">Current</Badge>
                            )}
                          </div>
                          {week.displayName && (
                            <div className="text-xs text-muted-foreground">
                              {week.displayName}
                            </div>
                          )}
                          {week.startDate && week.endDate && (
                            <div className="text-xs text-muted-foreground">
                              {format(parseISO(week.startDate), 'MMM d')} - {format(parseISO(week.endDate), 'MMM d, yyyy')}
                            </div>
                          )}
                          {week.entries && week.entries.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {week.entries.length} {week.entries.length === 1 ? 'trade' : 'trades'}
                            </div>
                          )}
                        </div>
                        <div className={`font-medium ${
                          week.profit > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : week.profit < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : ''
                        }`}>
                          {formatCurrency(week.profit)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No weekly data available
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* New Calendar Timeline Section */}
            <AccordionItem value="calendar">
              <AccordionTrigger className="text-base font-medium py-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-7 gap-1 mt-2">
                  {/* Week Day Headers */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Cells */}
                  {Array.from({ length: Math.min(filledWeeks.length * 7, 28) }, (_, i) => {
                    // Get the week and day
                    const weekIndex = Math.floor(i / 7);
                    const dayIndex = i % 7;
                    const week = filledWeeks[weekIndex];
                    
                    if (!week || !week.startDate) return (
                      <div key={i} className="h-6 w-full rounded-sm bg-muted/30" />
                    );
                    
                    // Calculate the day date
                    const weekStart = startOfWeek(parseISO(week.startDate), { weekStartsOn: 1 });
                    const dayDate = new Date(weekStart);
                    dayDate.setDate(weekStart.getDate() + dayIndex);
                    
                    // Check if there are entries on this day
                    const dayEntries = week.entries?.filter(entry => {
                      if (!entry.timestamp) return false;
                      const entryDate = new Date(entry.timestamp);
                      return entryDate.getDate() === dayDate.getDate() &&
                             entryDate.getMonth() === dayDate.getMonth() &&
                             entryDate.getFullYear() === dayDate.getFullYear();
                    }) || [];
                    
                    // Check if this day is today
                    const isToday = dayDate.toDateString() === new Date().toDateString();
                    
                    let dayTotal = 0;
                    dayEntries.forEach(entry => {
                      dayTotal += parseFloat(entry.amount) || 0;
                    });
                    
                    // Calculate the color intensity based on activity
                    const bgColor = dayEntries.length > 0 
                      ? dayTotal > 0 
                        ? 'bg-green-500/30 dark:bg-green-500/20' 
                        : 'bg-red-500/30 dark:bg-red-500/20'
                      : 'bg-muted/30';
                    
                    return (
                      <div 
                        key={i} 
                        className={`h-6 w-full rounded-sm flex items-center justify-center relative ${bgColor} ${isToday ? 'ring-1 ring-primary' : ''}`}
                        title={`${format(dayDate, 'MMM d, yyyy')}${dayEntries.length > 0 ? ` - ${dayEntries.length} entries` : ''}`}
                      >
                        <span className="text-xs">{dayDate.getDate()}</span>
                        {dayEntries.length > 0 && (
                          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-xs text-center text-muted-foreground mt-2">
                  Calendar view shows up to 4 weeks of activity
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </div>
      
      <CardFooter className="flex justify-end mt-2">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={exportAsImage}
          disabled={isExporting}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export as Image'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalSummaryReport; 