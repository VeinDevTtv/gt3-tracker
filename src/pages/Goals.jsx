import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Target } from 'lucide-react';
import GoalList from '../components/GoalManager/GoalList';
import AchievementsList from '../components/Achievements/AchievementsList';
import goalManager from '../services/GoalManager';
import achievementManager from '@/services/AchievementManager';

const Goals = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark'); // Default to dark theme
  
  useEffect(() => {
    try {
      console.log('Goals component mounted');
      
      // Get theme from localStorage or default to 'dark'
      const savedTheme = localStorage.getItem('savings-tracker-theme');
      setTheme(savedTheme || 'dark');
      
      // Initialize managers on component mount
      console.log('Initializing goal manager...');
      goalManager.initialize();
      
      console.log('Initializing achievement manager...');
      achievementManager.initialize();
      
      // Check for achievements based on current data
      console.log('Getting goals data...');
      const goals = goalManager.getGoals();
      console.log('Goals:', goals);
      
      const activeGoal = goalManager.getActiveGoal();
      console.log('Active goal:', activeGoal);
      
      const weeks = activeGoal?.weeks || [];
      console.log('Weeks:', weeks);
      
      console.log('Checking for achievements...');
      achievementManager.checkForAchievements({
        goals,
        activeGoal,
        weeks
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error in Goals component:', err);
      setError(err.message || 'An error occurred loading goals');
      setIsLoading(false);
    }
  }, []);
  
  // Handle goal changes (selection, creation, update, delete)
  const handleGoalChange = (goalId) => {
    try {
      console.log('Goal changed:', goalId);
      
      // Force a refresh on the achievements tab
      setRefreshTrigger(prev => prev + 1);
      
      // Re-check achievements
      const goals = goalManager.getGoals();
      const activeGoal = goalManager.getActiveGoal();
      const weeks = activeGoal?.weeks || [];
      
      console.log('Checking achievements after goal change');
      achievementManager.checkForAchievements({
        goals,
        activeGoal,
        weeks
      });
    } catch (err) {
      console.error('Error handling goal change:', err);
      setError(err.message || 'An error occurred updating goals');
    }
  };
  
  if (error) {
    return (
      <div className="container max-w-4xl py-6 space-y-6">
        <h1 className="text-2xl font-bold">Goals & Achievements</h1>
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6 space-y-6">
        <h1 className="text-2xl font-bold">Goals & Achievements</h1>
        <div className="p-4 text-center">Loading...</div>
      </div>
    );
  }
  
  return (
    <main className="container max-w-4xl py-6 space-y-6">
      <h1 className="text-2xl font-bold">Goals & Achievements</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" /> 
            Goals
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> 
            Achievements
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="goals" className="space-y-6">
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 border">
              <GoalList onGoalChange={handleGoalChange} />
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-6">
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 border">
              {/* Force a refresh when tab changes or goal changes */}
              <AchievementsList key={`achievements-${refreshTrigger}`} theme={theme} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
};

export default Goals; 