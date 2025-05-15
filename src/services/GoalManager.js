import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import milestoneService from './MilestoneService';

/**
 * GoalManager - Handles all goal-related operations
 * Complete rewrite for reliability
 */
class GoalManager {
  constructor() {
    this.GOALS_STORAGE_KEY = 'gt3_tracker_goals_v3';
    this.ACTIVE_GOAL_KEY = 'gt3_tracker_active_goal_v3';
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
      // Initialize milestone service
      milestoneService.initialize();

      // Check if we need to migrate old data
      this.migrateFromOldFormat();
      
      // Migrate to add isFilled flag to existing weeks
      this.migrateToAddIsFilledFlag();
      
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
      cumulative: 0,
      isFilled: false
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
   * Migrate to add isFilled flag to existing weeks
   */
  migrateToAddIsFilledFlag() {
    try {
      // Check for v2 data
      const oldGoalsDataKey = 'gt3_tracker_goals_v2';
      const oldActiveGoalKey = 'gt3_tracker_active_goal_v2';
      const oldGoalsData = localStorage.getItem(oldGoalsDataKey);
      const newGoalsData = localStorage.getItem(this.GOALS_STORAGE_KEY);
      
      // If we already have v3 data, don't migrate
      if (newGoalsData) {
        console.log('Already using latest storage format, no migration needed.');
        return;
      }
      
      if (oldGoalsData) {
        console.log('Migrating goals from v2 to v3 to add isFilled flag...');
        const oldGoals = JSON.parse(oldGoalsData);
        
        // Update each goal's weeks to include isFilled flag
        const updatedGoals = oldGoals.map(goal => {
          if (goal.weeks) {
            goal.weeks = goal.weeks.map(week => ({
              ...week,
              isFilled: week.profit !== 0 // Set isFilled to true if profit is not 0
            }));
          }
          return goal;
        });
        
        // Save in new format
        localStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
        
        // Migrate active goal
        const oldActiveGoal = localStorage.getItem(oldActiveGoalKey);
        if (oldActiveGoal) {
          localStorage.setItem(this.ACTIVE_GOAL_KEY, oldActiveGoal);
        }
        
        console.log('Data migrated to include isFilled flag successfully!');
        return;
      }
      
      // Check for v1 data if v2 doesn't exist
      const v1GoalsDataKey = 'gt3_tracker_goals';
      const v1ActiveGoalKey = 'gt3_tracker_active_goal';
      const v1GoalsData = localStorage.getItem(v1GoalsDataKey);
      
      if (v1GoalsData) {
        console.log('Migrating goals from v1 to v3 to add isFilled flag...');
        const v1Goals = JSON.parse(v1GoalsData);
        
        // Update each goal's weeks to include isFilled flag
        const updatedGoals = v1Goals.map(goal => {
          if (goal.weeks) {
            goal.weeks = goal.weeks.map(week => ({
              ...week,
              isFilled: week.profit !== 0 // Set isFilled to true if profit is not 0
            }));
          }
          return goal;
        });
        
        // Save in new format
        localStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
        
        // Migrate active goal
        const v1ActiveGoal = localStorage.getItem(v1ActiveGoalKey);
        if (v1ActiveGoal) {
          localStorage.setItem(this.ACTIVE_GOAL_KEY, v1ActiveGoal);
        }
        
        console.log('Data migrated from v1 to v3 with isFilled flag successfully!');
      }
    } catch (error) {
      console.error('Error migrating data to add isFilled flag:', error);
      // Don't throw, just continue
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
      // Create a new goal
      const newGoal = {
        id: uuidv4(),
        name: goalData.name || 'New Goal',
        target: goalData.target || 0,
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        deadline: goalData.deadline || null,
        description: goalData.description || '',
        weeks: this.createEmptyWeeks(52),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to goals list
      const goals = this.getGoals();
      goals.push(newGoal);
      
      // Save updated list
      this.saveGoals(goals);
      
      // Create default milestones for this goal
      milestoneService.createDefaultMilestones(newGoal.id, newGoal.target);
      
      return newGoal.id;
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
      // Get current goals
      const goals = this.getGoals();
      
      // Find the goal to update
      const goalIndex = goals.findIndex(goal => goal.id === goalId);
      if (goalIndex === -1) {
        console.error('Goal not found:', goalId);
        return false;
      }
      
      // Store the old target amount to check if it changed
      const oldTarget = goals[goalIndex].target;
      
      // Update the goal
      goals[goalIndex] = {
        ...goals[goalIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update goal weeks if needed
      if (updates.weeks) {
        goals[goalIndex].weeks = updates.weeks;
      }
      
      // Save updated goals
      this.saveGoals(goals);
      
      // If target amount changed, update milestones
      if (updates.target && updates.target !== oldTarget) {
        // Reset and recreate milestones with the new target
        milestoneService.resetMilestones(goalId);
        milestoneService.createDefaultMilestones(goalId, updates.target);
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
      // Get current goals
      const goals = this.getGoals();
      
      // Ensure we don't delete the only goal
      if (goals.length <= 1) {
        console.error('Cannot delete the only goal');
        return false;
      }
      
      // Filter out the goal to delete
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      
      // Check if the active goal is being deleted
      const activeGoalId = this.getActiveGoalId();
      if (activeGoalId === goalId) {
        // Set another goal as active
        this.setActiveGoal(updatedGoals[0].id);
      }
      
      // Save updated goals
      this.saveGoals(updatedGoals);
      
      // Delete associated milestones
      const allMilestones = milestoneService.getAllMilestones();
      if (allMilestones[goalId]) {
        delete allMilestones[goalId];
        milestoneService.saveAllMilestones(allMilestones);
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
  updateWeekProfit(goalId, weekIndex, profit, additionalData = {}) {
    try {
      // Get goal data
      const goal = this.getGoalById(goalId);
      if (!goal) {
        console.error('Goal not found:', goalId);
        return false;
      }
      
      // Ensure weeks array exists
      if (!goal.weeks) {
        goal.weeks = this.createEmptyWeeks(52);
      }
      
      // Ensure the weekIndex is valid
      if (weekIndex < 0 || weekIndex >= goal.weeks.length) {
        console.error('Invalid week index:', weekIndex);
        return false;
      }
      
      // Calculate the old cumulative amount
      const oldCumulative = goal.weeks[weekIndex].cumulative;
      
      // Calculate new cumulative by adjusting all subsequent weeks
      const profitChange = profit - goal.weeks[weekIndex].profit;
      
      // Update the specific week
      goal.weeks[weekIndex] = {
        ...goal.weeks[weekIndex],
        profit,
        isFilled: profit !== 0,
        ...additionalData,
      };
      
      // Recalculate all cumulative values
      this.recalculateCumulativeValues(goal.weeks);
      
      // Update the goal
      const goals = this.getGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      goals[goalIndex] = {
        ...goal,
        updatedAt: new Date().toISOString()
      };
      
      // Save updated goals
      this.saveGoals(goals);
      
      // Calculate total saved to check milestones
      const totalSaved = goal.weeks.reduce((sum, week) => sum + (week.profit || 0), 0);
      
      // Check if any milestones are achieved with this update
      milestoneService.checkMilestones(goalId, totalSaved);
      
      return true;
    } catch (error) {
      console.error('Error updating week profit:', error);
      return false;
    }
  }

  /**
   * Recalculate cumulative values for all weeks
   * @param {Array} weeks - Array of week objects
   */
  recalculateCumulativeValues(weeks) {
    let cumulativeAmount = 0;
    for (let i = 0; i < weeks.length; i++) {
      cumulativeAmount += (weeks[i].profit || 0);
      weeks[i].cumulative = cumulativeAmount;
    }
  }

  /**
   * Reset goal data
   */
  resetGoalData(goalId) {
    try {
      // Get goal
      const goal = this.getGoalById(goalId);
      if (!goal) {
        console.error('Goal not found:', goalId);
        return false;
      }
      
      // Reset weeks data
      goal.weeks = this.createEmptyWeeks(52);
      goal.updatedAt = new Date().toISOString();
      
      // Update in storage
      const goals = this.getGoals();
      const goalIndex = goals.findIndex(g => g.id === goalId);
      goals[goalIndex] = goal;
      this.saveGoals(goals);
      
      // Reset milestone achievements
      milestoneService.resetMilestones(goalId);
      
      return true;
    } catch (error) {
      console.error('Error resetting goal data:', error);
      return false;
    }
  }
}

// Export a singleton instance
const goalManager = new GoalManager();
export default goalManager; 