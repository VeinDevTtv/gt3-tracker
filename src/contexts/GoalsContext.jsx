import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import goalManager from '../services/GoalManager';
import achievementManager from '../services/AchievementManager';
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
      const goalId = goalManager.createGoal(goalData);
      
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
        const milestoneService = require('../services/MilestoneService').default;
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
             GT3 Tracker
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