import { useState, useEffect } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import milestoneService from '../services/MilestoneService';

/**
 * Custom hook to provide combined savings progress data
 * @param {string} goalId - Optional goal ID (defaults to active goal)
 * @returns {Object} - Progress data and related functions
 */
const useSavingsProgress = (goalId = null) => {
  const { 
    goals, 
    activeGoal, 
    calculateProgress, 
    updateWeekData 
  } = useGoals();
  
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({ percentage: 0, saved: 0, remaining: 0, target: 0 });
  const [milestones, setMilestones] = useState([]);
  const [nextMilestone, setNextMilestone] = useState(null);
  
  // Get the current goal
  const currentGoal = goalId 
    ? goals.find(g => g.id === goalId)
    : activeGoal;
  
  // Debug state for troubleshooting
  const DEBUG = true;

  useEffect(() => {
    if (DEBUG) {
      console.log('useSavingsProgress state:', {
        goalId,
        activeGoal: activeGoal ? { id: activeGoal.id, name: activeGoal.name } : null,
        goalsCount: goals ? goals.length : 0,
        currentGoal: currentGoal ? { id: currentGoal.id, name: currentGoal.name } : null
      });
    }
  
    if (!currentGoal) {
      if (DEBUG) console.log('useSavingsProgress: No current goal found');
      setIsLoading(false);
      return;
    }
    
    console.log('useSavingsProgress: Goal changed, updating progress data', currentGoal.id);
    
    try {
      // Initialize the milestone service if needed
      milestoneService.initialize();
      
      // Calculate progress for the current goal
      const progressData = calculateProgress(currentGoal.id);
      setProgress(progressData);
      
      // Get milestones for the goal
      const goalMilestones = milestoneService.getMilestonesForGoal(currentGoal.id);
      
      // Create default milestones if none exist
      if (!goalMilestones || goalMilestones.length === 0) {
        console.log('No milestones found, creating defaults for goal:', currentGoal.id);
        milestoneService.createDefaultMilestones(currentGoal.id, currentGoal.target);
        // Get the newly created milestones
        const newMilestones = milestoneService.getMilestonesForGoal(currentGoal.id);
        setMilestones(newMilestones);
      } else {
        // Sort milestones by amount
        const sortedMilestones = [...goalMilestones].sort((a, b) => a.amount - b.amount);
        setMilestones(sortedMilestones);
      }
      
      // Find the next milestone to reach
      const totalSaved = progressData.totalSaved || 0;
      const milesToCheck = milestones.length > 0 ? milestones : goalMilestones;
      const upcoming = milesToCheck
        .filter(m => m.amount > totalSaved)
        .sort((a, b) => a.amount - b.amount)[0];
      
      setNextMilestone(upcoming || null);
      setIsLoading(false);
    } catch (err) {
      console.error('Error in useSavingsProgress:', err);
      setIsLoading(false);
    }
  }, [currentGoal, calculateProgress, goals, activeGoal]);
  
  /**
   * Add a savings entry and update progress
   * @param {Object} entryData - Entry data with profit, date, notes
   * @returns {Promise<boolean>} - Success status
   */
  const addSavingsEntry = async (entryData) => {
    if (!currentGoal) return false;
    
    try {
      // Find the next week number if not provided
      const weeks = currentGoal.weeks || [];
      const weekNum = entryData.week || (Math.max(0, ...weeks.map(w => w.week)) + 1);
      
      // Set isFilled based on profit value
      const isFilled = parseFloat(entryData.profit) !== 0;
      
      // Update the week data in the goal
      const success = await updateWeekData(
        currentGoal.id, 
        weekNum - 1, 
        entryData.profit,
        {
          date: entryData.date,
          notes: entryData.notes,
          isFilled: isFilled
        }
      );
      
      return success;
    } catch (err) {
      console.error('Error adding savings entry:', err);
      return false;
    }
  };
  
  /**
   * Check if a specific milestone percentage has been reached
   * @param {number} percentage - Milestone percentage to check
   * @returns {boolean} - Whether milestone is reached
   */
  const isMilestoneReached = (percentage) => {
    if (!currentGoal || !progress) return false;
    return progress.percentage >= percentage;
  };
  
  /**
   * Get milestones grouped by status (achieved/upcoming)
   * @returns {Object} - Object with achieved and upcoming milestones
   */
  const getMilestonesByStatus = () => {
    return {
      achieved: milestones.filter(m => m.achieved),
      upcoming: milestones.filter(m => !m.achieved)
    };
  };
  
  return {
    isLoading,
    goal: currentGoal,
    progress,
    milestones,
    nextMilestone,
    addSavingsEntry,
    isMilestoneReached,
    getMilestonesByStatus
  };
};

export default useSavingsProgress; 