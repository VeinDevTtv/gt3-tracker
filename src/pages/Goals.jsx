import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, Target, Calendar, ListChecks, Award, AlertCircle, Plus } from 'lucide-react';
import GoalList from '../components/GoalManager/GoalList';
import WeeklyEntryList from '../components/GoalManager/WeeklyEntryList';
import AchievementsList from '../components/Achievements/AchievementsList';
import MilestoneProgressMap from '../components/milestones/MilestoneProgressMap';
import goalManager from '../services/GoalManager';
import achievementManager from '../services/AchievementManager';
import milestoneService from '../services/MilestoneService';
import { useGoals } from '../contexts/GoalsContext';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import NewGoalForm from '../components/GoalManager/NewGoalForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

/**
 * Goals page component that displays and manages all goal-related functionality
 */
const Goals = () => {
  // Get global context
  const { 
    activeGoal, 
    goals, 
    calculateProgress, 
    createDefaultGoal,
    addGoal,
    isLoading: contextLoading
  } = useGoals();
  
  // Local state
  const [activeTab, setActiveTab] = useState('goals');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [showWeeklyEntries, setShowWeeklyEntries] = useState(false);
  
  // Force a refresh of child components
  const refreshComponents = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Initialize on component mount
  useEffect(() => {
    try {
      console.log('Goals component mounted');
      
      // Get theme from localStorage
      const savedTheme = localStorage.getItem('savings-tracker-theme');
      setTheme(savedTheme || 'dark');
      
      // Initialize services
      console.log('Initializing services...');
      goalManager.initialize();
      achievementManager.initialize();
      milestoneService.initialize();
      
      // Check if we need to create a default goal
      const existingGoals = goalManager.getGoals();
      if (existingGoals.length === 0) {
        console.log('No goals found, creating default goal');
        createDefaultGoal();
      }
      
      // Check for achievements
      const goals = goalManager.getGoals();
      const activeGoal = goalManager.getActiveGoal();
      const weeks = activeGoal?.weeks || [];
      
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
  }, [createDefaultGoal]);
  
  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('savings-tracker-theme');
      setTheme(savedTheme || 'dark');
    };
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'savings-tracker-theme') {
        handleThemeChange();
      }
    });
    
    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);
  
  // Handle goal changes (selection, creation, update, delete)
  const handleGoalChange = (goalId) => {
    try {
      console.log('Goal changed:', goalId);
      
      // Force a refresh
      refreshComponents();
      
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
      
      // Show notification
      toast.success(`Goal ${activeGoal ? `"${activeGoal.name}"` : ''} activated!`);
    } catch (err) {
      console.error('Error handling goal change:', err);
      setError(err.message || 'An error occurred updating goals');
    }
  };
  
  // Handle goal creation
  const handleCreateGoal = (goalData) => {
    try {
      console.log('Creating new goal:', goalData);
      
      // Create the goal and get the new ID through the context
      // This will also set it as active and create milestones
      const newGoalId = addGoal(goalData);
      
      if (!newGoalId) {
        throw new Error('Failed to create goal - no ID returned');
      }
      
      console.log('Goal created successfully with ID:', newGoalId);
      
      // Close the dialog
      setShowNewGoalDialog(false);
      
      // Force refresh immediately
      refreshComponents();
      
      // Do another refresh after a short delay to ensure all state has propagated
      setTimeout(() => {
        console.log('Refreshing components after goal creation');
        refreshComponents();
      }, 100);
      
      // Show success message
      toast.success(`Goal "${goalData.name}" created!`);
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error('Failed to create goal: ' + err.message);
    }
  };
  
  // Get progress for active goal
  const progress = activeGoal ? calculateProgress(activeGoal.id) : { percentComplete: 0 };
  
  // Debug empty state condition
  console.log('Goals component state debug:', {
    contextLoading,
    isLoading,
    activeGoal: activeGoal ? { id: activeGoal.id, name: activeGoal.name } : null,
    goalsLength: goals ? goals.length : 0,
    showEmptyState: (!contextLoading && !activeGoal) || (goals && goals.length === 0)
  });
  
  // Check if we should show an empty state - only when fully loaded and no goals exist
  const showEmptyState = !isLoading && !contextLoading && 
    ((!activeGoal && (!goals || goals.length === 0)) || 
    (goals && goals.length === 0));
  
  // Toggle weekly entries view
  const toggleWeeklyEntries = () => {
    setShowWeeklyEntries(prev => !prev);
  };
  
  if (error) {
    return (
      <>
        <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
          <h1 className="text-2xl font-bold">Goals & Achievements</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
        
        {/* Always include the dialog */}
        <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <NewGoalForm 
              onSubmit={handleCreateGoal}
              onCancel={() => setShowNewGoalDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  if (isLoading || contextLoading) {
    return (
      <>
        <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
          <h1 className="text-2xl font-bold">Goals & Achievements</h1>
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading goals and achievements...</p>
          </div>
        </div>
        
        {/* Always include the dialog */}
        <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <NewGoalForm 
              onSubmit={handleCreateGoal}
              onCancel={() => setShowNewGoalDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (showEmptyState) {
    return (
      <>
        <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
          <h1 className="text-2xl font-bold">Goals & Achievements</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 border text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Savings Goals</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first savings goal to start tracking your progress toward your Porsche GT3 or other financial goals.
            </p>
            <Button 
              onClick={() => {
                console.log('Opening new goal dialog');
                setShowNewGoalDialog(true);
              }}
              className="bg-primary text-primary-foreground"
            >
              Create Your First Goal
            </Button>
          </div>
        </div>
        
        {/* Always include the dialog */}
        <Dialog 
          open={showNewGoalDialog} 
          onOpenChange={(open) => {
            console.log('Dialog onOpenChange:', open);
            setShowNewGoalDialog(open);
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <NewGoalForm 
              onSubmit={handleCreateGoal}
              onCancel={() => setShowNewGoalDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <>
      <main className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Goals & Achievements</h1>
            {activeGoal && (
              <p className="text-muted-foreground mt-1">
                Active goal: <span className="font-medium">{activeGoal.name}</span> - 
                <span className="ml-1">{Math.round(progress.percentComplete)}% complete</span>
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {activeGoal && (
              <Button 
                onClick={toggleWeeklyEntries} 
                variant={showWeeklyEntries ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" /> 
                {showWeeklyEntries ? "Hide Weekly Entries" : "Show Weekly Entries"}
              </Button>
            )}
            <Button 
              onClick={() => setShowNewGoalDialog(true)}
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> New Goal
            </Button>
          </div>
        </div>
        
        {/* Active Goal Milestone Map */}
        {activeGoal && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Milestone Progress - {activeGoal.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneProgressMap 
                key={`milestone-map-${refreshTrigger}`} 
                refreshKey={refreshTrigger}
                goalId={activeGoal ? activeGoal.id : null} 
              />
            </CardContent>
          </Card>
        )}
        
        {/* Weekly Entries for Active Goal (togglable) */}
        {activeGoal && showWeeklyEntries && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Entries - {activeGoal.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyEntryList 
                key={`entries-${refreshTrigger}-${activeGoal?.id}`}
                goalId={activeGoal.id}
                onEntryChange={refreshComponents}
              />
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" /> 
              My Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" /> 
              Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="goals" className="space-y-6">
            {/* Goals List - now displays all goals as cards */}
            <GoalList 
              onGoalChange={handleGoalChange}
              onCreateNewGoal={() => setShowNewGoalDialog(true)}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-6">
            {/* Achievements List */}
            <AchievementsList key={`achievements-${refreshTrigger}`} theme={theme} />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Goal Creation Dialog - always in the DOM */}
      <Dialog 
        open={showNewGoalDialog} 
        onOpenChange={setShowNewGoalDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <NewGoalForm 
            onSubmit={handleCreateGoal}
            onCancel={() => setShowNewGoalDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Goals; 