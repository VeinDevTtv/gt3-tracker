import { toast } from 'react-hot-toast';

// Define achievements
const ACHIEVEMENTS = {
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Set your first savings goal',
    icon: '🌅',
    points: 10
  },
  FIRST_DEPOSIT: {
    id: 'first_deposit',
    title: 'First Deposit',
    description: 'Record your first savings deposit',
    icon: '💰',
    points: 10
  },
  CONSISTENT_SAVER: {
    id: 'consistent_saver',
    title: 'Consistent Saver',
    description: 'Add savings for 4 consecutive weeks',
    icon: '📆',
    points: 25
  },
  BIG_MILESTONE: {
    id: 'big_milestone',
    title: 'Big Milestone',
    description: 'Reach 25% of your savings goal',
    icon: '🏁',
    points: 25
  },
  HALFWAY_THERE: {
    id: 'halfway_there',
    title: 'Halfway There',
    description: 'Reach 50% of your savings goal',
    icon: '⚡',
    points: 50
  },
  SUPER_SAVER: {
    id: 'super_saver',
    title: 'Super Saver',
    description: 'Add a weekly amount that is 50% above your average',
    icon: '🦸',
    points: 15
  },
  MULTI_GOAL_MASTER: {
    id: 'multi_goal_master',
    title: 'Multi-Goal Master',
    description: 'Create 3 or more savings goals',
    icon: '🎯',
    points: 30
  },
  GOAL_COMPLETE: {
    id: 'goal_complete',
    title: 'Goal Complete!',
    description: 'Reach 100% of a savings goal',
    icon: '🏆',
    points: 100
  }
};

class AchievementManager {
  constructor() {
    this.STORAGE_KEY = 'gt3_tracker_achievements';
    this.POINTS_KEY = 'gt3_tracker_achievement_points';
  }

  /**
   * Initialize the achievement manager by loading achieved items from localStorage
   */
  initialize() {
    // Initialize achievements if not exist
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
      localStorage.setItem(this.POINTS_KEY, '0');
    }
  }

  /**
   * Get all available achievements
   * @returns {Object} - All achievement definitions
   */
  getAchievements() {
    return ACHIEVEMENTS;
  }

  /**
   * Get the achievements the user has earned
   * @returns {Object} - Map of earned achievement IDs to timestamp earned
   */
  getEarnedAchievements() {
    try {
      const earned = localStorage.getItem(this.STORAGE_KEY);
      return earned ? JSON.parse(earned) : {};
    } catch (error) {
      console.error('Error parsing earned achievements:', error);
      return {};
    }
  }

  /**
   * Get the user's total achievement points
   * @returns {number} - Total points
   */
  getTotalPoints() {
    try {
      const points = localStorage.getItem(this.POINTS_KEY);
      return points ? parseInt(points, 10) : 0;
    } catch (error) {
      console.error('Error parsing achievement points:', error);
      return 0;
    }
  }

  /**
   * Check if a specific achievement has been earned
   * @param {string} achievementId - ID of the achievement to check
   * @returns {boolean} - Whether the achievement has been earned
   */
  hasEarnedAchievement(achievementId) {
    const earned = this.getEarnedAchievements();
    return !!earned[achievementId];
  }

  /**
   * Award an achievement to the user
   * @param {string} achievementId - ID of the achievement to award
   * @returns {boolean} - Whether the operation was successful
   */
  awardAchievement(achievementId) {
    // Check if the achievement exists
    if (!ACHIEVEMENTS[achievementId]) {
      console.error(`Achievement ${achievementId} not found`);
      return false;
    }

    // Check if already earned
    if (this.hasEarnedAchievement(achievementId)) {
      return false;
    }

    try {
      // Update earned achievements
      const earned = this.getEarnedAchievements();
      earned[achievementId] = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(earned));

      // Update points
      const currentPoints = this.getTotalPoints();
      const newPoints = currentPoints + ACHIEVEMENTS[achievementId].points;
      localStorage.setItem(this.POINTS_KEY, newPoints.toString());

      // Show notification
      this.showAchievementNotification(achievementId);
      return true;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }

  /**
   * Show a toast notification for a newly earned achievement
   * @param {string} achievementId - ID of the achievement
   */
  showAchievementNotification(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    
    toast.success(
      <div>
        <div><strong>Achievement Unlocked!</strong></div>
        <div>{achievement.icon} {achievement.title}</div>
        <div>+{achievement.points} points</div>
      </div>,
      {
        duration: 5000,
        style: {
          backgroundColor: '#4c1d95',
          color: 'white',
          border: '1px solid #6d28d9'
        },
        iconTheme: {
          primary: '#fbbf24',
          secondary: '#4c1d95'
        }
      }
    );
  }

  /**
   * Check and award achievements based on app data
   * @param {Object} data - App data to check against
   */
  checkForAchievements(data) {
    const { goals, activeGoal, weeks } = data;
    
    // Early Bird - Set first goal
    if (goals && goals.length > 0) {
      this.awardAchievement('EARLY_BIRD');
    }
    
    // First Deposit - Record first savings
    if (weeks && weeks.length > 0 && weeks.some(week => week.profit > 0)) {
      this.awardAchievement('FIRST_DEPOSIT');
    }
    
    // Consistent Saver - 4 consecutive weeks
    if (weeks && weeks.length >= 4) {
      let consecutiveWeeks = 0;
      for (let i = 0; i < weeks.length; i++) {
        if (weeks[i].profit > 0) {
          consecutiveWeeks++;
          if (consecutiveWeeks >= 4) {
            this.awardAchievement('CONSISTENT_SAVER');
            break;
          }
        } else {
          consecutiveWeeks = 0;
        }
      }
    }
    
    // Check progress-based achievements
    if (activeGoal && activeGoal.target) {
      const totalSaved = weeks?.reduce((sum, week) => sum + (week.profit || 0), 0) || 0;
      const percentage = (totalSaved / activeGoal.target) * 100;
      
      // Big Milestone - 25%
      if (percentage >= 25) {
        this.awardAchievement('BIG_MILESTONE');
      }
      
      // Halfway There - 50%
      if (percentage >= 50) {
        this.awardAchievement('HALFWAY_THERE');
      }
      
      // Goal Complete - 100%
      if (percentage >= 100) {
        this.awardAchievement('GOAL_COMPLETE');
      }
    }
    
    // Super Saver - 50% above average
    if (weeks && weeks.length > 1) {
      const profits = weeks.map(week => week.profit || 0).filter(profit => profit > 0);
      if (profits.length > 1) {
        const average = profits.reduce((sum, profit) => sum + profit, 0) / profits.length;
        const lastProfit = profits[profits.length - 1];
        
        if (lastProfit >= average * 1.5) {
          this.awardAchievement('SUPER_SAVER');
        }
      }
    }
    
    // Multi-Goal Master - 3+ goals
    if (goals && goals.length >= 3) {
      this.awardAchievement('MULTI_GOAL_MASTER');
    }
  }
}

// Create a singleton instance
const achievementManager = new AchievementManager();
export default achievementManager; 