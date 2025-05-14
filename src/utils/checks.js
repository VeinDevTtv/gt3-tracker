import goalManager from '../services/GoalManager';
import milestoneService from '../services/MilestoneService';

/**
 * Checks if the Goals system is properly set up and working
 * @returns {Object} Status object with results of various checks
 */
export const checkGoalsSystemStatus = () => {
  const results = {
    initialized: false,
    goalsExist: false,
    activeGoalSet: false,
    milestonesExist: false,
    weeklyEntriesExist: false,
    status: 'unknown'
  };

  try {
    // Initialize required services
    goalManager.initialize();
    milestoneService.initialize();
    results.initialized = true;

    // Check if goals exist
    const goals = goalManager.getGoals();
    results.goalsExist = goals && goals.length > 0;
    
    // Check if active goal is set
    const activeGoal = goalManager.getActiveGoal();
    results.activeGoalSet = !!activeGoal;
    
    // Check if milestones exist for the active goal
    if (activeGoal) {
      const milestones = milestoneService.getMilestonesForGoal(activeGoal.id);
      results.milestonesExist = milestones && milestones.length > 0;
      
      // Check if weekly entries exist
      const hasEntries = activeGoal.weeks && 
        activeGoal.weeks.some(week => week.profit > 0);
      results.weeklyEntriesExist = hasEntries;
    }
    
    // Determine overall status
    if (results.goalsExist && results.activeGoalSet) {
      results.status = 'operational';
    } else if (results.initialized) {
      results.status = 'initialized_but_empty';
    } else {
      results.status = 'failed_initialization';
    }

    console.log('Goals System Status:', results);
    return results;
  } catch (error) {
    console.error('Error checking Goals system status:', error);
    results.status = 'error';
    results.error = error.message;
    return results;
  }
};

/**
 * Checks if the MilestoneProgressMap component should render properly
 * @returns {boolean} True if the component should render properly
 */
export const checkMilestoneProgressMapRendering = () => {
  try {
    // Initialize services
    goalManager.initialize();
    milestoneService.initialize();
    
    // Get active goal
    const activeGoal = goalManager.getActiveGoal();
    if (!activeGoal) {
      console.log('MilestoneProgressMap check: No active goal.');
      return false;
    }
    
    // Get milestones for active goal
    const milestones = milestoneService.getMilestonesForGoal(activeGoal.id);
    const milestonesExist = milestones && milestones.length > 0;
    
    // Check if progress can be calculated
    const hasValidTarget = activeGoal.target && activeGoal.target > 0;
    
    const result = {
      activeGoalExists: !!activeGoal,
      milestonesExist,
      hasValidTarget,
      shouldRenderProperly: !!activeGoal && hasValidTarget
    };
    
    console.log('MilestoneProgressMap Rendering Check:', result);
    return result.shouldRenderProperly;
  } catch (error) {
    console.error('Error checking MilestoneProgressMap rendering:', error);
    return false;
  }
};

// Export properly to fix ESLint warning
const checksUtil = {
  checkGoalsSystemStatus,
  checkMilestoneProgressMapRendering
};

export default checksUtil; 