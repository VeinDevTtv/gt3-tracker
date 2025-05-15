import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import goalManager from '../services/GoalManager';
import achievementManager from '../services/AchievementManager';
import milestoneService from '../services/MilestoneService';
import html2canvas from 'html2canvas';

// Create the context
const GoalsContext = createContext();

// Custom hook to use the context
export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

// Default milestones - can be customized
const DEFAULT_MILESTONES = [
  { percentage: 25, message: "You've reached 25% of your goal! Keep going!" },
  { percentage: 50, message: "Halfway there! You're doing great!" },
  { percentage: 75, message: "75% complete! The finish line is in sight!" },
  { percentage: 90, message: "Almost there! Just a little more to go!" },
  { percentage: 100, message: "Congratulations! You've reached your goal!" }
];

// Default goal templates
const GOAL_TEMPLATES = [
  // Vehicles
  {
    name: "Porsche 911 GT3",
    target: 200000,
    description: "Save for a Porsche 911 GT3 sports car",
    category: "vehicles",
    icon: "🏎️"
  },
  {
    name: "Tesla Model S",
    target: 90000,
    description: "Save for a Tesla Model S electric vehicle",
    category: "vehicles",
    icon: "🚗"
  },
  {
    name: "Ducati Panigale V4",
    target: 30000,
    description: "Save for a Ducati Panigale V4 motorcycle",
    category: "vehicles",
    icon: "🏍️"
  },
  
  // Real Estate
  {
    name: "Home Down Payment",
    target: 60000,
    description: "Save for a down payment on a house",
    category: "real-estate",
    icon: "🏠"
  },
  {
    name: "Apartment Renovation",
    target: 25000,
    description: "Save for renovating your apartment",
    category: "real-estate",
    icon: "🔨"
  },
  {
    name: "Investment Property",
    target: 80000,
    description: "Save for an investment property down payment",
    category: "real-estate",
    icon: "🏢"
  },
  
  // Education
  {
    name: "College Tuition",
    target: 40000,
    description: "Save for college or university tuition",
    category: "education",
    icon: "🎓"
  },
  {
    name: "Coding Bootcamp",
    target: 15000,
    description: "Save for a coding bootcamp program",
    category: "education",
    icon: "💻"
  },
  {
    name: "Professional Certification",
    target: 5000,
    description: "Save for professional certification courses",
    category: "education",
    icon: "📜"
  },
  
  // Travel
  {
    name: "Dream Vacation",
    target: 10000,
    description: "Save for a luxury vacation",
    category: "travel",
    icon: "✈️"
  },
  {
    name: "World Tour",
    target: 30000,
    description: "Save for a multi-country world tour",
    category: "travel",
    icon: "🌍"
  },
  {
    name: "Sabbatical Year",
    target: 50000,
    description: "Save for a year-long travel sabbatical",
    category: "travel",
    icon: "🧳"
  },
  
  // Business
  {
    name: "Small Business Startup",
    target: 25000,
    description: "Save for starting your own small business",
    category: "business",
    icon: "💼"
  },
  {
    name: "E-commerce Store",
    target: 10000,
    description: "Save for launching an e-commerce store",
    category: "business",
    icon: "🛒"
  },
  
  // Lifestyle
  {
    name: "Wedding Fund",
    target: 35000,
    description: "Save for a wedding celebration",
    category: "lifestyle",
    icon: "💍"
  },
  {
    name: "Emergency Fund",
    target: 20000,
    description: "Save for a 6-month emergency fund",
    category: "lifestyle",
    icon: "🛡️"
  },
  {
    name: "Retirement Boost",
    target: 100000,
    description: "Save for an additional retirement investment",
    category: "lifestyle",
    icon: "👵"
  }
];

// For creating initial weeks for a new goal
const createInitialWeeks = (numberOfWeeks) => {
  return Array.from({ length: numberOfWeeks }, (_, i) => ({
    week: i + 1,
    profit: 0,
    cumulative: 0,
    isFilled: false
  }));
};

// Provider component
export const GoalsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize goals on mount
  useEffect(() => {
    try {
      // Initialize the goal manager
      goalManager.initialize();
      // Load goals from storage
      const loadedGoals = goalManager.getGoals();
      setGoals(loadedGoals);

      // Get active goal
      const active = goalManager.getActiveGoal();
      setActiveGoal(active);

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing goals:', err);
      setError('Failed to load goals');
      setIsLoading(false);
    }
  }, []);

  // Listen for storage changes (if another tab updates goals)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === goalManager.GOALS_STORAGE_KEY) {
        try {
          const updatedGoals = goalManager.getGoals();
          setGoals(updatedGoals);
          // Also update active goal in case it changed
          const active = goalManager.getActiveGoal();
          setActiveGoal(active);
        } catch (err) {
          console.error('Error handling storage change:', err);
        }
      } else if (e.key === goalManager.ACTIVE_GOAL_KEY) {
        try {
          const active = goalManager.getActiveGoal();
          setActiveGoal(active);
        } catch (err) {
          console.error('Error handling active goal change:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Create a default goal (used for first-time users)
  const createDefaultGoal = (template = GOAL_TEMPLATES[0]) => {
    try {
      const goalId = goalManager.createGoal({
        name: template.name,
        target: template.target,
        startDate: new Date().toISOString().split('T')[0],
        weeks: [],
        isCompleted: false,
        description: template.description
      });

      // Update state
      const updatedGoals = goalManager.getGoals();
      setGoals(updatedGoals);
      setActiveGoal(goalManager.getActiveGoal());
      return goalId;
    } catch (err) {
      console.error('Error creating default goal:', err);
      setError('Failed to create default goal');
      return null;
    }
  };

  // Add a new goal
  const addGoal = (goalData) => {
    try {
      console.log('GoalsContext: Creating new goal with data:', goalData);
      
      // Create the goal in the manager
      const goalId = goalManager.createGoal({
        name: goalData.name || goalData.goalName,
        target: goalData.target,
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        weeks: goalData.weeks || [],
        isCompleted: goalData.isCompleted || false,
        description: goalData.description || ''
      });
      
      if (!goalId) {
        console.error('GoalManager did not return a valid goal ID');
        throw new Error('Failed to create goal - no ID returned from service');
      }
      
      console.log('GoalsContext: Goal created with ID:', goalId);
      
      // Set this goal as active
      const activeSet = goalManager.setActiveGoal(goalId);
      console.log('GoalsContext: Set as active goal:', activeSet);
      
      // Update state - create new array references to trigger re-renders
      const updatedGoals = goalManager.getGoals();
      setGoals([...updatedGoals]);
      
      // Create default milestones explicitly
      try {
        milestoneService.createDefaultMilestones(goalId, goalData.target);
        console.log('GoalsContext: Created default milestones for goal');
      } catch (err) {
        console.error('Error creating milestones:', err);
      }
      
      // Update active goal in state with the newly retrieved object
      // This forces a complete refresh of the active goal
      const newActiveGoal = goalManager.getGoalById(goalId);
      setActiveGoal({...newActiveGoal});
      
      console.log('GoalsContext: State updated with new goal and active goal set:', newActiveGoal);
      
      // Check for achievements
      try {
        const achievementManager = require('../services/AchievementManager').default;
        if (achievementManager) {
          achievementManager.checkForAchievements({
            goals: updatedGoals,
            activeGoal: newActiveGoal,
            weeks: newActiveGoal.weeks || []
          });
        }
      } catch (err) {
        console.log('Could not check achievements:', err);
      }
      
      // Success notification
      toast.success('Goal created successfully!');

      // Trigger a render cycle to ensure components update
      setTimeout(() => {
        const refreshedGoals = goalManager.getGoals();
        setGoals([...refreshedGoals]);
        setActiveGoal({...goalManager.getActiveGoal()});
      }, 0);
      
      return goalId;
    } catch (err) {
      console.error('Error adding goal:', err);
      toast.error('Failed to create goal: ' + err.message);
      return null;
    }
  };

  // Update an existing goal
  const updateGoal = (goalId, updates) => {
    try {
      const success = goalManager.updateGoal(goalId, updates);
      
      if (success) {
        // Update state
        const updatedGoals = goalManager.getGoals();
        setGoals(updatedGoals);
        
        // If we're updating the active goal, refresh it
        if (activeGoal && activeGoal.id === goalId) {
          setActiveGoal(goalManager.getActiveGoal());
        }
        
        toast.success('Goal updated successfully!');
        return true;
      } else {
        toast.error('Goal not found');
        return false;
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      toast.error('Failed to update goal');
      return false;
    }
  };

  // Delete a goal
  const deleteGoal = (goalId) => {
    try {
      const success = goalManager.deleteGoal(goalId);
      
      if (success) {
        // Update state
        const updatedGoals = goalManager.getGoals();
        setGoals(updatedGoals);
        setActiveGoal(goalManager.getActiveGoal());
        
        toast.success('Goal deleted successfully!');
        return true;
      } else {
        toast.error('Goal not found');
        return false;
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.error('Failed to delete goal');
      return false;
    }
  };

  // Switch the active goal
  const switchGoal = (goalId) => {
    try {
      const success = goalManager.setActiveGoal(goalId);
      
      if (success) {
        setActiveGoal(goalManager.getActiveGoal());
        toast.success('Switched active goal');
        return true;
      } else {
        toast.error('Goal not found');
        return false;
      }
    } catch (err) {
      console.error('Error switching goal:', err);
      toast.error('Failed to switch goal');
      return false;
    }
  };

  // Duplicate a goal
  const duplicateGoal = (goalId) => {
    try {
      const goalToDuplicate = goals.find(g => g.id === goalId);
      
      if (!goalToDuplicate) {
        toast.error('Goal not found');
        return null;
      }
      
      const newGoalData = {
        ...goalToDuplicate,
        name: `${goalToDuplicate.name} (Copy)`,
        weeks: [...goalToDuplicate.weeks],
        isCompleted: false
      };
      
      // Remove id, createdAt, updatedAt
      delete newGoalData.id;
      delete newGoalData.createdAt;
      delete newGoalData.updatedAt;
      
      const newGoalId = addGoal(newGoalData);
      return newGoalId;
    } catch (err) {
      console.error('Error duplicating goal:', err);
      toast.error('Failed to duplicate goal');
      return null;
    }
  };

  // Import a goal from JSON
  const importGoal = (goalData) => {
    try {
      // Basic validation
      if (!goalData.name || !goalData.target) {
        toast.error('Invalid goal data');
        return null;
      }
      
      // Create new goal with imported data
      const newGoalData = {
        name: goalData.name,
        target: goalData.target,
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        weeks: goalData.weeks || [],
        isCompleted: goalData.isCompleted || false,
        description: goalData.description || ''
      };
      
      const goalId = addGoal(newGoalData);
      return goalId;
    } catch (err) {
      console.error('Error importing goal:', err);
      toast.error('Failed to import goal');
      return null;
    }
  };

  // Update week data (add or modify profit)
  const updateWeekData = (goalId, weekIndex, profit) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      
      if (!goal) {
        toast.error('Goal not found');
        return false;
      }
      
      // Create a copy of weeks
      let updatedWeeks = [...(goal.weeks || [])];
      
      // Add missing weeks up to weekIndex
      while (updatedWeeks.length <= weekIndex) {
        updatedWeeks.push({
          week: updatedWeeks.length + 1,
          profit: 0,
          cumulative: updatedWeeks.length > 0 
            ? updatedWeeks[updatedWeeks.length - 1].cumulative 
            : 0,
          isFilled: false, // Default is not filled
          entries: [] // Add entries array for trade journaling
        });
      }
      
      // Parse profit value
      const profitValue = parseFloat(profit);
      
      // Update the profit for the specified week and set isFilled flag
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        profit: profitValue,
        isFilled: profitValue !== 0 // Set to true for non-zero values
      };
      
      // Ensure entries array exists
      if (!updatedWeeks[weekIndex].entries) {
        updatedWeeks[weekIndex].entries = [];
      }
      
      // Recalculate cumulative profits
      for (let i = 0; i < updatedWeeks.length; i++) {
        updatedWeeks[i].cumulative = i > 0 
          ? updatedWeeks[i-1].cumulative + updatedWeeks[i].profit 
          : updatedWeeks[i].profit;
      }
      
      // Get last milestone
      const lastMilestoneObject = goal.lastMilestone || null;
      
      // Check for milestones
      const totalProfit = updatedWeeks[updatedWeeks.length - 1].cumulative;
      const progressPercentage = (totalProfit / goal.target) * 100;
      
      let newMilestone = null;
      
      for (const milestone of DEFAULT_MILESTONES) {
        if (progressPercentage >= milestone.percentage) {
          if (!lastMilestoneObject || lastMilestoneObject.percentage < milestone.percentage) {
            newMilestone = {
              percentage: milestone.percentage,
              message: milestone.message,
              date: new Date().toISOString()
            };
            break;
          }
        }
      }
      
      // Update goal with new weeks and milestone
      const updatedGoal = {
        ...goal,
        weeks: updatedWeeks,
        lastMilestone: newMilestone || lastMilestoneObject
      };
      
      // Save the updated goal
      const success = goalManager.updateGoal(goalId, {
        weeks: updatedWeeks,
        lastMilestone: newMilestone || lastMilestoneObject
      });
      
      if (success) {
        // Update state
        const updatedGoals = goalManager.getGoals();
        setGoals(updatedGoals);
        
        // If we're updating the active goal, refresh it
        if (activeGoal && activeGoal.id === goalId) {
          setActiveGoal(goalManager.getActiveGoal());
        }
        
        // Show milestone toast if there's a new milestone
        if (newMilestone) {
          toast.success(newMilestone.message, {
            icon: '🏆',
            duration: 5000
          });
        }
        
        return true;
      } else {
        toast.error('Failed to update week data');
        return false;
      }
    } catch (err) {
      console.error('Error updating week data:', err);
      toast.error('Failed to update week data');
      return false;
    }
  };

  // Add a trade entry to a specific week
  const addTradeEntry = (goalId, entry, weekNum) => {
    try {
      console.log(`--- Starting addTradeEntry ---`);
      console.log(`Goal ID: ${goalId}, Active Goal ID: ${activeGoal?.id}`);
      
      if (goalId !== activeGoal?.id) {
        console.warn(`WARNING: Adding trade to goal ${goalId} but active goal is ${activeGoal?.id}`);
      }
      
      // Ensure we're working with the most current goal data
      // Don't rely on the cached goals array
      const freshGoals = goalManager.getGoals();
      const goal = freshGoals.find(g => g.id === goalId);
      
      if (!goal) {
        console.error('Goal not found:', goalId);
        toast.error('Goal not found');
        return false;
      }
      
      // Create a deep copy of the weeks to avoid mutation issues
      let updatedWeeks = JSON.parse(JSON.stringify(goal.weeks || []));
      
      // Ensure weekNum is valid (1-based)
      const weekIndex = weekNum - 1;
      if (weekIndex < 0 || weekIndex >= updatedWeeks.length) {
        console.error(`Invalid week index: ${weekIndex} (from weekNum ${weekNum})`);
        toast.error('Invalid week number');
        return false;
      }
      
      // Store pre-update values for validation
      const originalProfit = updatedWeeks[weekIndex].profit || 0;
      const originalCumulative = updatedWeeks[weekIndex].cumulative || 0;
      
      // Ensure entries array exists
      if (!updatedWeeks[weekIndex].entries) {
        updatedWeeks[weekIndex].entries = [];
      }
      
      // Add the new entry
      updatedWeeks[weekIndex].entries.push(entry);
      
      // Update the week's total profit by summing all entries
      const weekTotalProfit = updatedWeeks[weekIndex].entries.reduce(
        (sum, e) => sum + (parseFloat(e.amount) || 0), 
        0
      );
      
      // Set the updated profit and filled flag
      updatedWeeks[weekIndex].profit = weekTotalProfit;
      updatedWeeks[weekIndex].isFilled = weekTotalProfit !== 0;
      
      // Validate that profit was updated
      const profitDifference = weekTotalProfit - originalProfit;
      console.log(`Profit difference: ${profitDifference} (${originalProfit} → ${weekTotalProfit})`);
      
      // Recalculate cumulative profits for all weeks
      let runningTotal = 0;
      for (let i = 0; i < updatedWeeks.length; i++) {
        runningTotal += (updatedWeeks[i].profit || 0);
        updatedWeeks[i].cumulative = runningTotal;
      }
      
      // Log the update details before saving
      console.log(`Week ${weekNum} before update: Profit=${originalProfit}, Cumulative=${originalCumulative}`);
      console.log(`Week ${weekNum} after update: Profit=${weekTotalProfit}, Cumulative=${updatedWeeks[weekIndex].cumulative}`);
      
      // Get last milestone
      const lastMilestoneObject = goal.lastMilestone || null;
      
      // Check for milestones
      const goalTotalProfit = updatedWeeks[updatedWeeks.length - 1].cumulative;
      
      let newMilestone = null;
      
      // Check for milestones if total has changed
      if (Math.abs(profitDifference) > 0.001) {
        const milestoneResult = milestoneService.checkMilestones(goalId, goalTotalProfit);
        if (milestoneResult && milestoneResult.milestone) {
          newMilestone = milestoneResult.milestone;
        }
      }
      
      // Create a complete updated goal object for proper state updates
      const updatedGoal = {
        ...goal,
        weeks: updatedWeeks,
        lastMilestone: newMilestone || lastMilestoneObject,
        updatedAt: new Date().toISOString()
      };
      
      // Save the updated goal
      console.log('Saving updated goal to storage:', updatedGoal.name);
      const success = goalManager.updateGoal(goalId, updatedGoal);
      
      if (success) {
        // Get fresh data after update
        const freshGoals = goalManager.getGoals();
        // Create completely new references to force UI refresh 
        const updatedGoals = [...freshGoals];
        
        // Verify the update was successful in storage
        const verificationGoal = freshGoals.find(g => g.id === goalId);
        if (verificationGoal) {
          const verificationWeek = verificationGoal.weeks[weekIndex];
          console.log(`Storage verification - Week ${weekNum}: Profit=${verificationWeek.profit}`);
          
          if (Math.abs(verificationWeek.profit - weekTotalProfit) > 0.001) {
            console.error('ERROR: Storage verification failed!');
            console.error(`Expected: ${weekTotalProfit}, Got: ${verificationWeek.profit}`);
            // Continue anyway to attempt UI update
          }
        }
        
        // Update context state with fresh data and new references
        setGoals(updatedGoals);
        
        // If we're updating the active goal, create a fresh reference 
        if (activeGoal && activeGoal.id === goalId) {
          const freshActiveGoal = goalManager.getActiveGoal();
          // Force a new reference to ensure re-renders
          setActiveGoal({...freshActiveGoal}); 
          // Show confirmation toast
          toast.success(`Week ${weekNum} updated: ${formatCurrency(weekTotalProfit)}`);
        }
        
        // Log the update for debugging
        console.log(`--- Trade entry SUCCESSFULLY added to week ${weekNum} ---`);
        console.log(`Updated profit: ${weekTotalProfit}, Cumulative: ${updatedWeeks[weekIndex].cumulative}`);
        
        // Show milestone toast if there's a new milestone
        if (newMilestone) {
          toast.success(newMilestone.message, {
            icon: '🏆',
            duration: 5000
          });
        }
        
        // Force a UI refresh after a small delay to ensure updates are reflected
        setTimeout(() => {
          // Get fresh data again and update state
          const refreshedGoals = goalManager.getGoals();
          setGoals([...refreshedGoals]);
          if (activeGoal && activeGoal.id === goalId) {
            const refreshedActive = goalManager.getActiveGoal();
            setActiveGoal({...refreshedActive});
          }
        }, 100);
        
        return true;
      } else {
        console.error(`Failed to update goal in storage!`);
        toast.error('Failed to add trade entry');
        return false;
      }
    } catch (err) {
      console.error('Error adding trade entry:', err);
      toast.error('Failed to add trade entry');
      return false;
    }
  };
  
  // Update a trade entry
  const updateTradeEntry = (goalId, weekNum, entryIndex, updatedEntry) => {
    try {
      console.log(`--- Starting updateTradeEntry ---`);
      console.log(`Goal ID: ${goalId}, Week: ${weekNum}, Entry Index: ${entryIndex}`);
      console.log(`Updated entry data:`, updatedEntry);
      
      // Make sure we're using the most up-to-date goals data
      const freshGoals = goalManager.getGoals();
      const goal = freshGoals.find(g => g.id === goalId);
      
      if (!goal) {
        console.error(`Goal not found: ${goalId}`);
        toast.error('Goal not found');
        return false;
      }
      
      // Log the active goal ID for comparison
      console.log(`Active goal ID: ${activeGoal?.id}`);
      if (goalId !== activeGoal?.id) {
        console.warn(`Warning: Updating trade in goal ${goalId} but active goal is ${activeGoal?.id}`);
      }
      
      // Create a deep copy of weeks to avoid mutation issues
      let updatedWeeks = JSON.parse(JSON.stringify(goal.weeks || []));
      
      // Ensure weekNum is valid (1-based)
      const weekIndex = weekNum - 1;
      if (weekIndex < 0 || weekIndex >= updatedWeeks.length) {
        console.error(`Invalid week index: ${weekIndex} (from weekNum ${weekNum})`);
        toast.error('Invalid week number');
        return false;
      }
      
      // Ensure entries array exists
      if (!updatedWeeks[weekIndex].entries || 
          !Array.isArray(updatedWeeks[weekIndex].entries) ||
          entryIndex < 0 || 
          entryIndex >= updatedWeeks[weekIndex].entries.length) {
        console.error(`Entry not found at index ${entryIndex} in week ${weekNum}`);
        console.log(`Week has ${updatedWeeks[weekIndex].entries?.length || 0} entries`);
        toast.error('Entry not found');
        return false;
      }
      
      // Store original values for validation
      const originalEntry = updatedWeeks[weekIndex].entries[entryIndex];
      const originalProfit = updatedWeeks[weekIndex].profit || 0;
      console.log(`Original entry:`, originalEntry);
      console.log(`Original week profit: ${originalProfit}`);
      
      // Update the entry - ensure all original properties are preserved
      updatedWeeks[weekIndex].entries[entryIndex] = {
        ...originalEntry,
        ...updatedEntry,
        // Ensure the timestamp is preserved or updated
        timestamp: updatedEntry.timestamp || originalEntry.timestamp || new Date().toISOString()
      };
      
      // Update the week's total profit
      const weekTotalProfit = updatedWeeks[weekIndex].entries.reduce(
        (sum, e) => sum + (parseFloat(e.amount) || 0), 
        0
      );
      
      // Log profit change
      console.log(`Week profit changing from ${originalProfit} to ${weekTotalProfit}`);
      
      updatedWeeks[weekIndex].profit = weekTotalProfit;
      updatedWeeks[weekIndex].isFilled = weekTotalProfit !== 0;
      
      // Recalculate cumulative profits
      let runningTotal = 0;
      for (let i = 0; i < updatedWeeks.length; i++) {
        runningTotal += (updatedWeeks[i].profit || 0);
        updatedWeeks[i].cumulative = runningTotal;
      }
      
      // Get last milestone
      const lastMilestoneObject = goal.lastMilestone || null;
      
      // Check for milestones
      const goalTotalProfit = updatedWeeks[updatedWeeks.length - 1].cumulative;
      
      let newMilestone = null;
      
      // Check for milestones if amount has changed
      if (Math.abs((originalEntry.amount || 0) - (updatedEntry.amount || 0)) > 0.001) {
        const milestoneResult = milestoneService.checkMilestones(goalId, goalTotalProfit);
        if (milestoneResult && milestoneResult.milestone) {
          newMilestone = milestoneResult.milestone;
        }
      }
      
      // Create a complete updated goal object
      const fullUpdatedGoal = {
        ...goal,
        weeks: updatedWeeks,
        lastMilestone: newMilestone || lastMilestoneObject,
        updatedAt: new Date().toISOString()
      };
      
      // Save the updated goal
      console.log('Saving updated goal to storage...');
      const success = goalManager.updateGoal(goalId, fullUpdatedGoal);
      
      if (success) {
        // Get fresh data after saving
        const refreshedGoals = goalManager.getGoals();
        
        // Verify the update occurred correctly
        const verificationGoal = refreshedGoals.find(g => g.id === goalId);
        if (verificationGoal && verificationGoal.weeks[weekIndex]) {
          const updatedWeek = verificationGoal.weeks[weekIndex];
          console.log(`Verification - Week ${weekNum} profit after storage: ${updatedWeek.profit}`);
          
          if (Math.abs(updatedWeek.profit - weekTotalProfit) > 0.001) {
            console.error(`ERROR: Week profit not updated correctly in storage!`);
            console.error(`Expected: ${weekTotalProfit}, Got: ${updatedWeek.profit}`);
          }
        }
        
        // Update state with brand new references to force re-render
        setGoals([...refreshedGoals]);
        
        // If we're updating the active goal, refresh it too
        if (activeGoal && activeGoal.id === goalId) {
          const refreshedActive = goalManager.getActiveGoal();
          setActiveGoal({...refreshedActive});
          
          // Force a toast notification for clear user feedback
          toast.success(`Trade entry updated: ${formatCurrency(updatedEntry.amount || 0)}`);
        }
        
        // Log the update for debugging
        console.log(`--- Trade entry successfully updated in week ${weekNum} ---`);
        
        // Show milestone toast if there's a new milestone
        if (newMilestone) {
          toast.success(newMilestone.message, {
            icon: '🏆',
            duration: 5000
          });
        }
        
        // Force another refresh after a small delay to ensure UI updates
        setTimeout(() => {
          const afterUpdateGoals = goalManager.getGoals();
          setGoals([...afterUpdateGoals]);
          if (activeGoal && activeGoal.id === goalId) {
            setActiveGoal({...goalManager.getActiveGoal()});
          }
        }, 100);
        
        return true;
      } else {
        console.error('Failed to update goal in storage');
        toast.error('Failed to update trade entry');
        return false;
      }
    } catch (err) {
      console.error('Error updating trade entry:', err);
      toast.error('Failed to update trade entry');
      return false;
    }
  };
  
  // Delete a trade entry
  const deleteTradeEntry = (goalId, weekNum, entryIndex) => {
    try {
      console.log(`--- Starting deleteTradeEntry ---`);
      console.log(`Goal ID: ${goalId}, Week: ${weekNum}, Entry Index: ${entryIndex}`);
      
      // Make sure we're using the most up-to-date goals data
      const freshGoals = goalManager.getGoals();
      const goal = freshGoals.find(g => g.id === goalId);
      
      if (!goal) {
        console.error(`Goal not found: ${goalId}`);
        toast.error('Goal not found');
        return false;
      }
      
      // Log the active goal ID for comparison
      console.log(`Active goal ID: ${activeGoal?.id}`);
      if (goalId !== activeGoal?.id) {
        console.warn(`Warning: Deleting trade from goal ${goalId} but active goal is ${activeGoal?.id}`);
      }
      
      // Create a deep copy of weeks to avoid mutation issues
      let updatedWeeks = JSON.parse(JSON.stringify(goal.weeks || []));
      
      // Ensure weekNum is valid (1-based)
      const weekIndex = weekNum - 1;
      if (weekIndex < 0 || weekIndex >= updatedWeeks.length) {
        console.error(`Invalid week index: ${weekIndex} (from weekNum ${weekNum})`);
        toast.error('Invalid week number');
        return false;
      }
      
      // Ensure entries array exists
      if (!updatedWeeks[weekIndex].entries || 
          !Array.isArray(updatedWeeks[weekIndex].entries) ||
          entryIndex < 0 || 
          entryIndex >= updatedWeeks[weekIndex].entries.length) {
        console.error(`Entry not found at index ${entryIndex} in week ${weekNum}`);
        console.log(`Week has ${updatedWeeks[weekIndex].entries?.length || 0} entries`);
        toast.error('Entry not found');
        return false;
      }
      
      // Store the old values for validation
      const oldEntry = updatedWeeks[weekIndex].entries[entryIndex];
      const oldEntryAmount = oldEntry.amount;
      const originalProfit = updatedWeeks[weekIndex].profit || 0;
      
      console.log(`Deleting entry:`, oldEntry);
      console.log(`Original week profit: ${originalProfit}`);
      
      // Remove the entry
      updatedWeeks[weekIndex].entries.splice(entryIndex, 1);
      
      // Update the week's total profit by recalculating from remaining entries
      const weekTotalProfit = updatedWeeks[weekIndex].entries.reduce(
        (sum, e) => sum + (parseFloat(e.amount) || 0), 
        0
      );
      
      // Log profit change
      console.log(`Week profit changing from ${originalProfit} to ${weekTotalProfit}`);
      
      updatedWeeks[weekIndex].profit = weekTotalProfit;
      updatedWeeks[weekIndex].isFilled = weekTotalProfit !== 0;
      
      // Recalculate cumulative profits
      let runningTotal = 0;
      for (let i = 0; i < updatedWeeks.length; i++) {
        runningTotal += (updatedWeeks[i].profit || 0);
        updatedWeeks[i].cumulative = runningTotal;
      }
      
      // Get last milestone
      const lastMilestoneObject = goal.lastMilestone || null;
      
      // Check for milestones
      const goalTotalProfit = updatedWeeks[updatedWeeks.length - 1].cumulative;
      
      // Create a complete updated goal object
      const fullUpdatedGoal = {
        ...goal,
        weeks: updatedWeeks,
        lastMilestone: lastMilestoneObject,
        updatedAt: new Date().toISOString()
      };
      
      // Save the updated goal
      console.log('Saving updated goal to storage after deletion...');
      const success = goalManager.updateGoal(goalId, fullUpdatedGoal);
      
      if (success) {
        // Get fresh data after saving
        const refreshedGoals = goalManager.getGoals();
        
        // Verify the update occurred correctly
        const verificationGoal = refreshedGoals.find(g => g.id === goalId);
        if (verificationGoal && verificationGoal.weeks[weekIndex]) {
          const updatedWeek = verificationGoal.weeks[weekIndex];
          console.log(`Verification - Week ${weekNum} profit after deletion: ${updatedWeek.profit}`);
          
          if (Math.abs(updatedWeek.profit - weekTotalProfit) > 0.001) {
            console.error(`ERROR: Week profit not updated correctly in storage!`);
            console.error(`Expected: ${weekTotalProfit}, Got: ${updatedWeek.profit}`);
          }
          
          if (updatedWeek.entries.length !== goal.weeks[weekIndex].entries.length - 1) {
            console.error(`ERROR: Entry was not properly deleted!`);
            console.error(`Expected ${goal.weeks[weekIndex].entries.length - 1} entries, got ${updatedWeek.entries.length}`);
          }
        }
        
        // Update state with brand new references to force re-render
        setGoals([...refreshedGoals]);
        
        // If we're updating the active goal, refresh it too
        if (activeGoal && activeGoal.id === goalId) {
          const refreshedActive = goalManager.getActiveGoal();
          setActiveGoal({...refreshedActive});
          
          // Force a toast notification for clear user feedback
          toast.success(`Trade entry deleted: ${formatCurrency(oldEntryAmount || 0)}`);
        }
        
        // Log the update for debugging
        console.log(`--- Trade entry successfully deleted from week ${weekNum} ---`);
        console.log(`Amount removed: ${oldEntryAmount}, New week profit: ${weekTotalProfit}`);
        
        // Force another refresh after a small delay to ensure UI updates
        setTimeout(() => {
          const afterDeleteGoals = goalManager.getGoals();
          setGoals([...afterDeleteGoals]);
          if (activeGoal && activeGoal.id === goalId) {
            setActiveGoal({...goalManager.getActiveGoal()});
          }
        }, 100);
        
        return true;
      } else {
        console.error('Failed to update goal in storage after deletion');
        toast.error('Failed to delete trade entry');
        return false;
      }
    } catch (err) {
      console.error('Error deleting trade entry:', err);
      toast.error('Failed to delete trade entry');
      return false;
    }
  };

  // Calculate streak information for a goal
  const calculateStreakInfo = (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      
      if (!goal || !goal.weeks) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalWeeks: 0
        };
      }
      
      // Filter to only consider filled weeks
      const filledWeeks = goal.weeks.filter(week => week.isFilled);
      
      // If no filled weeks, return zeros
      if (filledWeeks.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalWeeks: 0
        };
      }
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < filledWeeks.length; i++) {
        if (filledWeeks[i].profit > 0) {
          tempStreak++;
          
          // If this is the last week or the next week breaks the streak
          if (i === filledWeeks.length - 1 || filledWeeks[i+1].profit <= 0) {
            currentStreak = tempStreak;
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
          }
        } else {
          // If this week has no profit, update longest streak
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      
      return {
        currentStreak,
        longestStreak,
        totalWeeks: filledWeeks.length // Only count filled weeks
      };
    } catch (err) {
      console.error('Error calculating streak info:', err);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalWeeks: 0
      };
    }
  };

  // Calculate progress for a goal
  const calculateProgress = (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      
      if (!goal || !goal.weeks || goal.weeks.length === 0) {
        return {
          totalSaved: 0,
          remaining: goal ? goal.target : 0,
          percentComplete: 0
        };
      }
      
      // Filter to only consider filled weeks
      const filledWeeks = goal.weeks.filter(week => week.isFilled);
      
      // If no filled weeks, return zeros
      if (filledWeeks.length === 0) {
        return {
          totalSaved: 0,
          remaining: goal ? goal.target : 0,
          percentComplete: 0
        };
      }
      
      // Calculate totalSaved using only filled weeks
      const totalSaved = filledWeeks.reduce((sum, week) => sum + week.profit, 0);
      const remaining = goal.target - totalSaved;
      const percentComplete = (totalSaved / goal.target) * 100;
      
      return {
        totalSaved,
        remaining,
        percentComplete: Math.min(100, percentComplete)
      };
    } catch (err) {
      console.error('Error calculating progress:', err);
      return {
        totalSaved: 0,
        remaining: 0,
        percentComplete: 0
      };
    }
  };

  // Export a specific goal as CSV
  const exportGoalAsCSV = (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        toast.error('Goal not found for export');
        return false;
      }
      
      const currentWeeks = goal.weeks || [];
      const headers = ['Week', 'Weekly Profit', 'Cumulative'];
      const csvContent = [
        headers.join(','),
        ...currentWeeks.map(week => 
          [week.week, week.profit, week.cumulative].join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${goal.name.replace(/\s+/g, '-').toLowerCase()}-tracker-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Goal data exported as CSV');
      return true;
    } catch (err) {
      console.error('Error exporting goal as CSV:', err);
      toast.error('Failed to export goal data');
      return false;
    }
  };

  // Generate and download progress as an image
  const generateSharingImage = useCallback(async () => {
    if (!activeGoal) {
      toast.error("No active goal selected to generate image.");
      return;
    }

    const goal = activeGoal;
    const progress = calculateProgress(goal.id);
    // Get theme settings for styling the image
    const theme = localStorage.getItem('savings-tracker-theme') || 'dark'; 
    const themeColor = localStorage.getItem('savings-tracker-theme-color') || 'blue';

    // Define color map based on themeColor
    const colorMap = {
      blue: '#3b82f6', green: '#10b981', red: '#ef4444',
      purple: '#8b5cf6', orange: '#f97316'
    };
    const accentColor = colorMap[themeColor] || colorMap.blue;
    // Define colors based on theme
    const bgColor = theme === 'dark' ? '#1f2937' : '#f9fafb';
    const textColor = theme === 'dark' ? '#e5e7eb' : '#374151';
    const cardBgColor = theme === 'dark' ? '#374151' : '#ffffff';
    const mutedTextColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

    // Create a temporary container div off-screen
    const shareContainer = document.createElement('div');
    shareContainer.style.width = '600px';
    shareContainer.style.height = '315px'; 
    shareContainer.style.padding = '25px';
    shareContainer.style.fontFamily = "'Segoe UI', Roboto, sans-serif";
    shareContainer.style.backgroundColor = bgColor;
    shareContainer.style.color = textColor;
    shareContainer.style.borderRadius = '12px';
    shareContainer.style.overflow = 'hidden';
    shareContainer.style.position = 'fixed';
    shareContainer.style.left = '-9999px';
    shareContainer.style.top = '-9999px';
    shareContainer.style.boxSizing = 'border-box';
    shareContainer.style.display = 'flex';
    shareContainer.style.flexDirection = 'column';

    // Populate the container with styled HTML
    shareContainer.innerHTML = `
        <div style="flex-shrink: 0; margin-bottom: 15px; text-align: center;">
            <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 5px 0; color: ${accentColor};">
                ${goal.name || 'My Goal Progress'}
            </h2>
        </div>

        <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 15px; margin-bottom: 15px;">
            <div style="background-color: ${cardBgColor}; padding: 15px; border-radius: 8px; text-align: center;">
                <p style="font-size: 13px; color: ${mutedTextColor}; margin: 0 0 5px 0;">Progress</p>
                <p style="font-size: 36px; font-weight: 700; margin: 0; color: ${accentColor};">
                    ${(progress.percentComplete || 0).toFixed(1)}%
                </p>
            </div>
            <div style="display: flex; gap: 15px; justify-content: space-between;">
                <div style="flex: 1; background-color: ${cardBgColor}; padding: 15px; border-radius: 8px; text-align: center;">
                    <p style="font-size: 13px; color: ${mutedTextColor}; margin: 0 0 5px 0;">Saved</p>
                    <p style="font-size: 20px; font-weight: 600; margin: 0;">
                        $${(progress.totalSaved || 0).toLocaleString()}
                    </p>
                </div>
                <div style="flex: 1; background-color: ${cardBgColor}; padding: 15px; border-radius: 8px; text-align: center;">
                    <p style="font-size: 13px; color: ${mutedTextColor}; margin: 0 0 5px 0;">Remaining</p>
                    <p style="font-size: 20px; font-weight: 600; margin: 0;">
                        $${(progress.remaining || 0).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>

        <div style="flex-shrink: 0; text-align: center; font-size: 11px; color: ${mutedTextColor}; opacity: 0.7;">
             Goal Tracker
        </div>
    `;

    // Append to body to render
    document.body.appendChild(shareContainer);

    try {
        toast.loading('Generating image...');
        // Render the container using html2canvas
        const canvas = await html2canvas(shareContainer, {
            scale: 2, // Increase resolution
            logging: false,
            useCORS: true,
            backgroundColor: bgColor 
        });
        toast.dismiss();

        // Trigger download
        const link = document.createElement('a');
        link.download = `${(goal.name || 'goal').replace(/\s+/g, '-')}-progress.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Progress image downloaded!');

    } catch (error) {
        console.error('Error generating sharing image:', error);
        toast.error('Failed to generate image.');
    } finally {
        // Clean up: remove the temporary container
        if (document.body.contains(shareContainer)) {
            document.body.removeChild(shareContainer);
        }
    }
  // Dependencies for useCallback
  }, [activeGoal, calculateProgress]); 

  // Reset a specific goal's data
  const resetGoalData = (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        toast.error('Goal not found to reset');
        return false;
      }
      
      // Call the manager's reset function
      const success = goalManager.resetGoalData(goalId);

      if (success) {
        // Update state
        const updatedGoals = goalManager.getGoals();
        setGoals(updatedGoals);
        if (activeGoal && activeGoal.id === goalId) {
          setActiveGoal(goalManager.getActiveGoal());
        }
        toast.success('Goal data has been reset.');
        return true;
      } else {
        toast.error('Failed to reset goal data.');
        return false;
      }
    } catch (err) {
      console.error('Error resetting goal data:', err);
      toast.error('Failed to reset goal data.');
      return false;
    }
  };

  // Reset ALL application data (Goals, Achievements)
  const resetAllApplicationData = useCallback(() => {
    if (window.confirm("DANGER! This will permanently delete ALL goals, achievements, and progress. Are you absolutely sure you want to start over?")) {
      try {
        console.warn("Resetting all application data...");
        // Clear Goals Data
        localStorage.removeItem(goalManager.GOALS_STORAGE_KEY);
        localStorage.removeItem(goalManager.ACTIVE_GOAL_KEY);
        
        // Clear Achievements Data
        localStorage.removeItem(achievementManager.EARNED_STORAGE_KEY);
        // Add any other achievement-related keys if necessary (e.g., weekend tracking)
        localStorage.removeItem('gt3_tracker_weekend_days');

        // Clear other settings (Optional - decide scope)
        // localStorage.removeItem('savings-tracker-theme');
        // localStorage.removeItem('savings-tracker-theme-color');
        // localStorage.removeItem('savings-tracker-visible-weeks');
        // localStorage.removeItem('savings-tracker-show-cumulative');
        // ... add other keys if desired ...

        toast.success("Application Reset Successfully! Reloading...");

        // Reload the page to apply changes and re-initialize
        setTimeout(() => window.location.reload(), 1500);

      } catch (error) {
        console.error("Error resetting all application data:", error);
        toast.error("Failed to reset application data.");
      }
    }
  }, []); // No dependencies needed as it operates on localStorage

  // Export all goals and achievements as JSON
  const exportAllDataAsJSON = () => {
    try {
      const allGoals = goalManager.getGoals();
      const earnedAchievements = achievementManager.getEarnedAchievements(); // Use imported manager
      const activeId = goalManager.getActiveGoalId();
      
      const data = {
        version: 2, // Current backup version
        goals: allGoals,
        activeGoalId: activeId,
        achievements: earnedAchievements,
        lastModified: new Date().toISOString()
      };
      
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `gt3-tracker-backup-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Backup created successfully!');
      return true;
    } catch (err) {
      console.error('Error exporting data as JSON:', err);
      toast.error('Failed to create backup.');
      return false;
    }
  };

  // Import data from JSON backup
  const importBackupFromJSON = (jsonData) => {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(jsonData);
        
        // Basic validation
        if (!data || data.version !== 2 || !Array.isArray(data.goals)) {
          throw new Error('Invalid or incompatible backup file format.');
        }

        // Confirmation (optional but recommended)
        if (!window.confirm("Importing this backup will replace ALL current goals and achievements. Are you sure?")) {
          toast.error("Import cancelled.");
          return resolve(false); 
        }

        // --- Save imported data --- 
        localStorage.setItem(goalManager.GOALS_STORAGE_KEY, JSON.stringify(data.goals));
        
        // Set active goal
        if (data.activeGoalId && data.goals.find(g => g.id === data.activeGoalId)) {
          localStorage.setItem(goalManager.ACTIVE_GOAL_KEY, data.activeGoalId);
        } else if (data.goals.length > 0) {
          localStorage.setItem(goalManager.ACTIVE_GOAL_KEY, data.goals[0].id);
        } else {
          localStorage.removeItem(goalManager.ACTIVE_GOAL_KEY);
        }

        // Import achievements
        if (data.achievements) {
           localStorage.setItem(achievementManager.EARNED_STORAGE_KEY, JSON.stringify(data.achievements));
        } else {
           localStorage.removeItem(achievementManager.EARNED_STORAGE_KEY);
        }
        
        toast.success('Data imported successfully! Reloading app...');
        
        // Resolve true before reloading to allow UI updates if needed
        resolve(true);

        // Force reload to apply all changes cleanly
        setTimeout(() => window.location.reload(), 1000);

      } catch (error) {
        console.error('Error importing data from JSON:', error);
        toast.error(`Import failed: ${error.message}`);
        reject(error); // Reject the promise on error
      }
    });
  };
  
  // Generate PDF Report (Placeholder - requires more complex implementation)
  const generatePdfReport = (goalId) => {
      console.warn("PDF Report generation is complex and not fully implemented here.");
      toast.info("PDF report generation coming soon!");
      // Basic info dump as example
      const goal = goals.find(g => g.id === goalId);
      if(goal) {
          console.log("Data for PDF report for goal:", goal.name, goal);
      } else {
          toast.error("Goal not found for PDF report.")
      }
      // Actual implementation would use a library like jsPDF or html2pdf
      // similar to generateSharingImage but with more structured content.
  };

  // Add the formatCurrency helper function if it doesn't exist
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Context value
  const value = {
    goals,
    currentGoal: activeGoal,
    activeGoal: activeGoal,
    isLoading,
    error,
    templates: GOAL_TEMPLATES,
    milestones: DEFAULT_MILESTONES,
    createDefaultGoal,
    addGoal,
    updateGoal,
    deleteGoal,
    switchGoal,
    duplicateGoal,
    importGoal,
    updateWeekData,
    addTradeEntry,
    updateTradeEntry,
    deleteTradeEntry,
    calculateStreakInfo,
    calculateProgress,
    exportGoalAsCSV,
    generateSharingImage,
    resetGoalData,
    exportAllDataAsJSON,
    importBackupFromJSON,
    generatePdfReport,
    resetAllApplicationData
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

export default GoalsContext; 