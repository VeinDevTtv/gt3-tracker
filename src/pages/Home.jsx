import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProgressBar from '../components/ProgressBar';
import GoalStats from '../components/GoalStats';
import ProfitGraph from '../components/ProfitGraph';
import WeekInput from '../components/WeekInput';
import Toast from '../components/Toast';
import ComingSoon from '../components/ComingSoon';

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
  toggleAI,
  showAIAssistant
}) {
  const { currentUser } = useAuth();
  const visibleWeeksData = visibleWeeks || 12;
  
  // Ensure weeks is valid and create a safe version for components
  const visibleWeeksDataSafe = weeks && weeks.length > 0 
    ? weeks.slice(0, visibleWeeksData) 
    : Array.from({ length: visibleWeeksData }, (_, i) => ({
      week: i + 1,
      profit: 0,
      cumulative: 0
    }));

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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-4">
            <ComingSoon 
              title="AI Assistant"
              description="Smart assistance for your savings journey"
              theme={theme}
            />
          </div>
          
          <div className="md:col-span-8">
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <ProfitGraph 
              data={visibleWeeksDataSafe}
              showCumulative={showCumulative}
              theme={theme}
            />
          </div>
          
          <div className="md:col-span-4">
            <ComingSoon 
              title="Community Features"
              description="Connect with other savers and compare progress"
              theme={theme}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12">
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
      
      {toast && (
        <Toast 
          message={toast.message} 
          emoji={toast.emoji} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {showAIAssistant && (
        <ComingSoon 
          title="AI Chat Assistant"
          description="Our AI chat assistant is coming soon"
          theme={theme}
        />
      )}
    </div>
  );
} 