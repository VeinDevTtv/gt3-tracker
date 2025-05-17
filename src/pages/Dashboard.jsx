import React, { useState, useEffect } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency } from '@/utils/formatters';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Flame,
  TrendingUp,
  Target,
  Clock,
  Coins,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  Timer,
  Clock9,
  AlertTriangle,
  Eye,
  EyeOff,
  History
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import GoalSummaryReport from '@/components/GoalSummaryReport';
import TimelineView from '@/components/TimelineView';
import MilestoneProgressMap from '@/components/milestones/MilestoneProgressMap';
import BackfillWeekForm from '@/components/GoalManager/BackfillWeekForm';
import { parseISO, differenceInDays, addDays, format, isAfter, differenceInWeeks } from 'date-fns';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const { 
    activeGoal, 
    calculateProgress, 
    calculateStreakInfo,
    getFilteredWeeks,
    getGoalProgressData,
    toggleGoalTimeSensitivity
  } = useGoals();
  
  // Get goal-specific filtered data
  const goalData = activeGoal ? getGoalProgressData(activeGoal.id) : null;
  const filteredWeeks = activeGoal ? getFilteredWeeks(activeGoal.id) : [];
  
  // Force refresh when goal changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [activeGoal?.id]);
  
  // Handle backfill completion
  const handleBackfillComplete = (result) => {
    if (result && result.success) {
      // Force a refresh of the dashboard
      setRefreshKey(prev => prev + 1);
    }
  };
  
  if (!activeGoal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12 space-y-4">
          <Target className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">No Active Goal</h1>
          <p className="text-muted-foreground">
            Create or select a goal to view your dashboard
          </p>
          <Button asChild className="mt-4">
            <a href="/goals">Go to Goals</a>
          </Button>
        </div>
      </div>
    );
  }
  
  // Get progress data
  const progress = goalData?.progress || calculateProgress(activeGoal.id) || {
    totalSaved: 0,
    remaining: activeGoal.target,
    percentComplete: 0,
    weeksActive: 0,
    targetEndDate: activeGoal.deadline ? parseISO(activeGoal.deadline) : null
  };
  
  // Get streak information
  const streakInfo = goalData?.streak || calculateStreakInfo(activeGoal.id) || {
    currentStreak: 0,
    longestStreak: 0,
    totalFilledWeeks: 0
  };
  
  // Calculate days active
  const startDate = activeGoal.startDate ? parseISO(activeGoal.startDate) : new Date();
  const daysActive = differenceInDays(new Date(), startDate);
  
  // Calculate week stats from filtered weeks
  const weekStats = {
    totalWeeks: filteredWeeks.length,
    filledWeeks: filteredWeeks.filter(w => w.isFilled).length,
    profitableWeeks: filteredWeeks.filter(w => w.profit > 0).length,
    lossWeeks: filteredWeeks.filter(w => w.profit < 0).length,
    flatWeeks: filteredWeeks.filter(w => w.isFilled && w.profit === 0).length,
  };
  
  // Calculate average weekly profit
  const averageWeeklyProfit = weekStats.filledWeeks > 0
    ? progress.totalSaved / weekStats.filledWeeks
    : 0;
  
  // Calculate percentage of profitable weeks
  const profitableWeekPercentage = weekStats.filledWeeks > 0
    ? (weekStats.profitableWeeks / weekStats.filledWeeks) * 100
    : 0;
  
  // Calculate estimated completion
  let estimatedCompletion = null;
  let estimatedWeeksToCompletion = null;
  
  if (averageWeeklyProfit > 0) {
    estimatedWeeksToCompletion = Math.ceil(progress.remaining / averageWeeklyProfit);
    estimatedCompletion = addDays(new Date(), estimatedWeeksToCompletion * 7);
  }
  
  // Calculate deadline and progress towards it
  let deadlineInfo = null;
  if (activeGoal.deadline) {
    const deadline = parseISO(activeGoal.deadline);
    const today = new Date();
    const isDeadlinePassed = isAfter(today, deadline);
    const daysToDeadline = differenceInDays(deadline, today);
    const weeksToDeadline = Math.ceil(daysToDeadline / 7);
    const totalDuration = differenceInDays(deadline, startDate);
    const elapsedPercentage = Math.min(100, (daysActive / totalDuration) * 100);
    
    deadlineInfo = {
      date: deadline,
      isPassed: isDeadlinePassed,
      daysRemaining: daysToDeadline,
      weeksRemaining: weeksToDeadline,
      elapsedPercentage: elapsedPercentage,
      isOnTrack: progress.percentComplete >= elapsedPercentage
    };
  }
  
  // Handle time sensitivity toggle
  const handleToggleTimeSensitivity = () => {
    toggleGoalTimeSensitivity(activeGoal.id);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with Goal Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-1">
            <Target className="h-5 w-5" /> 
            {activeGoal.name}
            {activeGoal.isTimeSensitive === false && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-2 flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      <span>Unrestricted</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      This goal counts all trades regardless of when they occurred.
                      Click to make it time-restricted.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h1>
          <div className="text-muted-foreground flex items-center gap-2 flex-wrap">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Started {format(startDate, 'MMM d, yyyy')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {daysActive > 0 ? `${daysActive} days active` : 'Just started'}
            </span>
            {deadlineInfo && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center">
                  <Timer className="h-4 w-4 mr-1" />
                  {deadlineInfo.isPassed 
                    ? 'Deadline passed'
                    : `${deadlineInfo.daysRemaining} days remaining`
                  }
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleToggleTimeSensitivity}
                >
                  {activeGoal.isTimeSensitive !== false ? (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Time-Restricted</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>Unrestricted</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {activeGoal.isTimeSensitive !== false
                    ? "This goal only counts trades that occurred after its start date. Click to include all trades."
                    : "This goal counts all trades regardless of date. Click to only include trades after start date."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button asChild size="sm">
            <a href="/goals">Manage Goals</a>
          </Button>
        </div>
      </div>
      
      {/* Time Window Alert */}
      {activeGoal.isTimeSensitive !== false && (
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-900 p-3 rounded-md flex items-center gap-2">
          <Clock9 className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-blue-700 dark:text-blue-300">Time-Restricted Goal:</span>{' '}
            Only showing data from {format(startDate, 'MMM d, yyyy')} onwards.
            {activeGoal.deadline && (
              <span> Until {format(parseISO(activeGoal.deadline), 'MMM d, yyyy')}.</span>
            )}
          </div>
        </div>
      )}
      
      {/* Tabs Navigation */}
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="details">Detailed Reports</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Total Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="py-1 space-y-3">
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-bold">
                    {formatCurrency(progress.totalSaved)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {formatCurrency(activeGoal.target)}
                  </div>
                </div>
                <Progress value={progress.percentComplete} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>{Math.round(progress.percentComplete)}% complete</div>
                  <div>{formatCurrency(progress.remaining)} remaining</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Streak Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Flame className="h-4 w-4 mr-2 text-primary" />
                  Weekly Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="py-1">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="text-2xl font-bold">
                    {streakInfo.currentStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current streak
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Best streak</div>
                    <div>{streakInfo.longestStreak} weeks</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Win rate</div>
                    <div>{Math.round(profitableWeekPercentage)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Weekly Average */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <BarChart className="h-4 w-4 mr-2 text-primary" />
                  Weekly Average
                </CardTitle>
              </CardHeader>
              <CardContent className="py-1">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="text-2xl font-bold">
                    {formatCurrency(averageWeeklyProfit)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Per week
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Weeks</div>
                    <div>
                      {weekStats.filledWeeks} / {weekStats.totalWeeks}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Profitable</div>
                    <div className="text-green-600 dark:text-green-400">
                      {weekStats.profitableWeeks}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Loss</div>
                    <div className="text-red-600 dark:text-red-400">
                      {weekStats.lossWeeks}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Completion Estimate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  Estimated Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="py-1">
                {progress.percentComplete >= 100 ? (
                  <div className="flex items-center justify-center h-full py-2">
                    <Badge className="bg-green-600">Goal Completed!</Badge>
                  </div>
                ) : averageWeeklyProfit > 0 ? (
                  <>
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="text-2xl font-bold">
                        {estimatedCompletion && format(estimatedCompletion, 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Projected
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <div className="text-muted-foreground text-xs">Weeks needed</div>
                        <div>{estimatedWeeksToCompletion}</div>
                      </div>
                      
                      {deadlineInfo && (
                        <div className="flex justify-between">
                          <div className="text-muted-foreground text-xs">Deadline status</div>
                          <div className={deadlineInfo.isOnTrack ? 'text-green-600' : 'text-amber-600'}>
                            {deadlineInfo.isOnTrack ? 'On track' : 'Behind'}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-2 text-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-sm text-muted-foreground">
                      Need more data to estimate
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Timeline View */}
          <TimelineView refreshKey={refreshKey} />
          
          {/* Backfill Week Form */}
          <BackfillWeekForm goalId={activeGoal.id} onBackfillComplete={handleBackfillComplete} />
        </TabsContent>
        
        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <MilestoneProgressMap refreshKey={refreshKey} />
        </TabsContent>
        
        {/* Detailed Reports Tab */}
        <TabsContent value="details" className="space-y-6">
          <GoalSummaryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard; 