import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import goalManager from '../services/GoalManager';

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
      const goalId = goalManager.createGoal(goalData);
      
      // Update state
      const updatedGoals = goalManager.getGoals();
      setGoals(updatedGoals);
      
      toast.success('Goal created successfully!');
      return goalId;
    } catch (err) {
      console.error('Error adding goal:', err);
      toast.error('Failed to create goal');
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
            : 0
        });
      }
      
      // Update the profit for the specified week
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        profit: parseFloat(profit)
      };
      
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
      
      const weeks = goal.weeks;
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < weeks.length; i++) {
        if (weeks[i].profit > 0) {
          tempStreak++;
          
          // If this is the last week or the next week breaks the streak
          if (i === weeks.length - 1 || weeks[i+1].profit <= 0) {
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
        totalWeeks: weeks.length
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
      
      const totalSaved = goal.weeks[goal.weeks.length - 1].cumulative;
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

  // Context value
  const value = {
    goals,
    currentGoal: activeGoal,
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
    calculateStreakInfo,
    calculateProgress,
    exportGoalAsCSV
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

export default GoalsContext; 