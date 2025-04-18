import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

// Create the context
const GoalsContext = createContext();

// Custom hook to use the context
export const useGoals = () => {
  return useContext(GoalsContext);
};

// Predefined milestones for achievements
const DEFAULT_MILESTONES = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 250000];

// Default goal templates
const GOAL_TEMPLATES = [
  {
    name: "Porsche 911 GT3",
    target: 280000,
    image: "https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png",
    color: "blue"
  },
  {
    name: "Porsche 911 GT3 RS",
    target: 350000,
    image: "https://files.porsche.com/filestore/image/multimedia/none/992-gt3-rs-modelimage-sideshot/model/c33efe8d-03c9-11ed-80f5-005056bbdc38/porsche-model.png",
    color: "green"
  },
  {
    name: "Porsche 911 Turbo S",
    target: 360000,
    image: "https://files.porsche.com/filestore/image/multimedia/none/992-tu-s-modelimage-sideshot/model/7bd19860-0a14-11ea-80c6-005056bbdc38/porsche-model.png",
    color: "red"
  }
];

// For creating initial weeks for a new goal
const createInitialWeeks = (numberOfWeeks) => {
  return Array.from({ length: numberOfWeeks }, (_, i) => ({
    week: i + 1,
    profit: 0,
    cumulative: 0,
  }));
};

// Provider component
export const GoalsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [currentGoalId, setCurrentGoalId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the current goal object
  const currentGoal = goals.find(goal => goal.id === currentGoalId) || null;

  // Load goals from localStorage on component mount
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem('goals');
      const savedCurrentGoalId = localStorage.getItem('currentGoalId');
      
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
        
        // If there are goals but no current goal ID, set the first goal as current
        if (parsedGoals.length > 0) {
          if (savedCurrentGoalId && parsedGoals.some(g => g.id === savedCurrentGoalId)) {
            setCurrentGoalId(savedCurrentGoalId);
          } else {
            setCurrentGoalId(parsedGoals[0].id);
          }
        }
      } else {
        // Initialize with a default goal if no goals exist
        const defaultGoal = createDefaultGoal();
        setGoals([defaultGoal]);
        setCurrentGoalId(defaultGoal.id);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
      const defaultGoal = createDefaultGoal();
      setGoals([defaultGoal]);
      setCurrentGoalId(defaultGoal.id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('goals', JSON.stringify(goals));
      if (currentGoalId) {
        localStorage.setItem('currentGoalId', currentGoalId);
      }
    }
  }, [goals, currentGoalId, isLoading]);

  // Create a default goal
  const createDefaultGoal = () => {
    return {
      id: uuidv4(),
      goalName: 'Porsche 911 GT3',
      target: 200000,
      startDate: new Date().toISOString(),
      weeks: [
        {
          weekNumber: 1,
          profit: 0,
          cumulative: 0,
          date: new Date().toISOString()
        }
      ],
      notes: '',
      lastMilestone: 0
    };
  };

  // Add a new goal
  const addGoal = (goalData) => {
    try {
      const newGoal = {
        id: uuidv4(),
        goalName: goalData.goalName || 'New Goal',
        target: parseFloat(goalData.target) || 0,
        startDate: new Date().toISOString(),
        weeks: [
          {
            weekNumber: 1,
            profit: 0,
            cumulative: 0,
            date: new Date().toISOString()
          }
        ],
        notes: '',
        lastMilestone: 0
      };
      
      setGoals(prevGoals => [...prevGoals, newGoal]);
      setCurrentGoalId(newGoal.id);
      toast.success(`Goal "${newGoal.goalName}" created successfully`);
      return true;
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to create goal');
      return false;
    }
  };

  // Update an existing goal
  const updateGoal = (id, updates) => {
    try {
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === id 
            ? { ...goal, ...updates } 
            : goal
        )
      );
      toast.success('Goal updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
      return false;
    }
  };

  // Delete a goal
  const deleteGoal = (id) => {
    try {
      // Prevent deleting the last goal
      if (goals.length <= 1) {
        toast.error('Cannot delete the only goal. Create a new goal first.');
        return false;
      }

      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      
      // If the current goal is deleted, switch to another goal
      if (currentGoalId === id) {
        const nextGoal = goals.find(goal => goal.id !== id);
        if (nextGoal) {
          setCurrentGoalId(nextGoal.id);
        }
      }
      
      toast.success('Goal deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
      return false;
    }
  };

  // Switch to a different goal
  const switchGoal = (id) => {
    if (goals.some(goal => goal.id === id)) {
      setCurrentGoalId(id);
      return true;
    }
    return false;
  };

  // Duplicate a goal
  const duplicateGoal = (id) => {
    try {
      const goalToDuplicate = goals.find(goal => goal.id === id);
      if (!goalToDuplicate) {
        toast.error('Goal not found');
        return false;
      }

      const duplicatedGoal = {
        ...goalToDuplicate,
        id: uuidv4(),
        goalName: `${goalToDuplicate.goalName} (Copy)`,
      };

      setGoals(prevGoals => [...prevGoals, duplicatedGoal]);
      setCurrentGoalId(duplicatedGoal.id);
      toast.success(`Goal "${duplicatedGoal.goalName}" created as a copy`);
      return true;
    } catch (error) {
      console.error('Error duplicating goal:', error);
      toast.error('Failed to duplicate goal');
      return false;
    }
  };

  // Import a goal from JSON
  const importGoal = (jsonData) => {
    try {
      // Validate the JSON data
      if (!jsonData.goalName || !jsonData.target) {
        toast.error('Invalid goal data: Missing required fields');
        return false;
      }

      // Create a new goal from the imported data
      const newGoal = {
        id: uuidv4(),
        goalName: jsonData.goalName,
        target: parseFloat(jsonData.target),
        startDate: jsonData.startDate || new Date().toISOString(),
        weeks: jsonData.weeks || [
          {
            weekNumber: 1,
            profit: 0,
            cumulative: 0,
            date: new Date().toISOString()
          }
        ],
        notes: jsonData.notes || '',
        lastMilestone: jsonData.lastMilestone || 0
      };

      setGoals(prevGoals => [...prevGoals, newGoal]);
      setCurrentGoalId(newGoal.id);
      toast.success(`Goal "${newGoal.goalName}" imported successfully`);
      return true;
    } catch (error) {
      console.error('Error importing goal:', error);
      toast.error('Failed to import goal');
      return false;
    }
  };

  // Update the current goal's week data
  const updateWeekData = (weekNumber, profit) => {
    if (!currentGoal) return false;

    try {
      const newWeeks = [...currentGoal.weeks];
      const weekIndex = newWeeks.findIndex(w => w.weekNumber === weekNumber);
      
      if (weekIndex === -1) {
        // Week doesn't exist, add it
        newWeeks.push({
          weekNumber,
          profit,
          cumulative: 0, // Will be recalculated below
          date: new Date().toISOString()
        });
        
        // Sort weeks by week number
        newWeeks.sort((a, b) => a.weekNumber - b.weekNumber);
      } else {
        // Update existing week
        newWeeks[weekIndex] = {
          ...newWeeks[weekIndex],
          profit
        };
      }
      
      // Recalculate cumulative values
      for (let i = 0; i < newWeeks.length; i++) {
        newWeeks[i].cumulative = (i > 0 ? newWeeks[i-1].cumulative : 0) + (newWeeks[i].profit || 0);
      }
      
      // Update the goal with new weeks data
      updateGoal(currentGoalId, { weeks: newWeeks });
      return true;
    } catch (error) {
      console.error('Error updating week data:', error);
      toast.error('Failed to update week data');
      return false;
    }
  };

  // Context value
  const value = {
    goals,
    currentGoal,
    currentGoalId,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    switchGoal,
    duplicateGoal,
    importGoal,
    updateWeekData
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

export default GoalsContext; 