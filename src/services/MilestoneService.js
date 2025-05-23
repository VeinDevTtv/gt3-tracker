import { toast } from 'react-hot-toast';
import goalManager from './GoalManager';
import { v4 as uuidv4 } from 'uuid';
import { differenceInWeeks, parseISO, format } from 'date-fns';

/**
 * Default milestones that can be created for a new goal
 */
const DEFAULT_MILESTONE_TEMPLATES = [
  {
    type: 'percentage',
    value: 25,
    message: 'Reached 25% of your goal!',
    isTimeSensitive: true,
    icon: '🎯'
  },
  {
    type: 'percentage',
    value: 50,
    message: 'Halfway there! 50% complete',
    isTimeSensitive: true,
    icon: '🏁'
  },
  {
    type: 'percentage',
    value: 75,
    message: '75% of the way to your goal!',
    isTimeSensitive: true,
    icon: '🚀'
  },
  {
    type: 'percentage',
    value: 100,
    message: 'Goal complete! Congratulations!',
    isTimeSensitive: true,
    icon: '🏆'
  },
  {
    type: 'streak',
    value: 3,
    message: '3-week profitable streak achieved!',
    isTimeSensitive: true,
    icon: '🔥'
  },
  {
    type: 'streak',
    value: 5,
    message: 'Amazing! 5-week profitable streak!',
    isTimeSensitive: true,
    icon: '⚡'
  },
  {
    type: 'weekly',
    value: 1000,
    message: 'Your first $1,000+ week!',
    isTimeSensitive: true,
    icon: '💰'
  },
  {
    type: 'weekly',
    value: 5000,
    message: 'Incredible! $5,000+ in a single week!',
    isTimeSensitive: true,
    icon: '💎'
  }
];

/**
 * MilestoneService - Manages milestone data for savings goals
 * @class MilestoneService
 */
class MilestoneService {
  constructor() {
    this.MILESTONES_STORAGE_KEY = 'gt3_tracker_milestones_v2';
    this.initialized = false;
  }

  /**
   * Initialize the milestone service
   * @returns {MilestoneService} - This instance
   */
  initialize() {
    if (this.initialized) {
      console.log('MilestoneService already initialized');
      return this;
    }

    console.log('Initializing MilestoneService...');
    
    try {
      // Ensure milestones storage exists
      const allMilestones = this.getAllMilestones();
      
      this.initialized = true;
      console.log('MilestoneService initialized successfully');
      
      // Migrate to new format if needed
      this.migrateToNewFormat();
    } catch (error) {
      console.error('Failed to initialize MilestoneService:', error);
    }
    
    return this;
  }

  /**
   * Migrate milestone data to new format if needed
   */
  migrateToNewFormat() {
    try {
      const milestones = this.getAllMilestones();
      let hasUpdates = false;
      
      // Check each goal's milestones for format updates
      Object.keys(milestones).forEach(goalId => {
        if (!Array.isArray(milestones[goalId])) return;
        
        milestones[goalId].forEach(milestone => {
          // Add isTimeSensitive if missing
          if (milestone.isTimeSensitive === undefined) {
            milestone.isTimeSensitive = true;
            hasUpdates = true;
          }
          
          // Add achieved info if missing
          if (!milestone.achieved && milestone.completed) {
            milestone.achieved = {
              date: milestone.completedDate || new Date().toISOString(),
              goalId: goalId,
              weekNumber: milestone.completedWeek || null
            };
            hasUpdates = true;
          }
        });
      });
      
      // Save if we made updates
      if (hasUpdates) {
        this.saveAllMilestones(milestones);
        console.log('Migrated milestones to new format');
      }
    } catch (error) {
      console.error('Error migrating milestones:', error);
    }
  }

  /**
   * Get all milestones for all goals
   * @returns {Object} - Object with goalId keys and milestone arrays
   */
  getAllMilestones() {
    try {
      const milestonesJSON = localStorage.getItem(this.MILESTONES_STORAGE_KEY);
      if (!milestonesJSON) return {};
      
      const milestones = JSON.parse(milestonesJSON);
      return typeof milestones === 'object' ? milestones : {};
    } catch (error) {
      console.error('Error getting milestones:', error);
      return {};
    }
  }

  /**
   * Get milestones for a specific goal
   * @param {string} goalId - The ID of the goal
   * @returns {Array} - Array of milestone objects
   */
  getMilestonesForGoal(goalId) {
    try {
      const allMilestones = this.getAllMilestones();
      return allMilestones[goalId] || [];
    } catch (error) {
      console.error('Error getting milestones for goal:', error);
      return [];
    }
  }

  /**
   * Save all milestones
   * @param {Object} milestones - Object with goalId keys and milestone arrays
   * @returns {boolean} - Success status
   */
  saveAllMilestones(milestones) {
    try {
      localStorage.setItem(this.MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
      return true;
    } catch (error) {
      console.error('Error saving milestones:', error);
      return false;
    }
  }

  /**
   * Create default milestones for a goal based on target amount
   * @param {string} goalId - The ID of the goal
   * @param {number} targetAmount - The target amount for the goal
   * @returns {Array} - The created milestones
   */
  createDefaultMilestones(goalId, targetAmount) {
    try {
      // Calculate sensible milestone amounts based on the target
      const milestonePercentages = [10, 25, 50, 75, 90, 100];
      const milestones = milestonePercentages.map(percentage => {
        const amount = Math.round(targetAmount * percentage / 100);
        return {
          id: uuidv4(),
          goalId,
          amount,
          percentage,
          title: `${percentage}% Milestone`,
          description: percentage === 100 
            ? "You did it! Time to buy your Porsche GT3!" 
            : `You've reached ${percentage}% of your goal!`,
          reward: percentage === 100 
            ? "Buy your dream Porsche GT3!" 
            : `Celebrate your ${percentage}% achievement`,
          icon: this.getIconForPercentage(percentage),
          achieved: false,
          achievedDate: null,
          createdAt: new Date().toISOString()
        };
      });

      // Save these milestones
      const allMilestones = this.getAllMilestones();
      allMilestones[goalId] = milestones;
      this.saveAllMilestones(allMilestones);
      
      return milestones;
    } catch (error) {
      console.error('Error creating default milestones:', error);
      return [];
    }
  }

  /**
   * Get icon for milestone percentage
   * @param {number} percentage - Milestone percentage
   * @returns {string} - Icon representing the milestone
   */
  getIconForPercentage(percentage) {
    if (percentage <= 10) return '🏁';
    if (percentage <= 25) return '🛞';
    if (percentage <= 50) return '🔧';
    if (percentage <= 75) return '⚙️';
    if (percentage <= 90) return '🚗';
    return '🏎️';
  }

  /**
   * Add a milestone to a goal
   * @param {string} goalId - The ID of the goal
   * @param {Object} milestone - Milestone data
   * @returns {Object} - The created milestone
   */
  addMilestone(goalId, milestone) {
    try {
      const newMilestone = {
        id: uuidv4(),
        goalId,
        amount: milestone.amount,
        percentage: milestone.percentage,
        title: milestone.title || `${milestone.percentage}% Milestone`,
        description: milestone.description || `You've reached ${milestone.percentage}% of your goal!`,
        reward: milestone.reward || `Celebrate your ${milestone.percentage}% achievement`,
        icon: milestone.icon || this.getIconForPercentage(milestone.percentage),
        achieved: false,
        achievedDate: null,
        createdAt: new Date().toISOString()
      };

      const allMilestones = this.getAllMilestones();
      if (!allMilestones[goalId]) {
        allMilestones[goalId] = [];
      }
      
      allMilestones[goalId].push(newMilestone);
      allMilestones[goalId].sort((a, b) => a.amount - b.amount);
      
      this.saveAllMilestones(allMilestones);
      return newMilestone;
    } catch (error) {
      console.error('Error adding milestone:', error);
      return null;
    }
  }

  /**
   * Update a milestone
   * @param {string} goalId - The ID of the goal
   * @param {string} milestoneId - The ID of the milestone
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} - Updated milestone or null
   */
  updateMilestone(goalId, milestoneId, updates) {
    try {
      const allMilestones = this.getAllMilestones();
      if (!allMilestones[goalId]) return null;
      
      const milestoneIndex = allMilestones[goalId].findIndex(m => m.id === milestoneId);
      if (milestoneIndex === -1) return null;
      
      // Update the milestone
      allMilestones[goalId][milestoneIndex] = {
        ...allMilestones[goalId][milestoneIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Re-sort if amount was updated
      if (updates.amount !== undefined) {
        allMilestones[goalId].sort((a, b) => a.amount - b.amount);
      }
      
      this.saveAllMilestones(allMilestones);
      return allMilestones[goalId].find(m => m.id === milestoneId);
    } catch (error) {
      console.error('Error updating milestone:', error);
      return null;
    }
  }

  /**
   * Delete a milestone
   * @param {string} goalId - The ID of the goal
   * @param {string} milestoneId - The ID of the milestone
   * @returns {boolean} - Success status
   */
  deleteMilestone(goalId, milestoneId) {
    try {
      const allMilestones = this.getAllMilestones();
      if (!allMilestones[goalId]) return false;
      
      const originalLength = allMilestones[goalId].length;
      allMilestones[goalId] = allMilestones[goalId].filter(m => m.id !== milestoneId);
      
      if (allMilestones[goalId].length === originalLength) {
        return false; // Milestone not found
      }
      
      this.saveAllMilestones(allMilestones);
      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      return false;
    }
  }

  /**
   * Check milestones against current savings amount
   * @param {string} goalId - The ID of the goal 
   * @param {number} currentAmount - Current savings amount
   * @returns {Object|null} - Newly achieved milestone or null
   */
  checkMilestones(goalId, currentAmount) {
    try {
      const milestones = this.getMilestonesForGoal(goalId);
      if (!milestones.length) return null;
      
      let newlyAchievedMilestone = null;
      let updated = false;
      
      for (const milestone of milestones) {
        const shouldBeAchieved = currentAmount >= milestone.amount;
        
        if (shouldBeAchieved && !milestone.achieved) {
          // Milestone newly achieved
          milestone.achieved = true;
          milestone.achievedDate = new Date().toISOString();
          newlyAchievedMilestone = { ...milestone };
          updated = true;
        } else if (!shouldBeAchieved && milestone.achieved) {
          // Milestone no longer achieved (e.g. if savings decreased)
          milestone.achieved = false;
          milestone.achievedDate = null;
          updated = true;
        }
      }
      
      if (updated) {
        const allMilestones = this.getAllMilestones();
        allMilestones[goalId] = milestones;
        this.saveAllMilestones(allMilestones);
      }
      
      return newlyAchievedMilestone;
    } catch (error) {
      console.error('Error checking milestones:', error);
      return null;
    }
  }

  /**
   * Reset all milestones for a goal
   * @param {string} goalId - The ID of the goal
   * @returns {boolean} - Success status
   */
  resetMilestones(goalId) {
    try {
      const allMilestones = this.getAllMilestones();
      if (!allMilestones[goalId]) return true;
      
      allMilestones[goalId] = allMilestones[goalId].map(milestone => ({
        ...milestone,
        achieved: false,
        achievedDate: null,
        updatedAt: new Date().toISOString()
      }));
      
      this.saveAllMilestones(allMilestones);
      return true;
    } catch (error) {
      console.error('Error resetting milestones:', error);
      return false;
    }
  }

  /**
   * Get milestone achievement status with real-time date details
   * @param {string} goalId - Goal ID 
   * @param {string} milestoneId - Milestone ID
   * @returns {Object} - Achievement details
   */
  getMilestoneAchievementStatus(goalId, milestoneId) {
    try {
      if (!goalId || !milestoneId) {
        return null;
      }
      
      const allMilestones = this.getAllMilestones();
      
      // Check if goal has milestones
      if (!allMilestones[goalId]) {
        return null;
      }
      
      // Find the milestone
      const milestone = allMilestones[goalId].find(m => m.id === milestoneId);
      if (!milestone) {
        return null;
      }
      
      // If milestone is not achieved, return basic status
      if (!milestone.completed || !milestone.achieved) {
        return {
          achieved: false,
          milestone: milestone
        };
      }
      
      // Get the goal to provide context for the achievement
      const goal = goalManager.getGoalById(goalId);
      if (!goal) {
        return {
          achieved: true,
          milestone: milestone,
          achievedDate: milestone.completedDate || milestone.achieved.date
        };
      }
      
      // Get formatted date
      const achievedDate = milestone.achieved.date 
        ? format(parseISO(milestone.achieved.date), 'MMM d, yyyy')
        : format(parseISO(milestone.completedDate), 'MMM d, yyyy');
      
      // Get week information
      let weekInfo = '';
      if (milestone.achieved.weekNumber) {
        const weekData = goal.weeks.find(w => w.week === milestone.achieved.weekNumber);
        if (weekData && weekData.displayName) {
          weekInfo = weekData.displayName;
        } else {
          weekInfo = `Week ${milestone.achieved.weekNumber}`;
        }
      }
      
      // Calculate weeks from start to achievement
      let weeksToAchieve = null;
      if (goal.startDate && milestone.achieved.date) {
        const startDate = parseISO(goal.startDate);
        const achievementDate = parseISO(milestone.achieved.date);
        weeksToAchieve = differenceInWeeks(achievementDate, startDate) + 1;
      }
      
      return {
        achieved: true,
        milestone: milestone,
        achievedDate: achievedDate,
        weekInfo: weekInfo,
        weeksToAchieve: weeksToAchieve,
        goalName: goal.name
      };
    } catch (error) {
      console.error('Error getting milestone achievement status:', error);
      return null;
    }
  }
}

// Export singleton instance
const milestoneService = new MilestoneService();
export default milestoneService; 