import { toast } from 'react-hot-toast';
import { 
  Trophy, Award, Target, Calendar, Sunrise, CheckCircle, 
  Sparkles, BarChart4, Clock
} from 'lucide-react';
import React from 'react';

/**
 * AchievementManager service
 * Manages user achievements and provides functions to check and unlock them
 * Complete rewrite for reliability
 */
class AchievementManager {
  constructor() {
    this.initialized = false;
    this.EARNED_STORAGE_KEY = 'gt3_tracker_earned_achievements_v2';
    
    console.log('AchievementManager constructor called');
  }

  /**
   * Initialize the achievement manager
   */
  initialize() {
    if (this.initialized) {
      console.log('AchievementManager already initialized');
      return this;
    }

    console.log('Initializing AchievementManager...');
    
    try {
      // Check if we need to migrate old data
      this.migrateFromOldFormat();
      
      // Initialize achievements
      this.initializeAchievements();
      
      this.initialized = true;
      console.log('AchievementManager initialized successfully');
      
      // Force a check on initialization to see if any should be unlocked
      this.checkAppStatus();
    } catch (error) {
      console.error('Failed to initialize AchievementManager:', error);
    }
    
    return this;
  }

  /**
   * Initialize the achievements list
   */
  initializeAchievements() {
    // Define all possible achievements
    this.achievements = {
      // Starter achievements
      'first-goal': {
        id: 'first-goal',
        title: 'Dream Starter',
        description: 'Create your first savings goal',
        icon: <Target className="h-6 w-6" />,
        points: 10,
        category: 'starter',
      },
      'first-entry': {
        id: 'first-entry',
        title: 'First Step',
        description: 'Add your first saving entry',
        icon: <CheckCircle className="h-6 w-6" />,
        points: 10,
        category: 'starter',
      },
      
      // Milestone achievements
      'milestone-10k': {
        id: 'milestone-10k',
        title: '$10K Milestone',
        description: 'Reach $10,000 in savings',
        icon: <Award className="h-6 w-6" />,
        points: 50,
        category: 'milestone',
      },
      'milestone-50k': {
        id: 'milestone-50k',
        title: '$50K Milestone',
        description: 'Reach $50,000 in savings',
        icon: <Award className="h-6 w-6" />,
        points: 100,
        category: 'milestone',
      },
      'milestone-100k': {
        id: 'milestone-100k',
        title: '$100K Milestone',
        description: 'Reach $100,000 in savings',
        icon: <Trophy className="h-6 w-6" />,
        points: 200,
        category: 'milestone',
      },
      'milestone-150k': {
        id: 'milestone-150k',
        title: '$150K Club',
        description: 'Reach $150,000 in savings',
        icon: <Trophy className="h-6 w-6" />,
        points: 250,
        category: 'milestone',
      },
      'milestone-200k': {
        id: 'milestone-200k',
        title: 'GT3 Achiever',
        description: 'Save enough for your GT3!',
        icon: <Sparkles className="h-6 w-6" />,
        points: 500,
        category: 'milestone',
      },
      
      // Consistency achievements
      'consistent-1': {
        id: 'consistent-1',
        title: 'Consistent Saver',
        description: 'Add savings for 4 weeks in a row',
        icon: <Calendar className="h-6 w-6" />,
        points: 25,
        category: 'consistency',
      },
      'consistent-2': {
        id: 'consistent-2',
        title: 'Dedicated Saver',
        description: 'Add savings for 8 weeks in a row',
        icon: <Calendar className="h-6 w-6" />,
        points: 50,
        category: 'consistency',
      },
      
      // Multi-goal achievements
      'multi-goal': {
        id: 'multi-goal',
        title: 'Goal Collector',
        description: 'Create 3 or more saving goals',
        icon: <Trophy className="h-6 w-6" />,
        points: 20,
        category: 'multi-goal',
      },
      'multi-goal-5': {
        id: 'multi-goal-5',
        title: 'Dream Portfolio',
        description: 'Create 5 or more saving goals',
        icon: <BarChart4 className="h-6 w-6" />,
        points: 50,
        category: 'multi-goal',
      },
      
      // Time-based achievements
      'night-owl': {
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Use the app between midnight and 5 AM',
        icon: <Sunrise className="h-6 w-6" />,
        points: 15,
        category: 'time',
      },
      'early-bird': {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Use the app between 5 AM and 7 AM',
        icon: <Sunrise className="h-6 w-6" />,
        points: 15,
        category: 'time',
      },
      'weekend-warrior': {
        id: 'weekend-warrior',
        title: 'Weekend Warrior',
        description: 'Log in on both Saturday and Sunday',
        icon: <Clock className="h-6 w-6" />,
        points: 20,
        category: 'time',
      }
    };
  }

  /**
   * Migrate from old format if needed
   */
  migrateFromOldFormat() {
    try {
      // Check if old data exists
      const oldEarnedJSON = localStorage.getItem('earnedAchievements');
      if (oldEarnedJSON && !localStorage.getItem(this.EARNED_STORAGE_KEY)) {
        console.log('Migrating earned achievements from old format...');
        localStorage.setItem(this.EARNED_STORAGE_KEY, oldEarnedJSON);
      }
    } catch (error) {
      console.error('Error migrating achievements data:', error);
      // Continue with empty data
    }
  }

  /**
   * Check app status to trigger basic achievements
   */
  checkAppStatus() {
    console.log('Checking app status for achievements...');
    
    try {
      // Import GoalManager if needed
      const goalManager = require('./GoalManager').default;
      
      // Trigger achievements based on app state
      const goals = goalManager.getGoals();
      const activeGoal = goalManager.getActiveGoal();
      
      // Check for first-goal achievement
      if (goals && goals.length > 0) {
        this.unlockAchievement('first-goal');
        
        // Check for multi-goal achievements
        if (goals.length >= 3) {
          this.unlockAchievement('multi-goal');
        }
        if (goals.length >= 5) {
          this.unlockAchievement('multi-goal-5');
        }
      }
      
      // Check for first-entry and milestone achievements
      if (activeGoal && activeGoal.weeks) {
        // Check for first-entry achievement
        const hasEntries = activeGoal.weeks.some(week => week.profit > 0);
        if (hasEntries) {
          this.unlockAchievement('first-entry');
        }
        
        // Check for consistency achievements
        this.checkConsistencyAchievements(activeGoal.weeks);
        
        // Check for milestone achievements based on total savings
        const total = activeGoal.weeks.reduce((sum, week) => sum + (parseFloat(week.profit) || 0), 0);
        this.checkMilestoneAchievements(total);
      }
      
      // Always check time-based achievements
      this.checkTimeBasedAchievements();
      
    } catch (err) {
      console.error('Error in checkAppStatus:', err);
    }
  }

  /**
   * Check for milestone achievements based on total amount
   */
  checkMilestoneAchievements(total) {
    console.log(`Checking milestone achievements for total: ${total}`);
    
    if (total >= 10000) this.unlockAchievement('milestone-10k');
    if (total >= 50000) this.unlockAchievement('milestone-50k');
    if (total >= 100000) this.unlockAchievement('milestone-100k');
    if (total >= 150000) this.unlockAchievement('milestone-150k');
    if (total >= 200000) this.unlockAchievement('milestone-200k');
  }

  /**
   * Check for consistency achievements
   */
  checkConsistencyAchievements(weeks) {
    if (!weeks || !Array.isArray(weeks)) return;
    
    let streak = 0;
    for (let i = 0; i < weeks.length; i++) {
      if (weeks[i].profit > 0) {
        streak++;
      } else {
        streak = 0;
      }
      
      // Check achievements based on streak
      if (streak >= 4) this.unlockAchievement('consistent-1');
      if (streak >= 8) this.unlockAchievement('consistent-2');
    }
  }

  /**
   * Check for time-based achievements
   */
  checkTimeBasedAchievements() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Night owl: midnight to 5 AM
    if (hour >= 0 && hour < 5) {
      this.unlockAchievement('night-owl');
    }
    
    // Early bird: 5 AM to 7 AM
    if (hour >= 5 && hour < 7) {
      this.unlockAchievement('early-bird');
    }
    
    // Weekend warrior: track visits on Saturday and Sunday
    if (day === 0 || day === 6) {
      // Track weekend days visited in localStorage
      const weekendDaysVisited = localStorage.getItem('gt3_tracker_weekend_days') || '';
      
      if (day === 0 && !weekendDaysVisited.includes('0')) {
        localStorage.setItem('gt3_tracker_weekend_days', weekendDaysVisited + '0');
      }
      
      if (day === 6 && !weekendDaysVisited.includes('6')) {
        localStorage.setItem('gt3_tracker_weekend_days', weekendDaysVisited + '6');
      }
      
      // Check if both days are visited
      if (localStorage.getItem('gt3_tracker_weekend_days')?.includes('0') && 
          localStorage.getItem('gt3_tracker_weekend_days')?.includes('6')) {
        this.unlockAchievement('weekend-warrior');
      }
    }
  }

  /**
   * Check for goal-specific achievements
   */
  checkForAchievements(state) {
    console.log('Checking for achievements with state:', state);
    let newAchievements = [];
    
    try {
      // First, check all basic status achievements
      this.checkAppStatus();
      
      if (state?.goals) {
        // Goal-related achievements
        if (state.goals.length >= 3) {
          if (this.unlockAchievement('multi-goal')) {
            newAchievements.push(this.achievements['multi-goal']);
          }
        }
        
        if (state.goals.length >= 5) {
          if (this.unlockAchievement('multi-goal-5')) {
            newAchievements.push(this.achievements['multi-goal-5']);
          }
        }
      }
      
      if (state?.activeGoal?.weeks) {
        const weeks = state.activeGoal.weeks;
        
        // Check for first-entry achievement
        const hasEntry = weeks.some(week => week.profit > 0);
        if (hasEntry) {
          if (this.unlockAchievement('first-entry')) {
            newAchievements.push(this.achievements['first-entry']);
          }
        }
        
        // Check consistency
        this.checkConsistencyAchievements(weeks);
        
        // Check for milestone achievements
        const total = weeks.reduce((sum, week) => sum + (parseFloat(week.profit) || 0), 0);
        
        if (total >= 10000 && this.unlockAchievement('milestone-10k')) {
          newAchievements.push(this.achievements['milestone-10k']);
        }
        
        if (total >= 50000 && this.unlockAchievement('milestone-50k')) {
          newAchievements.push(this.achievements['milestone-50k']);
        }
        
        if (total >= 100000 && this.unlockAchievement('milestone-100k')) {
          newAchievements.push(this.achievements['milestone-100k']);
        }
        
        if (total >= 150000 && this.unlockAchievement('milestone-150k')) {
          newAchievements.push(this.achievements['milestone-150k']);
        }
        
        if (total >= 200000 && this.unlockAchievement('milestone-200k')) {
          newAchievements.push(this.achievements['milestone-200k']);
        }
      }
      
    } catch (err) {
      console.error('Error checking for achievements:', err);
    }
    
    return newAchievements;
  }

  /**
   * Get the list of all achievements
   */
  getAchievements() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.achievements;
  }

  /**
   * Get earned achievements from localStorage
   */
  getEarnedAchievements() {
    try {
      const earnedJSON = localStorage.getItem(this.EARNED_STORAGE_KEY);
      return earnedJSON ? JSON.parse(earnedJSON) : {};
    } catch (error) {
      console.error('Error getting earned achievements:', error);
      return {};
    }
  }

  /**
   * Save earned achievements to localStorage
   */
  saveEarnedAchievements(earnedAchievements) {
    try {
      localStorage.setItem(this.EARNED_STORAGE_KEY, JSON.stringify(earnedAchievements));
      return true;
    } catch (error) {
      console.error('Error saving earned achievements:', error);
      return false;
    }
  }

  /**
   * Check if an achievement has been earned
   */
  hasAchieved(achievementId) {
    const earnedAchievements = this.getEarnedAchievements();
    return !!earnedAchievements[achievementId];
  }

  /**
   * Get total points from earned achievements
   */
  getTotalPoints() {
    const earnedAchievements = this.getEarnedAchievements();
    let totalPoints = 0;
    
    Object.keys(earnedAchievements).forEach(id => {
      if (this.achievements[id]) {
        totalPoints += this.achievements[id].points;
      }
    });
    
    return totalPoints;
  }

  /**
   * Unlock a specific achievement
   */
  unlockAchievement(achievementId) {
    // Skip if not initialized
    if (!this.initialized) {
      this.initialize();
    }
    
    try {
      console.log(`Attempting to unlock achievement: ${achievementId}`);
      
      // Check if already earned
      if (this.hasAchieved(achievementId)) {
        console.log(`Achievement ${achievementId} already earned`);
        return false;
      }
      
      // Check if the achievement exists
      if (!this.achievements[achievementId]) {
        console.error(`Achievement ${achievementId} does not exist`);
        return false;
      }
      
      // Mark as earned
      const earnedAchievements = this.getEarnedAchievements();
      earnedAchievements[achievementId] = new Date().toISOString();
      this.saveEarnedAchievements(earnedAchievements);
      
      // Show toast notification
      const achievement = this.achievements[achievementId];
      toast.success(
        <div>
          <div className="text-lg font-bold">Achievement Unlocked!</div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{achievement.icon}</span>
            <span>{achievement.title}</span>
          </div>
          <div className="text-sm">{achievement.description}</div>
          <div className="text-sm font-semibold">+{achievement.points} points</div>
        </div>,
        { duration: 5000 }
      );
      
      console.log(`Achievement unlocked: ${achievementId}`);
      return true;
    } catch (error) {
      console.error(`Error unlocking achievement ${achievementId}:`, error);
      return false;
    }
  }

  /**
   * Reset all achievements
   */
  resetAchievements() {
    console.log('Resetting all achievements...');
    try {
      localStorage.removeItem(this.EARNED_STORAGE_KEY);
      localStorage.removeItem('gt3_tracker_weekend_days'); // Reset weekend tracking
      toast.success('All achievements have been reset');
      return true;
    } catch (error) {
      console.error('Error resetting achievements:', error);
      return false;
    }
  }

  /**
   * Debug function to unlock all achievements
   */
  debugUnlockAll() {
    console.log('DEBUG: Unlocking all achievements');
    const earnedAchievements = {};
    
    Object.keys(this.achievements).forEach(id => {
      earnedAchievements[id] = new Date().toISOString();
    });
    
    this.saveEarnedAchievements(earnedAchievements);
    toast.success('All achievements unlocked!');
    return true;
  }
}

// Create a singleton instance
const achievementManager = new AchievementManager();
export default achievementManager; 