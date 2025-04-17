import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Moon, Sun, Settings } from 'lucide-react';
import GoalStats from '../components/GoalStats';
import ProfitGraph from '../components/ProfitGraph';
import WeekInput from '../components/WeekInput';
import Toast from '../components/Toast';
import AIAssistant from '../components/AIAssistant';

export default function Home({
  theme,
  toggleTheme,
  goalName,
  target,
  totalProfit,
  remaining,
  progressPercentage,
  displayedWeeks,
  weeklyTargetAverage,
  prediction,
  showCumulative,
  weeks,
  streakInfo,
  visibleWeeks,
  handleProfitChange,
  toast,
  setToast
}) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-6 transition-colors duration-200`}>
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-porsche-black'}`}>
            {goalName} Tracker
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Track your progress towards your {goalName} goal
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/settings')} 
            className="rounded-full"
            title="Settings"
          >
            <Settings size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme} 
            className="rounded-full"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
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
            <AIAssistant 
              theme={theme}
              weeks={weeks}
              target={target}
              goalName={goalName}
              totalProfit={totalProfit}
              remaining={remaining}
              progressPercentage={progressPercentage}
              prediction={prediction}
              streakInfo={streakInfo}
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
          <div className="md:col-span-12">
            <ProfitGraph 
              data={displayedWeeks}
              showCumulative={showCumulative}
              theme={theme}
            />
          </div>

          <div className="md:col-span-12">
            <WeekInput 
              weeks={displayedWeeks}
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
    </div>
  );
} 