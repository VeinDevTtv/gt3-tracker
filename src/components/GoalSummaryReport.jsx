import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar, Download, FileText, Award, TrendingUp, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import html2canvas from 'html2canvas';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

/**
 * Component for generating a goal summary report
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
  
  // Calculate weekly average
  const filledWeeks = weeks.filter(week => week.isFilled || week.profit !== 0);
  let totalProfit = 0;
  let totalProfitableWeeks = 0;
  let totalLossWeeks = 0;
  let biggestGain = 0;
  let biggestLoss = 0;
  
  filledWeeks.forEach(week => {
    totalProfit += week.profit || 0;
    if (week.profit > 0) totalProfitableWeeks++;
    if (week.profit < 0) totalLossWeeks++;
    if (week.profit > biggestGain) biggestGain = week.profit;
    if (week.profit < 0 && week.profit < biggestLoss) biggestLoss = week.profit;
  });
  
  const weeklyAverage = filledWeeks.length > 0 ? totalProfit / filledWeeks.length : 0;
  const weeklyAveragePercent = target ? (weeklyAverage / (target / 52)) * 100 : 0;
  
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
            <p className="text-sm text-muted-foreground">
              Started on {formatDate(startDate)} ({daysActive} days / {weeksActive} weeks)
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
                        ({Math.round(weeklyAveragePercent)}% of target)
                      </span>
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
                    <div className="text-sm text-muted-foreground">Biggest Week</div>
                    <div className="font-medium">
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(biggestGain)}
                      </span>
                      {biggestLoss !== 0 && (
                        <span className="text-red-600 dark:text-red-400 ml-2">
                          {formatCurrency(biggestLoss)}
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
                  {filledWeeks.map((week) => (
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
                  ))}
                  
                  {filledWeeks.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No weekly data available
                    </div>
                  )}
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