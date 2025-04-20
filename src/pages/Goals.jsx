import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Target } from 'lucide-react';
import GoalList from '../components/GoalManager/GoalList';
import AchievementsList from '../components/Achievements/AchievementsList';
import goalManager from '../services/GoalManager';
import achievementManager from '../services/AchievementManager';
import { Button } from '../components/ui/button';

const Goals = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark'); // Default to dark theme
  const [debugMode, setDebugMode] = useState(false);
  
  // Handle debug mode activation (press D + E + B + U + G keys in sequence)
  useEffect(() => {
    const keys = [];
    const debugCode = ['d', 'e', 'b', 'u', 'g'];
    
    const handleKeyPress = (e) => {
      keys.push(e.key.toLowerCase());
      if (keys.length > debugCode.length) {
        keys.shift();
      }
      
      if (keys.join('') === debugCode.join('')) {
        setDebugMode(true);
        console.log('Debug mode activated!');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Debug function to unlock all achievements
  const unlockAllAchievements = () => {
    try {
      console.log('Unlocking all achievements for debugging');
      achievementManager.debugUnlockAll();
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error unlocking achievements:', err);
    }
  };
  
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
      
      {debugMode && (
        <div className="bg-yellow-100 border-yellow-300 border p-2 rounded-md">
          <p className="text-yellow-800 text-sm mb-2">Debug Mode Active</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={unlockAllAchievements}>
              Unlock All Achievements
            </Button>
            <Button size="sm" variant="outline" onClick={() => achievementManager.resetAchievements()}>
              Reset Achievements
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setDebugMode(false);
              setRefreshTrigger(prev => prev + 1);
            }}>
              Exit Debug Mode
            </Button>
          </div>
        </div>
      )}
      
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