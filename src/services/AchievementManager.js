import { toast } from 'react-hot-toast';
import { 
  Trophy, Award, Target, Calendar, Sunrise, CheckCircle 
} from 'lucide-react';

// Debug to see if loaded
console.log('AchievementManager module loaded');

/**
 * AchievementManager service
 * Handles milestone achievements and celebrations
 */
class AchievementManager {
  constructor() {
    console.log('AchievementManager constructor called');
    // Initialize with a default set of achievements
    this.achievements = {
      'first-goal': {
        id: 'first-goal',
        title: 'Dream Starter',
        description: 'Create your first savings goal',
        icon: <Target />,
        points: 10,
        category: 'starter',
        condition: (state) => state.goals && state.goals.length > 0
      },
      'multi-goal': {
        id: 'multi-goal',
        title: 'Goal Collector',
        description: 'Create 3 or more saving goals',
        icon: <Trophy />,
        points: 20,
        category: 'multi-goal',
        condition: (state) => state.goals && state.goals.length >= 3
      },
      'first-entry': {
        id: 'first-entry',
        title: 'First Step',
        description: 'Add your first saving entry',
        icon: <CheckCircle />,
        points: 10,
        category: 'starter',
        condition: (state) => {
          const weeks = state.activeGoal?.weeks || [];
          return weeks.some(week => week.profit > 0);
        }
      },
      'consistent-1': {
        id: 'consistent-1',
        title: 'Consistent Saver',
        description: 'Add savings for 4 weeks in a row',
        icon: <Calendar />,
        points: 25,
        category: 'consistency',
        condition: (state) => {
          const weeks = state.activeGoal?.weeks || [];
          let streak = 0;
          for (let i = 0; i < weeks.length; i++) {
            if (weeks[i].profit > 0) {
              streak++;
              if (streak >= 4) return true;
            } else {
              streak = 0;
            }
          }
          return false;
        }
      },
      'milestone-10k': {
        id: 'milestone-10k',
        title: '$10K Milestone',
        description: 'Reach $10,000 in savings',
        icon: <Award />,
        points: 50,
        category: 'milestone',
        condition: (state) => {
          const weeks = state.activeGoal?.weeks || [];
          const total = weeks.reduce((sum, week) => sum + (week.profit || 0), 0);
          return total >= 10000;
        }
      },
      'milestone-50k': {
        id: 'milestone-50k',
        title: '$50K Milestone',
        description: 'Reach $50,000 in savings',
        icon: <Award />,
        points: 100,
        category: 'milestone',
        condition: (state) => {
          const weeks = state.activeGoal?.weeks || [];
          const total = weeks.reduce((sum, week) => sum + (week.profit || 0), 0);
          return total >= 50000;
        }
      },
      'milestone-100k': {
        id: 'milestone-100k',
        title: '$100K Milestone',
        description: 'Reach $100,000 in savings',
        icon: <Trophy />,
        points: 200,
        category: 'milestone',
        condition: (state) => {
          const weeks = state.activeGoal?.weeks || [];
          const total = weeks.reduce((sum, week) => sum + (week.profit || 0), 0);
          return total >= 100000;
        }
      },
      'night-owl': {
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Use the app between midnight and 5 AM',
        icon: <Sunrise />,
        points: 15,
        category: 'time',
      },
      'early-bird': {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Use the app between 5 AM and 7 AM',
        icon: <Sunrise />,
        points: 15,
        category: 'time',
      }
    };
    this.milestones = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000];
    this.initialized = false;
    this.STORAGE_KEY = 'earnedAchievements';
    this.ACHIEVEMENTS_STORAGE_KEY = 'savings-tracker-achievements';
  }

  /**
   * Initialize the achievement manager
   */
  initialize() {
    if (this.initialized) {
      console.log('Achievement Manager already initialized, skipping');
      return this;
    }
    this.initialized = true;
    console.log('Achievement Manager initialized');
    this.loadAchievements();
    return this;
  }

  /**
   * Load achievements from local storage
   */
  loadAchievements() {
    try {
      const savedAchievements = localStorage.getItem(this.ACHIEVEMENTS_STORAGE_KEY);
      if (savedAchievements) {
        // Merge saved achievements with defaults to ensure new ones are included
        const loaded = JSON.parse(savedAchievements);
        if (typeof loaded === 'object' && loaded !== null && !Array.isArray(loaded)) {
          this.achievements = { ...this.achievements, ...loaded };
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }

  /**
   * Save achievements to local storage
   */
  saveAchievements() {
    try {
      localStorage.setItem(this.ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(this.achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  /**
   * Check if a milestone has been achieved
   * @param {number} amount - The amount to check
   * @returns {number|null} - The milestone achieved or null
   */
  checkMilestone(amount) {
    // Find the highest milestone we've passed that hasn't been recorded yet
    for (let i = this.milestones.length - 1; i >= 0; i--) {
      const milestone = this.milestones[i];
      if (amount >= milestone && !this.hasAchieved(milestone)) {
        this.recordAchievement(milestone);
        return milestone;
      }
    }
    return null;
  }

  /**
   * Record a new achievement
   * @param {number} milestone - The milestone achieved
   */
  recordAchievement(milestone) {
    const milestoneId = `milestone-${milestone}`;
    if (!this.achievements[milestoneId]) {
      this.achievements[milestoneId] = {
        id: milestoneId,
        title: `$${milestone.toLocaleString()} Milestone`,
        description: `Reach $${milestone.toLocaleString()} in savings`,
        icon: milestone >= 100000 ? <Trophy /> : <Award />,
        points: milestone / 1000,
        category: 'milestone',
        date: new Date().toISOString()
      };
      this.saveAchievements();
    }
  }

  /**
   * Check if a milestone has already been achieved
   * @param {number} milestone - The milestone to check
   * @returns {boolean} - Whether the milestone has been achieved
   */
  hasAchieved(milestone) {
    const milestoneId = `milestone-${milestone}`;
    return !!this.achievements[milestoneId];
  }

  /**
   * Get all achievements
   * @returns {Object} - The achievements
   */
  getAchievements() {
    return this.achievements;
  }

  /**
   * Reset all achievements
   */
  resetAchievements() {
    // Only reset earned achievements, not the definitions
    this.saveEarnedAchievements({});
  }
  
  // Get only a specific category of achievements
  getAchievementsByCategory(category) {
    return Object.values(this.achievements).filter(
      achievement => achievement.category === category
    );
  }
  
  // Get earned achievements from localStorage
  getEarnedAchievements() {
    try {
      const earned = localStorage.getItem(this.STORAGE_KEY);
      return earned ? JSON.parse(earned) : {};
    } catch (error) {
      console.error('Error getting earned achievements:', error);
      return {};
    }
  }
  
  // Save earned achievements to localStorage
  saveEarnedAchievements(earnedAchievements) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(earnedAchievements));
    } catch (error) {
      console.error('Error saving earned achievements:', error);
    }
  }
  
  // Get total points earned
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
  
  // Mark achievement as earned
  unlockAchievement(achievementId) {
    const earnedAchievements = this.getEarnedAchievements();
    
    // Check if already earned
    if (earnedAchievements[achievementId]) {
      return false; // Already earned, no need to do anything
    }
    
    // Mark as earned with timestamp
    earnedAchievements[achievementId] = new Date().toISOString();
    this.saveEarnedAchievements(earnedAchievements);
    
    // Get achievement details for notification
    const achievement = this.achievements[achievementId];
    if (achievement) {
      // Show toast notification
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
      
      return true; // Successfully unlocked
    }
    
    return false;
  }
  
  // Check for achievements based on app state
  checkForAchievements(state) {
    const earnedAchievements = this.getEarnedAchievements();
    let newlyUnlocked = [];
    
    // Check each achievement's condition
    Object.values(this.achievements).forEach(achievement => {
      // Skip if already earned
      if (earnedAchievements[achievement.id]) {
        return;
      }
      
      // If the achievement has a condition function, check it
      if (achievement.condition && achievement.condition(state)) {
        const unlocked = this.unlockAchievement(achievement.id);
        if (unlocked) {
          newlyUnlocked.push(achievement);
        }
      }
    });
    
    return newlyUnlocked;
  }
  
  // Manually trigger specific achievements (for actions like exports, imports, etc.)
  triggerAchievement(achievementId, state) {
    const earnedAchievements = this.getEarnedAchievements();
    
    // Skip if already earned
    if (earnedAchievements[achievementId]) {
      return false;
    }
    
    return this.unlockAchievement(achievementId);
  }
  
  // Check time-based special achievements
  checkTimeBasedAchievements() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 0 && hour < 5) {
      // Night owl: after midnight and before 5 AM
      this.triggerAchievement('night-owl');
    } else if (hour >= 5 && hour < 7) {
      // Early bird: between 5 AM and 7 AM
      this.triggerAchievement('early-bird');
    }
  }
}

// Create a singleton instance
const achievementManager = new AchievementManager();
console.log('AchievementManager singleton created');

export default achievementManager; 