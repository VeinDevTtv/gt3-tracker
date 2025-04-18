import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProgressBar from '../components/ProgressBar';
import GoalStats from '../components/GoalStats';
import ProfitGraph from '../components/ProfitGraph';
import WeekInput from '../components/WeekInput';
import Toast from '../components/Toast';
import ComingSoon from '../components/ComingSoon';
import { GoalSelector } from "../components/GoalSelector";
import { Button } from "../components/ui/button";
import { useGoals } from "../contexts/GoalsContext";
import { BarChart3, Settings, Download, ArrowUpRight } from "lucide-react";
import CustomAIAssistant from '../components/CustomAIAssistant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Home({
  theme,
  goalName,
  target,
  totalProfit,
  remaining,
  progressPercentage,
  currentWeek,
  weeksRemaining,
  weeklyTargetAverage,
  prediction,
  showCumulative,
  weeks,
  streakInfo,
  visibleWeeks,
  handleProfitChange,
  toast,
  setToast,
  dataVisuals,
  setActiveTabIndex
}) {
  const { currentUser } = useAuth();
  const { currentGoal } = useGoals();
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [profitAmount, setProfitAmount] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(null);
  
  const visibleWeeksData = visibleWeeks || 12;
  
  // Ensure weeks is valid and create a safe version for components
  const visibleWeeksDataSafe = weeks && weeks.length > 0 
    ? weeks.slice(0, visibleWeeksData) 
    : Array.from({ length: visibleWeeksData }, (_, i) => ({
      week: i + 1,
      profit: 0,
      cumulative: 0
    }));

  // Calculate remaining amount
  const totalSaved = currentGoal?.weeks[currentGoal.weeks.length - 1]?.cumulative || 0;
  const remainingAmount = currentGoal?.target - totalSaved;
  
  // Calculate progress percentage
  const progressPercentageCalc = Math.min(100, (totalSaved / currentGoal?.target) * 100);

  // Helper function to format money
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle profit submission
  const handleProfitSubmit = () => {
    if (selectedWeek && profitAmount) {
      const weekIndex = selectedWeek - 1;
      const amount = parseFloat(profitAmount);
      if (!isNaN(amount)) {
        handleProfitChange(weekIndex, amount);
        setShowProfitModal(false);
        setProfitAmount('');
        setSelectedWeek(null);
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-6 transition-colors duration-200`}>
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-porsche-black'}`}>
            {goalName} Tracker
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentUser ? `Hello, ${currentUser.username || currentUser.email?.split('@')[0]}! ` : ''}
            Track your progress towards your {goalName} goal
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
        {/* Goal Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-12">
            <GoalStats 
              target={target}
              totalProfit={totalProfit}
              remaining={remaining}
              progressPercentage={progressPercentage}
              weeklyTargetAverage={weeklyTargetAverage}
              prediction={prediction}
              streakInfo={streakInfo}
              theme={theme}
            />
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Progress and Graph Section */}
          <div className="md:col-span-8">
            {/* Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{currentGoal?.goalName}</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {Math.round(progressPercentageCalc)}% Complete
                  </p>
                </div>
                <Button className="gap-2" size="sm" onClick={() => setShowProfitModal(true)}>
                  <ArrowUpRight className="h-4 w-4" /> Add Profit
                </Button>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
                <div 
                  className="bg-primary h-4 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${progressPercentageCalc}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Saved</p>
                  <p className="text-2xl font-bold">{formatMoney(totalSaved)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Remaining</p>
                  <p className="text-2xl font-bold">{formatMoney(remainingAmount)}</p>
                </div>
              </div>
            </div>
            
            {/* Graph Section */}
            <ProfitGraph 
              data={visibleWeeksDataSafe}
              showCumulative={showCumulative}
              theme={theme}
            />
          </div>
          
          {/* Target and Actions Section */}
          <div className="md:col-span-4">
            {/* Target Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Target</h2>
              <p className="text-3xl font-bold mb-6">{formatMoney(currentGoal?.target)}</p>
              
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <Download className="h-4 w-4" /> Export Data
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <BarChart3 className="h-4 w-4" /> View Charts
                </Button>
              </div>
            </div>
            
            {/* Community Features */}
            <ComingSoon 
              title="Community Features"
              description="Connect with other savers and compare progress"
              theme={theme}
            />
          </div>
        </div>

        {/* Weekly Input Section */}
        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-1">
            <WeekInput 
              weeks={visibleWeeksDataSafe}
              onProfitChange={handleProfitChange}
              weeklyTargetAverage={weeklyTargetAverage}
              theme={theme}
              currentStreak={streakInfo.currentStreak}
            />
          </div>
        </div>
      </main>

      <footer className={`max-w-6xl mx-auto mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>{goalName} Savings Tracker © {new Date().getFullYear()}</p>
      </footer>
      
      {/* Add Profit Modal */}
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
                max={weeks?.length || 52}
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
      
      {/* AI Assistant floating component */}
      <CustomAIAssistant 
        theme={theme}
        weeks={weeks}
        goalName={goalName}
        target={target}
        totalProfit={totalProfit}
        remaining={remaining}
        progressPercentage={progressPercentage}
        prediction={prediction}
        streakInfo={streakInfo}
        weeklyTargetAverage={weeklyTargetAverage}
      />
      
      {toast && (
        <Toast 
          message={toast.message} 
          emoji={toast.emoji} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
} 