import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import milestoneService from './MilestoneService';
import { startOfWeek, endOfWeek, format, addWeeks, isBefore, isAfter, isWithinInterval, parseISO, addDays } from 'date-fns';

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
      
      // Migrate to real-time weeks if needed
      this.migrateToRealTimeWeeks();
      
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
    const startDate = new Date().toISOString().split('T')[0];
    const defaultGoal = {
      id: uuidv4(),
      name: 'Porsche GT3',
      target: 200000,
      startDate: startDate,
      weeks: this.generateWeeksFromStartDate(startDate, 52),
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
   * Create empty weeks array (legacy - use generateWeeksFromStartDate instead)
   */
  createEmptyWeeks(count = 52) {
    // This is kept for backward compatibility but should not be used in new code
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
   * Migrate goals to use real-time weeks
   */
  migrateToRealTimeWeeks() {
    try {
      const goals = this.getGoals();
      let hasUpdates = false;

      const updatedGoals = goals.map(goal => {
        // Skip goals that already have week date ranges
        if (goal.weeks && goal.weeks.length > 0 && goal.weeks[0].startDate) {
          return goal;
        }

        hasUpdates = true;
        
        // Ensure goal has a startDate
        if (!goal.startDate) {
          goal.startDate = new Date().toISOString().split('T')[0];
        }

        // Generate real-time weeks based on the goal's start date
        const weeks = this.generateWeeksFromStartDate(goal.startDate, goal.weeks?.length || 52);
        
        // Transfer existing week data to new structure
        if (goal.weeks && goal.weeks.length > 0) {
          goal.weeks.forEach((oldWeek, index) => {
            if (index < weeks.length) {
              weeks[index].profit = oldWeek.profit || 0;
              weeks[index].cumulative = oldWeek.cumulative || 0;
              weeks[index].isFilled = oldWeek.isFilled || oldWeek.profit !== 0;
              weeks[index].entries = oldWeek.entries || [];
              
              // Apply timestamps to entries if they don't have any
              if (weeks[index].entries && weeks[index].entries.length > 0) {
                weeks[index].entries = weeks[index].entries.map(entry => {
                  if (!entry.timestamp) {
                    // Create a timestamp in the middle of the week for existing entries
                    const weekStart = parseISO(weeks[index].startDate);
                    const entryDate = addDays(weekStart, 3); // Wednesday of that week
                    return {
                      ...entry,
                      timestamp: entryDate.toISOString()
                    };
                  }
                  return entry;
                });
              }
            }
          });
        }
        
        goal.weeks = weeks;
        goal.updatedAt = new Date().toISOString();
        
        return goal;
      });

      if (hasUpdates) {
        console.log('Migrating goals to use real-time weeks');
        this.saveGoals(updatedGoals);
        toast.success('Goals updated to use real-time weeks!');
      }
    } catch (error) {
      console.error('Error migrating to real-time weeks:', error);
    }
  }

  /**
   * Generate weeks from a start date
   * @param {string} startDateStr - ISO string for start date
   * @param {number} count - Number of weeks to generate
   * @returns {Array} Array of week objects with date ranges
   */
  generateWeeksFromStartDate(startDateStr, count = 52) {
    const startDate = parseISO(startDateStr);
    const weeks = [];

    for (let i = 0; i < count; i++) {
      const weekStartDate = addWeeks(startDate, i);
      const weekEndDate = endOfWeek(weekStartDate);
      
      weeks.push({
        week: i + 1,
        startDate: format(weekStartDate, 'yyyy-MM-dd'),
        endDate: format(weekEndDate, 'yyyy-MM-dd'),
        displayName: `Week of ${format(weekStartDate, 'MMM d')}–${format(weekEndDate, 'MMM d, yyyy')}`,
        profit: 0,
        cumulative: 0,
        isFilled: false,
        entries: []
      });
    }

    return weeks;
  }

  /**
   * Get the current week number based on a goal's start date
   * @param {string} startDateStr - ISO string for goal start date
   * @returns {number} - Current week number (1-based)
   */
  getCurrentWeekNumber(startDateStr) {
    const startDate = parseISO(startDateStr);
    const now = new Date();
    
    // If now is before startDate, return 1
    if (isBefore(now, startDate)) {
      return 1;
    }
    
    // Calculate weeks difference
    const weekStart = startOfWeek(startDate);
    const weekDiff = Math.floor((now - weekStart) / (7 * 24 * 60 * 60 * 1000));
    
    return weekDiff + 1;
  }
  
  /**
   * Find the week that a date falls into
   * @param {Array} weeks - Array of week objects
   * @param {Date|string} date - Date to find week for
   * @returns {Object|null} - Week object or null if not found
   */
  findWeekForDate(weeks, date) {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    for (const week of weeks) {
      const weekStart = parseISO(week.startDate);
      const weekEnd = parseISO(week.endDate);
      
      if (isWithinInterval(dateObj, { start: weekStart, end: weekEnd })) {
        return week;
      }
    }
    
    return null;
  }
  
  /**
   * Ensure a goal has enough weeks going forward
   * @param {Object} goal - Goal object
   * @param {number} minWeeksAhead - Minimum number of weeks to ensure ahead of current
   * @returns {Object} - Updated goal object
   */
  ensureEnoughWeeks(goal, minWeeksAhead = 4) {
    if (!goal.startDate || !goal.weeks || !goal.weeks.length) {
      return goal;
    }
    
    const currentWeekNum = this.getCurrentWeekNumber(goal.startDate);
    const weeksNeeded = currentWeekNum + minWeeksAhead;
    
    // If we already have enough weeks, return the goal as is
    if (goal.weeks.length >= weeksNeeded) {
      return goal;
    }
    
    // Get the last week
    const lastWeek = goal.weeks[goal.weeks.length - 1];
    const lastWeekEndDate = parseISO(lastWeek.endDate);
    
    // Generate new weeks
    const additionalWeeksNeeded = weeksNeeded - goal.weeks.length;
    const newWeeks = [];
    
    for (let i = 1; i <= additionalWeeksNeeded; i++) {
      const weekStartDate = addDays(lastWeekEndDate, (i * 7) - 6);
      const weekEndDate = addDays(lastWeekEndDate, i * 7);
      
      newWeeks.push({
        week: goal.weeks.length + i,
        startDate: format(weekStartDate, 'yyyy-MM-dd'),
        endDate: format(weekEndDate, 'yyyy-MM-dd'),
        displayName: `Week of ${format(weekStartDate, 'MMM d')}–${format(weekEndDate, 'MMM d, yyyy')}`,
        profit: 0,
        cumulative: 0,
        isFilled: false,
        entries: []
      });
    }
    
    // Create a new goal object with the additional weeks
    return {
      ...goal,
      weeks: [...goal.weeks, ...newWeeks],
      updatedAt: new Date().toISOString()
    };
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
      const startDate = goalData.startDate || new Date().toISOString().split('T')[0];
      
      // Create a new goal
      const newGoal = {
        id: uuidv4(),
        name: goalData.name || 'New Goal',
        target: goalData.target || 0,
        startDate: startDate,
        deadline: goalData.deadline || null,
        description: goalData.description || '',
        weeks: this.generateWeeksFromStartDate(startDate, 52),
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
        goal.weeks = this.generateWeeksFromStartDate(goal.startDate, 52);
      }
      
      // Ensure the weekIndex is valid
      if (weekIndex < 0 || weekIndex >= goal.weeks.length) {
        console.error('Invalid week index:', weekIndex);
        return false;
      }
      
      // Update the week data
      const updatedWeeks = [...goal.weeks];
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        profit: parseFloat(profit) || 0,
        isFilled: (parseFloat(profit) !== 0) || (additionalData.isFilled === true),
        ...additionalData
      };
      
      // Recalculate cumulative values
      this.recalculateCumulativeValues(updatedWeeks);
      
      // Update the goal
      const updatedGoal = {
        ...goal,
        weeks: updatedWeeks,
        updatedAt: new Date().toISOString()
      };
      
      // Ensure we have enough weeks going forward
      const goalWithEnoughWeeks = this.ensureEnoughWeeks(updatedGoal);
      
      // Save the updated goal
      return this.updateGoal(goalId, goalWithEnoughWeeks);
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

  /**
   * Add a trade entry to the correct week based on timestamp
   * @param {string} goalId - Goal ID
   * @param {Object} entry - Trade entry with timestamp
   * @returns {Object} - Result with success flag and weekNum
   */
  addTradeEntryWithTimestamp(goalId, entry) {
    try {
      // Get goal data
      const goal = this.getGoalById(goalId);
      if (!goal) {
        console.error('Goal not found:', goalId);
        return { success: false, error: 'Goal not found' };
      }
      
      // Ensure entry has a timestamp
      if (!entry.timestamp) {
        entry.timestamp = new Date().toISOString();
      }
      
      // Create date object from timestamp
      const entryDate = parseISO(entry.timestamp);
      
      // Ensure weeks array exists and has date ranges
      if (!goal.weeks || goal.weeks.length === 0 || !goal.weeks[0].startDate) {
        goal.weeks = this.generateWeeksFromStartDate(goal.startDate, 52);
      }
      
      // Ensure we have enough weeks
      const updatedGoal = this.ensureEnoughWeeks(goal);
      
      // Find the week that this date falls into
      const week = this.findWeekForDate(updatedGoal.weeks, entryDate);
      
      if (!week) {
        console.error('Could not find matching week for date:', entry.timestamp);
        return { 
          success: false, 
          error: 'No matching week found for this date' 
        };
      }
      
      // Get the week index (0-based)
      const weekIndex = updatedGoal.weeks.findIndex(w => w.week === week.week);
      
      // Clone the weeks array
      const updatedWeeks = [...updatedGoal.weeks];
      
      // Ensure the week has an entries array
      if (!updatedWeeks[weekIndex].entries) {
        updatedWeeks[weekIndex].entries = [];
      }
      
      // Add the entry to the appropriate week
      updatedWeeks[weekIndex].entries.push(entry);
      
      // Calculate the new profit for the week
      const weekProfit = updatedWeeks[weekIndex].entries.reduce(
        (sum, e) => sum + (parseFloat(e.amount) || 0), 0
      );
      
      // Update the week's profit and filled flag
      updatedWeeks[weekIndex].profit = weekProfit;
      updatedWeeks[weekIndex].isFilled = weekProfit !== 0;
      
      // Recalculate cumulative values
      this.recalculateCumulativeValues(updatedWeeks);
      
      // Update the goal
      const success = this.updateGoal(goalId, {
        ...updatedGoal,
        weeks: updatedWeeks,
        updatedAt: new Date().toISOString()
      });
      
      return { 
        success, 
        weekNum: week.week, 
        weekIndex,
        displayName: week.displayName
      };
    } catch (error) {
      console.error('Error adding trade entry with timestamp:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Add or update past week data (backfill)
   * @param {string} goalId - Goal ID
   * @param {string} weekStartDate - Start date of the week (ISO string)
   * @param {number} profit - Profit amount for the week
   * @param {Array} entries - Optional entries to add
   * @returns {Object} - Result with success flag and weekNum
   */
  backfillWeekData(goalId, weekStartDate, profit, entries = []) {
    try {
      // Get goal data
      const goal = this.getGoalById(goalId);
      if (!goal) {
        console.error('Goal not found:', goalId);
        return { success: false, error: 'Goal not found' };
      }
      
      // Ensure weeks array exists and has date ranges
      if (!goal.weeks || goal.weeks.length === 0 || !goal.weeks[0].startDate) {
        goal.weeks = this.generateWeeksFromStartDate(goal.startDate, 52);
      }
      
      // Parse the week start date
      const startDate = parseISO(weekStartDate);
      
      // Find the matching week
      let matchingWeek = null;
      let weekIndex = -1;
      
      for (let i = 0; i < goal.weeks.length; i++) {
        const weekStart = parseISO(goal.weeks[i].startDate);
        const weekEnd = parseISO(goal.weeks[i].endDate);
        
        if (isWithinInterval(startDate, { start: weekStart, end: weekEnd })) {
          matchingWeek = goal.weeks[i];
          weekIndex = i;
          break;
        }
      }
      
      // If no matching week, check if we need to add earlier weeks
      if (!matchingWeek) {
        // If the date is before the goal start date, we need to prepend weeks
        const goalStartDate = parseISO(goal.startDate);
        
        if (isBefore(startDate, goalStartDate)) {
          // Calculate how many weeks to prepend
          const weeksDiff = Math.ceil((goalStartDate - startDate) / (7 * 24 * 60 * 60 * 1000));
          
          // Generate the new weeks
          const newStartDate = format(addDays(startDate, -(startDate.getDay())), 'yyyy-MM-dd');
          const prependWeeks = this.generateWeeksFromStartDate(newStartDate, weeksDiff);
          
          // Update the goal's start date and weeks
          goal.startDate = newStartDate;
          goal.weeks = [...prependWeeks, ...goal.weeks];
          
          // Adjust week numbers for all weeks
          goal.weeks.forEach((week, i) => {
            week.week = i + 1;
          });
          
          // Recalculate week index
          weekIndex = 0; // First week in the prepended array
          matchingWeek = goal.weeks[weekIndex];
        }
        // If the date is after the last week, we need to append weeks
        else {
          const lastWeek = goal.weeks[goal.weeks.length - 1];
          const lastWeekEndDate = parseISO(lastWeek.endDate);
          
          if (isAfter(startDate, lastWeekEndDate)) {
            // Generate enough weeks to cover the target date
            const weeksDiff = Math.ceil((startDate - lastWeekEndDate) / (7 * 24 * 60 * 60 * 1000));
            const updatedGoal = this.ensureEnoughWeeks(goal, weeksDiff + 1);
            
            // Find the matching week again in the updated weeks array
            for (let i = 0; i < updatedGoal.weeks.length; i++) {
              const weekStart = parseISO(updatedGoal.weeks[i].startDate);
              const weekEnd = parseISO(updatedGoal.weeks[i].endDate);
              
              if (isWithinInterval(startDate, { start: weekStart, end: weekEnd })) {
                matchingWeek = updatedGoal.weeks[i];
                weekIndex = i;
                break;
              }
            }
            
            // If we still don't have a matching week, something is wrong
            if (!matchingWeek) {
              return { 
                success: false, 
                error: 'Failed to find or create a matching week for this date' 
              };
            }
            
            // Update the goal reference
            goal.weeks = updatedGoal.weeks;
          }
        }
      }
      
      // Now we should have a valid week index
      if (weekIndex === -1 || !matchingWeek) {
        return { 
          success: false, 
          error: 'Could not determine week for this date' 
        };
      }
      
      // Update the week
      const updatedWeeks = [...goal.weeks];
      
      // If entries are provided, add them
      if (entries && entries.length > 0) {
        if (!updatedWeeks[weekIndex].entries) {
          updatedWeeks[weekIndex].entries = [];
        }
        
        // Add timestamp to entries if missing
        const entriesWithTimestamps = entries.map(entry => {
          if (!entry.timestamp) {
            return {
              ...entry,
              timestamp: new Date().toISOString()
            };
          }
          return entry;
        });
        
        updatedWeeks[weekIndex].entries.push(...entriesWithTimestamps);
        
        // Calculate profit from entries
        const weekProfit = updatedWeeks[weekIndex].entries.reduce(
          (sum, e) => sum + (parseFloat(e.amount) || 0), 0
        );
        
        // Use the calculated profit if no explicit profit was provided
        if (profit === undefined || profit === null) {
          profit = weekProfit;
        }
      }
      
      // Update the week data
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        profit: parseFloat(profit) || 0,
        isFilled: true
      };
      
      // Recalculate cumulative values
      this.recalculateCumulativeValues(updatedWeeks);
      
      // Update the goal
      const success = this.updateGoal(goalId, {
        ...goal,
        weeks: updatedWeeks,
        updatedAt: new Date().toISOString()
      });
      
      return { 
        success, 
        weekNum: matchingWeek.week, 
        weekIndex,
        displayName: matchingWeek.displayName
      };
    } catch (error) {
      console.error('Error backfilling week data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export a singleton instance
const goalManager = new GoalManager();
export default goalManager; 