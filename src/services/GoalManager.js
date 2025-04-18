import { toast } from 'react-hot-toast';

class GoalManager {
  constructor() {
    this.GOALS_STORAGE_KEY = 'gt3_tracker_goals';
    this.ACTIVE_GOAL_KEY = 'gt3_tracker_active_goal';
  }

  /**
   * Initialize the goal manager by loading goals from localStorage
   */
  initialize() {
    // If no goals exist yet, create a default goal and migrate existing data
    const goals = this.getGoals();
    if (!goals || goals.length === 0) {
      this.migrateExistingDataToGoals();
    }
    
    // Ensure there's an active goal
    const activeGoalId = localStorage.getItem(this.ACTIVE_GOAL_KEY);
    const goals2 = this.getGoals();
    if ((!activeGoalId || !goals2.find(g => g.id === activeGoalId)) && goals2.length > 0) {
      this.setActiveGoal(goals2[0].id);
    }
  }

  /**
   * Get all goals from localStorage
   * @returns {Array} - Array of goal objects
   */
  getGoals() {
    const goalsJSON = localStorage.getItem(this.GOALS_STORAGE_KEY);
    if (!goalsJSON) return [];
    try {
      return JSON.parse(goalsJSON) || [];
    } catch (error) {
      console.error('Error parsing goals:', error);
      return [];
    }
  }

  /**
   * Save goals to localStorage
   * @param {Array} goals - Array of goal objects to save
   */
  saveGoals(goals) {
    localStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(goals));
  }

  /**
   * Get the active goal ID
   * @returns {string} - Active goal ID
   */
  getActiveGoalId() {
    return localStorage.getItem(this.ACTIVE_GOAL_KEY);
  }

  /**
   * Get the active goal object
   * @returns {Object|null} - Active goal object or null if not found
   */
  getActiveGoal() {
    const activeGoalId = this.getActiveGoalId();
    if (!activeGoalId) return null;
    
    const goals = this.getGoals();
    return goals.find(goal => goal.id === activeGoalId) || null;
  }

  /**
   * Set the active goal by ID
   * @param {string} goalId - ID of the goal to set as active
   * @returns {boolean} - Whether the operation was successful
   */
  setActiveGoal(goalId) {
    const goals = this.getGoals();
    const goalExists = goals.some(goal => goal.id === goalId);
    
    if (!goalExists) {
      console.error(`Goal with ID ${goalId} not found`);
      return false;
    }
    
    localStorage.setItem(this.ACTIVE_GOAL_KEY, goalId);
    return true;
  }

  /**
   * Create a new goal
   * @param {Object} goalData - Data for the new goal
   * @returns {string} - ID of the new goal
   */
  createGoal(goalData) {
    const goals = this.getGoals();
    
    const newGoal = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...goalData,
      weeks: goalData.weeks || [],
      lastMilestone: goalData.lastMilestone || null
    };
    
    goals.push(newGoal);
    this.saveGoals(goals);
    
    // If this is the first goal, set it as active
    if (goals.length === 1) {
      this.setActiveGoal(newGoal.id);
    }
    
    return newGoal.id;
  }

  /**
   * Update an existing goal
   * @param {string} goalId - ID of the goal to update
   * @param {Object} updates - Object containing updates to apply
   * @returns {boolean} - Whether the operation was successful
   */
  updateGoal(goalId, updates) {
    const goals = this.getGoals();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      console.error(`Goal with ID ${goalId} not found`);
      return false;
    }
    
    goals[goalIndex] = {
      ...goals[goalIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveGoals(goals);
    return true;
  }

  /**
   * Delete a goal
   * @param {string} goalId - ID of the goal to delete
   * @returns {boolean} - Whether the operation was successful
   */
  deleteGoal(goalId) {
    const goals = this.getGoals();
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    
    if (updatedGoals.length === goals.length) {
      console.error(`Goal with ID ${goalId} not found`);
      return false;
    }
    
    this.saveGoals(updatedGoals);
    
    // If the deleted goal was active, set another goal as active
    if (this.getActiveGoalId() === goalId && updatedGoals.length > 0) {
      this.setActiveGoal(updatedGoals[0].id);
    }
    
    return true;
  }

  /**
   * Migrate existing app data to the goals system
   */
  migrateExistingDataToGoals() {
    try {
      // Check for existing data
      const goalName = localStorage.getItem('goalName');
      const target = localStorage.getItem('target');
      const startDate = localStorage.getItem('startDate');
      const weeksJSON = localStorage.getItem('weeks');
      
      if (!goalName && !target && !weeksJSON) {
        // No data to migrate, create a default goal
        this.createGoal({
          name: 'Porsche GT3',
          target: 200000,
          startDate: new Date().toISOString().split('T')[0],
          weeks: [],
          isCompleted: false
        });
        return;
      }
      
      // Parse existing data
      const weeks = weeksJSON ? JSON.parse(weeksJSON) : [];
      const lastMilestoneJSON = localStorage.getItem('lastMilestone');
      const lastMilestone = lastMilestoneJSON ? JSON.parse(lastMilestoneJSON) : null;
      
      // Create a goal with existing data
      this.createGoal({
        name: goalName || 'Porsche GT3',
        target: target ? parseFloat(target) : 200000,
        startDate: startDate || new Date().toISOString().split('T')[0],
        weeks,
        lastMilestone,
        isCompleted: false
      });
      
      toast.success('Existing data has been migrated to the new goal system!', {
        duration: 5000
      });
    } catch (error) {
      console.error('Error migrating data:', error);
      // Create a default goal in case of errors
      this.createGoal({
        name: 'Porsche GT3',
        target: 200000,
        startDate: new Date().toISOString().split('T')[0],
        weeks: [],
        isCompleted: false
      });
    }
  }
}

// Create a singleton instance
const goalManager = new GoalManager();
export default goalManager; 