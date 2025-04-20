import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

/**
 * GoalManager - Handles all goal-related operations
 * Complete rewrite for reliability
 */
class GoalManager {
  constructor() {
    this.GOALS_STORAGE_KEY = 'gt3_tracker_goals_v2';
    this.ACTIVE_GOAL_KEY = 'gt3_tracker_active_goal_v2';
    this.initialized = false;

    console.log('GoalManager created');
  }

  /**
   * Initialize the goal manager
   */
  initialize() {
    if (this.initialized) {
      console.log('GoalManager already initialized');
      return this;
    }

    console.log('Initializing GoalManager...');
    
    try {
      // Check if we need to migrate old data
      this.migrateFromOldFormat();
      
      // Ensure we have at least one goal
      const goals = this.getGoals();
      if (goals.length === 0) {
        console.log('No goals found, creating default goal');
        this.createDefaultGoal();
      }
      
      // Ensure we have an active goal
      const activeGoalId = localStorage.getItem(this.ACTIVE_GOAL_KEY);
      if (!activeGoalId || !this.getGoalById(activeGoalId)) {
        console.log('No active goal set, setting first goal as active');
        const goals = this.getGoals();
        if (goals.length > 0) {
          this.setActiveGoal(goals[0].id);
        }
      }

      this.initialized = true;
      console.log('GoalManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GoalManager:', error);
      // Create a default goal as a fallback
      this.createDefaultGoal();
    }
    
    return this;
  }

  /**
   * Create a default goal
   */
  createDefaultGoal() {
    const defaultGoal = {
      id: uuidv4(),
      name: 'Porsche GT3',
      target: 200000,
      startDate: new Date().toISOString().split('T')[0],
      weeks: this.createEmptyWeeks(52),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Creating default goal:', defaultGoal);
    
    // Save to storage
    const goals = [defaultGoal];
    this.saveGoals(goals);
    this.setActiveGoal(defaultGoal.id);
    
    return defaultGoal.id;
  }

  /**
   * Create empty weeks array
   */
  createEmptyWeeks(count = 52) {
    return Array.from({ length: count }, (_, i) => ({
      week: i + 1,
      profit: 0,
      cumulative: 0
    }));
  }

  /**
   * Migrate from old format if needed
   */
  migrateFromOldFormat() {
    try {
      // Check if old data exists and new format doesn't
      const oldGoalsData = localStorage.getItem('gt3_tracker_goals');
      const newGoalsData = localStorage.getItem(this.GOALS_STORAGE_KEY);
      
      if (oldGoalsData && !newGoalsData) {
        console.log('Migrating data from old format...');
        const oldGoals = JSON.parse(oldGoalsData);
        
        // Save in new format
        localStorage.setItem(this.GOALS_STORAGE_KEY, oldGoalsData);
        
        // Migrate active goal
        const oldActiveGoal = localStorage.getItem('gt3_tracker_active_goal');
        if (oldActiveGoal) {
          localStorage.setItem(this.ACTIVE_GOAL_KEY, oldActiveGoal);
        }
        
        toast.success('Data migrated to new format successfully!');
      }
      
      // Also check for very old format (pre-multi-goal)
      const oldWeeksData = localStorage.getItem('weeks');
      const oldGoalName = localStorage.getItem('goalName');
      const oldTarget = localStorage.getItem('target');
      
      if (oldWeeksData && !newGoalsData && !oldGoalsData) {
        console.log('Migrating from very old format...');
        
        // Create a goal from old data
        const weeks = JSON.parse(oldWeeksData);
        const goal = {
          id: uuidv4(),
          name: oldGoalName || 'Porsche GT3',
          target: oldTarget ? parseFloat(oldTarget) : 200000,
          startDate: localStorage.getItem('startDate') || new Date().toISOString().split('T')[0],
          weeks: weeks || this.createEmptyWeeks(52),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save in new format
        this.saveGoals([goal]);
        this.setActiveGoal(goal.id);
        
        toast.success('Legacy data migrated successfully!');
      }
    } catch (error) {
      console.error('Error migrating data:', error);
      // Don't throw, just continue with new empty data
    }
  }

  /**
   * Get all goals from localStorage
   */
  getGoals() {
    try {
      const goalsJSON = localStorage.getItem(this.GOALS_STORAGE_KEY);
      if (!goalsJSON) return [];
      
      const goals = JSON.parse(goalsJSON);
      return Array.isArray(goals) ? goals : [];
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  /**
   * Get a specific goal by ID
   */
  getGoalById(goalId) {
    try {
      const goals = this.getGoals();
      return goals.find(goal => goal.id === goalId) || null;
    } catch (error) {
      console.error('Error getting goal by ID:', error);
      return null;
    }
  }

  /**
   * Save goals to localStorage
   */
  saveGoals(goals) {
    try {
      localStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(goals));
      return true;
    } catch (error) {
      console.error('Error saving goals:', error);
      return false;
    }
  }

  /**
   * Get the active goal ID
   */
  getActiveGoalId() {
    return localStorage.getItem(this.ACTIVE_GOAL_KEY);
  }

  /**
   * Get the active goal object
   */
  getActiveGoal() {
    const activeGoalId = this.getActiveGoalId();
    if (!activeGoalId) return null;
    
    return this.getGoalById(activeGoalId);
  }

  /**
   * Set the active goal by ID
   */
  setActiveGoal(goalId) {
    try {
      const goal = this.getGoalById(goalId);
      if (!goal) {
        console.error(`Goal with ID ${goalId} not found`);
        return false;
      }
      
      localStorage.setItem(this.ACTIVE_GOAL_KEY, goalId);
      console.log(`Active goal set to ${goal.name} (${goalId})`);
      
      // Check for achievements when changing goals
      try {
        // Dynamically import to avoid circular dependencies
        const achievementManager = require('./AchievementManager').default;
        if (achievementManager) {
          achievementManager.checkForAchievements({
            goals: this.getGoals(),
            activeGoal: goal
          });
        }
      } catch (err) {
        console.log('Could not check achievements when changing goal:', err);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting active goal:', error);
      return false;
    }
  }

  /**
   * Create a new goal
   */
  createGoal(goalData) {
    try {
      const goals = this.getGoals();
      
      // Generate unique ID and timestamps
      const newGoalId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Create new goal object with defaults for missing fields
      const newGoal = {
        id: newGoalId,
        createdAt: timestamp,
        updatedAt: timestamp,
        name: goalData.name || 'New Goal',
        target: goalData.target ? parseFloat(goalData.target) : 200000,
        startDate: goalData.startDate || timestamp.split('T')[0],
        weeks: goalData.weeks || this.createEmptyWeeks(52)
      };
      
      console.log('Creating new goal:', newGoal);
      
      // Add to goals list
      goals.push(newGoal);
      this.saveGoals(goals);
      
      // Set as active goal
      this.setActiveGoal(newGoalId);
      
      // Trigger achievement check
      try {
        const achievementManager = require('./AchievementManager').default;
        if (achievementManager) {
          achievementManager.checkForAchievements({
            goals: goals,
            activeGoal: newGoal
          });
        }
      } catch (err) {
        console.log('Could not check achievements when creating goal:', err);
      }
      
      return newGoalId;
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  }

  /**
   * Update an existing goal
   */
  updateGoal(goalId, updates) {
    try {
      const goals = this.getGoals();
      const goalIndex = goals.findIndex(goal => goal.id === goalId);
      
      if (goalIndex === -1) {
        console.error(`Goal with ID ${goalId} not found`);
        return false;
      }
      
      // Process numeric values
      const processedUpdates = { ...updates };
      if (updates.target) {
        processedUpdates.target = parseFloat(updates.target);
      }
      
      // Process weeks
      if (updates.weeks) {
        processedUpdates.weeks = updates.weeks.map(week => ({
          ...week,
          week: parseInt(week.week) || 0,
          profit: parseFloat(week.profit) || 0,
          cumulative: parseFloat(week.cumulative) || 0
        }));
      }
      
      // Update the goal
      goals[goalIndex] = {
        ...goals[goalIndex],
        ...processedUpdates,
        updatedAt: new Date().toISOString()
      };
      
      // Save and check for achievements
      this.saveGoals(goals);
      
      // Check for achievements if weeks were updated
      if (updates.weeks && goalId === this.getActiveGoalId()) {
        try {
          const achievementManager = require('./AchievementManager').default;
          if (achievementManager) {
            achievementManager.checkForAchievements({
              goals: goals,
              activeGoal: goals[goalIndex]
            });
          }
        } catch (err) {
          console.log('Could not check achievements when updating goal:', err);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  }

  /**
   * Delete a goal
   */
  deleteGoal(goalId) {
    try {
      const goals = this.getGoals();
      const filteredGoals = goals.filter(goal => goal.id !== goalId);
      
      // Check if anything was removed
      if (filteredGoals.length === goals.length) {
        console.error(`Goal with ID ${goalId} not found`);
        return false;
      }
      
      // If we're deleting the active goal, set a new one
      const activeGoalId = this.getActiveGoalId();
      
      this.saveGoals(filteredGoals);
      
      if (activeGoalId === goalId && filteredGoals.length > 0) {
        this.setActiveGoal(filteredGoals[0].id);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  /**
   * Update profit for a specific week
   */
  updateWeekProfit(goalId, weekIndex, profit) {
    try {
      const goal = this.getGoalById(goalId);
      if (!goal) {
        console.error(`Goal with ID ${goalId} not found`);
        return false;
      }
      
      // Ensure weeks array exists and is long enough
      if (!goal.weeks || goal.weeks.length <= weekIndex) {
        console.error(`Week ${weekIndex + 1} not found in goal`);
        return false;
      }
      
      // Parse profit as a number
      const profitNum = parseFloat(profit) || 0;
      
      // Update the week's profit
      const updatedWeeks = [...goal.weeks];
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        profit: profitNum,
        week: weekIndex + 1
      };
      
      // Recalculate cumulative values
      let cumulative = 0;
      updatedWeeks.forEach((week, i) => {
        cumulative += parseFloat(week.profit) || 0;
        updatedWeeks[i].cumulative = cumulative;
      });
      
      // Update the goal
      return this.updateGoal(goalId, { weeks: updatedWeeks });
    } catch (error) {
      console.error('Error updating week profit:', error);
      return false;
    }
  }

  /**
   * Reset goal data
   */
  resetGoalData(goalId) {
    try {
      const goal = this.getGoalById(goalId);
      if (!goal) {
        console.error(`Goal with ID ${goalId} not found`);
        return false;
      }
      
      // Reset weeks to empty values
      const resetWeeks = this.createEmptyWeeks(goal.weeks.length || 52);
      
      // Update the goal
      return this.updateGoal(goalId, { weeks: resetWeeks });
    } catch (error) {
      console.error('Error resetting goal data:', error);
      return false;
    }
  }
}

// Export a singleton instance
const goalManager = new GoalManager();
export default goalManager; 