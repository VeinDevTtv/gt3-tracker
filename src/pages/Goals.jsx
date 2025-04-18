import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Target } from 'lucide-react';
import GoalList from '../components/GoalManager/GoalList';
import AchievementsList from '../components/Achievements/AchievementsList';
import goalManager from '../services/GoalManager';
import achievementManager from '../services/AchievementManager';

const Goals = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    // Initialize managers on component mount
    goalManager.initialize();
    achievementManager.initialize();
    
    // Check for achievements based on current data
    const goals = goalManager.getGoals();
    const activeGoal = goalManager.getActiveGoal();
    const weeks = activeGoal?.weeks || [];
    
    achievementManager.checkForAchievements({
      goals,
      activeGoal,
      weeks
    });
  }, []);
  
  // Handle goal changes (selection, creation, update, delete)
  const handleGoalChange = (goalId) => {
    // Force a refresh on the achievements tab
    setRefreshTrigger(prev => prev + 1);
    
    // Re-check achievements
    const goals = goalManager.getGoals();
    const activeGoal = goalManager.getActiveGoal();
    const weeks = activeGoal?.weeks || [];
    
    achievementManager.checkForAchievements({
      goals,
      activeGoal,
      weeks
    });
  };
  
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
              <AchievementsList key={`achievements-${refreshTrigger}`} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
};

export default Goals; 