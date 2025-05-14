import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import GoalStats from '../components/GoalStats';
import ProfitGraph from '../components/ProfitGraph';
import WeekInput from '../components/WeekInput';
import Toast from '../components/Toast';
import ComingSoon from '../components/ComingSoon';
import { Button } from "../components/ui/button";
import { useGoals } from "../contexts/GoalsContext";
import { BarChart3, Settings, Download, ArrowUpRight, Image } from "lucide-react";
import CustomAIAssistant from '../components/CustomAIAssistant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { checkGoalsSystemStatus, checkMilestoneProgressMapRendering } from '../utils/checks';

export default function Home({
  theme,
  visibleWeeks,
  showCumulative,
  toast,
  setToast,
}) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { 
    goals,
    currentGoal, 
    isLoading, 
    error, 
    updateWeekData, 
    calculateProgress,
    calculateStreakInfo,
    exportGoalAsCSV,
    generateSharingImage
  } = useGoals(); 

  console.log("Home.jsx - Current Goal from Context:", currentGoal);

  const [showProfitModal, setShowProfitModal] = useState(false);
  const [profitAmount, setProfitAmount] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(null);

  const visibleWeeksData = visibleWeeks || 12;

  const goalDetails = useMemo(() => {
    if (!currentGoal) {
      return {
        id: null,
        name: 'Loading Goal...',
        target: 0,
        weeks: [],
        startDate: null,
        totalSaved: 0,
        remaining: 0,
        progressPercentage: 0,
        streakInfo: { currentStreak: 0, longestStreak: 0 },
        prediction: { insufficient: true, message: "Loading..." }
      };
    }
    
    const progress = calculateProgress(currentGoal.id);
    const streak = calculateStreakInfo(currentGoal.id);
    const weeks = currentGoal.weeks || [];
    const remaining = progress.remaining;

    // --- Calculate Prediction --- 
    let calculatedPrediction = { insufficient: true, message: "Calculating..." };
    const weeksWithProfit = weeks.filter(week => week.profit > 0);

    if (weeksWithProfit.length === 0) {
      calculatedPrediction = { insufficient: true, message: "No savings data", reason: "start_saving" };
    } else {
      const avgWeeklyProfit = weeksWithProfit.reduce((sum, week) => sum + week.profit, 0) / weeksWithProfit.length;
      
      if (avgWeeklyProfit <= 0) {
        calculatedPrediction = { insufficient: true, message: "Avg. profit ≤ 0", reason: "negative_profit", data: { avgWeeklyProfit } };
      } else if (remaining <= 0) {
         calculatedPrediction = { insufficient: false, message: "Goal Reached!" }; // Handle goal reached case
      } else {
        const weeksNeeded = Math.ceil(remaining / avgWeeklyProfit);
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (weeksNeeded * 7));
        const formattedDate = targetDate.toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric' 
        });
        
        calculatedPrediction = {
          weeksNeeded,
          targetDate: formattedDate,
          avgWeeklyProfit,
          confidence: weeksWithProfit.length === 1 ? "low" : weeksWithProfit.length < 4 ? "medium" : "high",
          dataPoints: weeksWithProfit.length,
          insufficient: false
        };
      }
    }
    // --- End Calculate Prediction ---

    return {
      id: currentGoal.id,
      name: currentGoal.name || 'Unnamed Goal',
      target: currentGoal.target || 0,
      weeks: weeks,
      startDate: currentGoal.startDate,
      totalSaved: progress.totalSaved,
      remaining: remaining,
      progressPercentage: progress.percentComplete,
      streakInfo: streak,
      prediction: calculatedPrediction
    };
  }, [currentGoal, goals, calculateProgress, calculateStreakInfo]);

  const weeksForInput = useMemo(() => {
    const currentWeeks = goalDetails.weeks;
    return currentWeeks && currentWeeks.length > 0 
      ? currentWeeks.slice(0, Math.min(visibleWeeksData, currentWeeks.length)) 
      : Array.from({ length: visibleWeeksData }, (_, i) => ({
        week: i + 1,
        profit: 0,
        cumulative: 0
      }));
  }, [goalDetails.weeks, visibleWeeksData]);
  
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleWeekProfitUpdate = (weekIndex, profitValue) => {
    if (!currentGoal || currentGoal.id === null) {
      console.error("Cannot update profit: No active goal selected.");
      setToast && setToast('Error: No goal selected.', '⚠️');
      return;
    }
    updateWeekData(currentGoal.id, weekIndex, profitValue); 
  };

  const handleProfitSubmit = () => {
    if (selectedWeek && profitAmount && currentGoal && currentGoal.id !== null) {
      const weekIndex = selectedWeek - 1;
      const amount = parseFloat(profitAmount);

      if (!isNaN(amount)) {
        console.log(`Adding profit of ${amount} to week ${selectedWeek} via modal`);
        updateWeekData(currentGoal.id, weekIndex, amount);

        setShowProfitModal(false);
        setProfitAmount('');
        setSelectedWeek(null);
      } else {
         setToast && setToast('Invalid amount entered.', '⚠️');
      }
    } else {
       setToast && setToast('Please select a week and enter an amount.', '⚠️');
    }
  };

  const handleExportData = () => {
    if (goalDetails.id) {
      exportGoalAsCSV(goalDetails.id);
    } else {
      console.error("Cannot export: No active goal ID.");
      setToast && setToast('Cannot export data: No goal selected.', '⚠️');
    }
  };
  
  const handleViewCharts = () => {
    navigate('/charts');
  };

  const handleGenerateImage = () => {
    generateSharingImage();
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading goal data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error loading goal data: {error}</div>;
  }
  
  if (!currentGoal) {
     return <div className="p-6 text-center">No goal selected or available. Please create or select a goal in Settings.</div>;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-6 transition-colors duration-200`}>
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-porsche-black'}`}>
            {goalDetails.name} Tracker
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentUser ? `Hello, ${currentUser.username || currentUser.email?.split('@')[0]}! ` : ''}
            Track your progress towards your {goalDetails.name} goal
          </p>
        </div>
        <div>
          <img 
            src="https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png" 
            alt="Porsche GT3" 
            className="h-24 w-auto"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-12">
            <GoalStats 
              target={goalDetails.target}
              totalProfit={goalDetails.totalSaved}
              remaining={goalDetails.remaining}
              progressPercentage={goalDetails.progressPercentage}
              prediction={goalDetails.prediction}
              streakInfo={goalDetails.streakInfo}
              theme={theme}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{goalDetails.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {Math.round(goalDetails.progressPercentage)}% Complete
                  </p>
                </div>
                <Button className="gap-2" size="sm" onClick={() => setShowProfitModal(true)}>
                  <ArrowUpRight className="h-4 w-4" /> Add Profit
                </Button>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
                <div 
                  className="bg-primary h-4 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${goalDetails.progressPercentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Saved</p>
                  <p className="text-2xl font-bold">{formatMoney(goalDetails.totalSaved)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Remaining</p>
                  <p className="text-2xl font-bold">{formatMoney(goalDetails.remaining)}</p>
                </div>
              </div>
            </div>
            
            <ProfitGraph 
              data={weeksForInput}
              showCumulative={showCumulative}
              theme={theme}
            />
          </div>
          
          <div className="md:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Target</h2>
              <p className="text-3xl font-bold mb-6">{formatMoney(goalDetails.target)}</p>
              
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={handleExportData} disabled={!goalDetails.id}>
                  <Download className="h-4 w-4" /> Export Data
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={handleViewCharts}>
                  <BarChart3 className="h-4 w-4" /> View Charts
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={handleGenerateImage} disabled={!goalDetails.id}>
                  <Image className="h-4 w-4" /> Export as Image
                </Button>
              </div>
            </div>
            
            <ComingSoon 
              title="Community Features"
              description="Connect with other savers and compare progress"
              theme={theme}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-1">
            <WeekInput 
              weeks={weeksForInput}
              onProfitChange={handleWeekProfitUpdate}
              theme={theme}
              currentStreak={goalDetails.streakInfo.currentStreak}
            />
          </div>
        </div>
      </main>

      <footer className={`max-w-6xl mx-auto mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>{goalDetails.name} Savings Tracker © {new Date().getFullYear()}</p>
      </footer>
      
      <Dialog open={showProfitModal} onOpenChange={setShowProfitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Profit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="week" className="text-right">
                Week
              </Label>
              <Input
                id="week"
                type="number"
                min="1"
                max={goalDetails.weeks?.length || 52}
                value={selectedWeek || ''}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value) || null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="100"
                value={profitAmount}
                onChange={(e) => setProfitAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleProfitSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <CustomAIAssistant 
        theme={theme}
        weeks={goalDetails.weeks}
        goalName={goalDetails.name}
        target={goalDetails.target}
        totalProfit={goalDetails.totalSaved}
        remaining={goalDetails.remaining}
        progressPercentage={goalDetails.progressPercentage}
        prediction={goalDetails.prediction}
        streakInfo={goalDetails.streakInfo}
      />
      
      {toast && (
        <Toast 
          message={toast.message} 
          emoji={toast.emoji} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Add the GoalsSystemStatus component at the end of the dashboard */}
      <GoalsSystemStatus />
    </div>
  );
}

// Status indicator component for the Goals system 
const GoalsSystemStatus = () => {
  const [status, setStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Run the checks
    const goalsStatus = checkGoalsSystemStatus();
    const milestoneMapStatus = checkMilestoneProgressMapRendering();
    
    setStatus({
      goalsSystem: goalsStatus,
      milestoneMap: milestoneMapStatus
    });
  }, []);

  if (!status) {
    return null;
  }

  const { goalsSystem, milestoneMap } = status;
  
  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'operational':
        return 'text-green-500 dark:text-green-400';
      case 'initialized_but_empty':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'error':
      case 'failed_initialization':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="mt-4 p-4 bg-muted/20 rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Goals System Status</h3>
        <span className={`text-sm font-medium ${getStatusColor(goalsSystem.status)}`}>
          {goalsSystem.status === 'operational' ? 'Operational' : 
           goalsSystem.status === 'initialized_but_empty' ? 'Initialized (No Goals)' : 
           goalsSystem.status === 'error' ? 'Error' : 'Not Ready'}
        </span>
      </div>
      
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-primary hover:underline mt-1"
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
      
      {showDetails && (
        <div className="mt-2 space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Services Initialized:</span>
            <span className={goalsSystem.initialized ? 'text-green-500' : 'text-red-500'}>
              {goalsSystem.initialized ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Goals Exist:</span>
            <span className={goalsSystem.goalsExist ? 'text-green-500' : 'text-red-500'}>
              {goalsSystem.goalsExist ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Goal Set:</span>
            <span className={goalsSystem.activeGoalSet ? 'text-green-500' : 'text-red-500'}>
              {goalsSystem.activeGoalSet ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Milestones Exist:</span>
            <span className={goalsSystem.milestonesExist ? 'text-green-500' : 'text-red-500'}>
              {goalsSystem.milestonesExist ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>MilestoneProgressMap Rendering:</span>
            <span className={milestoneMap ? 'text-green-500' : 'text-red-500'}>
              {milestoneMap ? 'Ready' : 'Not Ready'}
            </span>
          </div>
          
          <div className="pt-2">
            <Link to="/goals">
              <Button size="sm" variant="outline" className="w-full">
                Go to Goals Page
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}; 