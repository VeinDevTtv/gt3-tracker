import { toast } from 'react-hot-toast';
import { 
  Trophy, Award, Star, Target, Calendar, Clock, Zap, 
  TrendingUp, FileText, Activity, Sunrise, BarChart2, 
  Shield, Gift, Rocket, Medal, Clipboard, CheckCircle 
} from 'lucide-react';

class AchievementManager {
  constructor() {
    this.achievements = {
      // Getting Started Achievements
      "first-save": {
        id: "first-save",
        title: "First Save",
        description: "Make your first contribution towards your goal",
        icon: "💰",
        category: "starter",
        points: 10,
        condition: (state) => state.weeks.some(week => week.profit > 0)
      },
      "profile-setup": {
        id: "profile-setup",
        title: "Profile Complete",
        description: "Update your profile picture and username",
        icon: "👤",
        category: "starter",
        points: 15,
        condition: (state) => state.currentUser && state.currentUser.username && state.currentUser.profilePicture
      },
      "goal-defined": {
        id: "goal-defined",
        title: "Goal Setter",
        description: "Set a specific savings goal and target amount",
        icon: "🎯",
        category: "starter",
        points: 15,
        condition: (state) => state.goalName && state.target && state.target > 0
      },
      
      // Milestone Achievements
      "25-percent": {
        id: "25-percent",
        title: "Quarter Way",
        description: "Reach 25% of your savings goal",
        icon: "🔔",
        category: "milestone",
        points: 25,
        condition: (state) => (state.totalProfit / state.target) * 100 >= 25
      },
      "50-percent": {
        id: "50-percent",
        title: "Halfway Hero",
        description: "Reach 50% of your savings goal",
        icon: "🔔🔔",
        category: "milestone",
        points: 50,
        condition: (state) => (state.totalProfit / state.target) * 100 >= 50
      },
      "75-percent": {
        id: "75-percent",
        title: "Three-Quarter Champion",
        description: "Reach 75% of your savings goal",
        icon: "🔔🔔🔔",
        category: "milestone",
        points: 75,
        condition: (state) => (state.totalProfit / state.target) * 100 >= 75
      },
      "goal-reached": {
        id: "goal-reached",
        title: "Goal Achieved",
        description: "Congratulations! You've reached 100% of your savings goal",
        icon: "🏆",
        category: "milestone",
        points: 100,
        condition: (state) => state.totalProfit >= state.target
      },
      "goal-exceeded": {
        id: "goal-exceeded",
        title: "Overachiever",
        description: "Exceed your savings goal by 25% or more",
        icon: "🚀",
        category: "milestone",
        points: 150,
        condition: (state) => state.totalProfit >= state.target * 1.25
      },
      
      // Consistency Achievements
      "first-streak": {
        id: "first-streak",
        title: "Streak Starter",
        description: "Achieve a 3-week savings streak",
        icon: "🔥",
        category: "consistency",
        points: 30,
        condition: (state) => state.streakInfo && state.streakInfo.currentStreak >= 3
      },
      "steady-saver": {
        id: "steady-saver",
        title: "Steady Saver",
        description: "Achieve a 5-week savings streak",
        icon: "🔥🔥",
        category: "consistency",
        points: 50,
        condition: (state) => state.streakInfo && state.streakInfo.currentStreak >= 5
      },
      "savings-master": {
        id: "savings-master",
        title: "Savings Master",
        description: "Achieve a 10-week savings streak",
        icon: "🔥🔥🔥",
        category: "consistency",
        points: 100,
        condition: (state) => state.streakInfo && state.streakInfo.currentStreak >= 10
      },
      "consistency-king": {
        id: "consistency-king",
        title: "Consistency King",
        description: "Save more than your weekly target for 4 consecutive weeks",
        icon: "👑",
        category: "consistency",
        points: 75,
        condition: (state) => {
          if (!state.weeks || state.weeks.length < 4) return false;
          const weeklyTarget = state.target / state.totalWeeks;
          const lastFourWeeks = state.weeks.slice(-4);
          return lastFourWeeks.every(week => week.profit > weeklyTarget);
        }
      },
      
      // Amount Based Achievements
      "big-saver": {
        id: "big-saver",
        title: "Big Saver",
        description: "Save double your weekly target in a single week",
        icon: "💸",
        category: "amount",
        points: 40,
        condition: (state) => {
          if (!state.weeks || state.weeks.length === 0) return false;
          const weeklyTarget = state.target / state.totalWeeks;
          return state.weeks.some(week => week.profit >= weeklyTarget * 2);
        }
      },
      "mega-deposit": {
        id: "mega-deposit",
        title: "Mega Deposit",
        description: "Make a deposit that's at least 3x your weekly target",
        icon: "🏦",
        category: "amount",
        points: 60,
        condition: (state) => {
          if (!state.weeks || state.weeks.length === 0) return false;
          const weeklyTarget = state.target / state.totalWeeks;
          return state.weeks.some(week => week.profit >= weeklyTarget * 3);
        }
      },
      "grand-deposit": {
        id: "grand-deposit",
        title: "Grand Deposit",
        description: "Make a deposit that's at least 5x your weekly target",
        icon: "💎",
        category: "amount",
        points: 100,
        condition: (state) => {
          if (!state.weeks || state.weeks.length === 0) return false;
          const weeklyTarget = state.target / state.totalWeeks;
          return state.weeks.some(week => week.profit >= weeklyTarget * 5);
        }
      },
      
      // Tools & Features Achievements
      "first-export": {
        id: "first-export",
        title: "Data Exporter",
        description: "Export your savings data for the first time",
        icon: "📤",
        category: "tools",
        points: 20,
        // This one will be manually triggered by the export function
      },
      "first-import": {
        id: "first-import",
        title: "Data Importer",
        description: "Import savings data from a backup",
        icon: "📥",
        category: "tools",
        points: 20,
        // This one will be manually triggered by the import function
      },
      "first-report": {
        id: "first-report",
        title: "Report Generator",
        description: "Generate your first PDF report",
        icon: "📊",
        category: "tools",
        points: 25,
        // This one will be manually triggered by the generateReport function
      },
      "ai-assistant": {
        id: "ai-assistant",
        title: "AI Explorer",
        description: "Use the AI assistant feature to get insights",
        icon: "🤖",
        category: "tools",
        points: 30,
        // This one will be manually triggered by the AI assistant
      },
      
      // Time Based Achievements
      "one-month": {
        id: "one-month",
        title: "One Month Milestone",
        description: "Track your savings for one month",
        icon: "📅",
        category: "time",
        points: 30,
        condition: (state) => {
          if (!state.startDate) return false;
          const start = new Date(state.startDate);
          const now = new Date();
          const diffTime = Math.abs(now - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 30;
        }
      },
      "three-months": {
        id: "three-months",
        title: "Quarterly Milestone",
        description: "Track your savings for three months",
        icon: "📅📅",
        category: "time",
        points: 60,
        condition: (state) => {
          if (!state.startDate) return false;
          const start = new Date(state.startDate);
          const now = new Date();
          const diffTime = Math.abs(now - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 90;
        }
      },
      "six-months": {
        id: "six-months",
        title: "Half-Year Dedication",
        description: "Track your savings for six months",
        icon: "📅📅📅",
        category: "time",
        points: 100,
        condition: (state) => {
          if (!state.startDate) return false;
          const start = new Date(state.startDate);
          const now = new Date();
          const diffTime = Math.abs(now - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 180;
        }
      },
      
      // Special Achievements
      "night-owl": {
        id: "night-owl",
        title: "Night Owl",
        description: "Log a savings entry after midnight",
        icon: "🦉",
        category: "special",
        points: 15,
        // This one will be manually triggered when an entry is made after midnight
      },
      "early-bird": {
        id: "early-bird",
        title: "Early Bird",
        description: "Log a savings entry before 7 AM",
        icon: "🐦",
        category: "special",
        points: 15,
        // This one will be manually triggered when an entry is made before 7 AM
      },
      "weekday-warrior": {
        id: "weekday-warrior",
        title: "Weekday Warrior",
        description: "Log savings entries for 5 consecutive weekdays",
        icon: "💼",
        category: "special",
        points: 40,
        // This requires tracking date patterns which would need additional logic
      },
      "weekend-saver": {
        id: "weekend-saver",
        title: "Weekend Saver",
        description: "Log savings entries for 3 consecutive weekends",
        icon: "🏖️",
        category: "special",
        points: 30,
        // This requires tracking date patterns which would need additional logic
      },
      
      // Multiple Goals Achievements (can be added when multi-goal support is implemented)
      "multi-goal-starter": {
        id: "multi-goal-starter",
        title: "Multi-Goal Starter",
        description: "Create your second savings goal",
        icon: "🔄",
        category: "multi-goal",
        points: 25,
        // This will be handled when multi-goal feature is implemented
      },
      "goal-collector": {
        id: "goal-collector",
        title: "Goal Collector",
        description: "Have three active savings goals",
        icon: "📚",
        category: "multi-goal",
        points: 50,
        // This will be handled when multi-goal feature is implemented
      }
    };
  }
  
  // Get all achievements
  getAchievements() {
    return this.achievements;
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
      const earned = localStorage.getItem('earnedAchievements');
      return earned ? JSON.parse(earned) : {};
    } catch (error) {
      console.error('Error getting earned achievements:', error);
      return {};
    }
  }
  
  // Save earned achievements to localStorage
  saveEarnedAchievements(earnedAchievements) {
    try {
      localStorage.setItem('earnedAchievements', JSON.stringify(earnedAchievements));
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
  checkAchievements(state) {
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

// Create and export a singleton instance
const achievementManager = new AchievementManager();
export default achievementManager; 