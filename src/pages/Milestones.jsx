import React, { useEffect, useState } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import milestoneService from '../services/MilestoneService';
import MilestoneProgressMap from '../components/milestones/MilestoneProgressMap';
import MilestoneForm from '../components/milestones/MilestoneForm';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

/**
 * MilestonesPage - Displays the milestone progress map and milestone management UI
 */
const MilestonesPage = () => {
  const { activeGoal, calculateProgress } = useGoals();
  const [milestones, setMilestones] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // Load milestones for the active goal
  useEffect(() => {
    const loadMilestones = () => {
      setIsLoading(true);
      if (!activeGoal) {
        setMilestones([]);
        setIsLoading(false);
        return;
      }

      let goalMilestones = milestoneService.getMilestonesForGoal(activeGoal.id);

      // If no milestones exist, create defaults based on the goal target
      if (goalMilestones.length === 0) {
        goalMilestones = milestoneService.createDefaultMilestones(
          activeGoal.id,
          activeGoal.target
        );
      }

      // Check milestone status based on current progress
      const progress = calculateProgress(activeGoal.id);
      if (progress && progress.total > 0) {
        const newlyAchievedMilestone = milestoneService.checkMilestones(
          activeGoal.id,
          progress.total
        );

        // Show confetti and toast if a milestone was just achieved
        if (newlyAchievedMilestone) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
            toast.success(
              `🎉 Milestone achieved: ${newlyAchievedMilestone.title}`,
              { duration: 5000 }
            );
          }, 500);
        }
      }

      setMilestones(goalMilestones);
      setIsLoading(false);
    };

    loadMilestones();
  }, [activeGoal, calculateProgress]);

  // Handle milestone creation
  const handleAddMilestone = (milestoneData) => {
    if (!activeGoal) return;

    const newMilestone = milestoneService.addMilestone(
      activeGoal.id,
      milestoneData
    );

    if (newMilestone) {
      // Check if the milestone is already achieved based on current progress
      const progress = calculateProgress(activeGoal.id);
      if (progress && progress.total >= newMilestone.amount) {
        milestoneService.updateMilestone(activeGoal.id, newMilestone.id, {
          achieved: true,
          achievedDate: new Date().toISOString()
        });
      }

      setMilestones(milestoneService.getMilestonesForGoal(activeGoal.id));
      toast.success('Milestone added successfully!');
      setShowAddForm(false);
    } else {
      toast.error('Failed to add milestone');
    }
  };

  // Handle milestone update
  const handleUpdateMilestone = (milestoneId, updates) => {
    if (!activeGoal) return;

    const updatedMilestone = milestoneService.updateMilestone(
      activeGoal.id,
      milestoneId,
      updates
    );

    if (updatedMilestone) {
      setMilestones(milestoneService.getMilestonesForGoal(activeGoal.id));
      toast.success('Milestone updated successfully!');
      setEditingMilestone(null);
    } else {
      toast.error('Failed to update milestone');
    }
  };

  // Handle milestone deletion
  const handleDeleteMilestone = (milestoneId) => {
    if (!activeGoal) return;

    const success = milestoneService.deleteMilestone(activeGoal.id, milestoneId);

    if (success) {
      setMilestones(milestoneService.getMilestonesForGoal(activeGoal.id));
      toast.success('Milestone deleted successfully!');
    } else {
      toast.error('Failed to delete milestone');
    }
  };

  // Handle milestone editing
  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setShowAddForm(true);
  };

  // Handle form cancellation
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingMilestone(null);
  };

  // Calculate progress for the progress bar
  const currentProgress = activeGoal
    ? calculateProgress(activeGoal.id)
    : { percentage: 0, total: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 dark:text-white">Milestone Progress Map</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your journey to owning a Porsche GT3 through custom milestones
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingMilestone(null);
            setShowAddForm(!showAddForm);
          }}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Milestone'}
        </button>
      </div>

      {!activeGoal ? (
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Please create a goal first to track milestones
          </p>
        </div>
      ) : isLoading ? (
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading milestones...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {showAddForm && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <MilestoneForm
                onSubmit={editingMilestone ? handleUpdateMilestone.bind(null, editingMilestone.id) : handleAddMilestone}
                onCancel={handleCancelForm}
                initialData={editingMilestone}
                goalTarget={activeGoal.target}
                currentTotal={currentProgress.total}
              />
            </div>
          )}
          
          <MilestoneProgressMap
            milestones={milestones}
            currentAmount={currentProgress.total}
            targetAmount={activeGoal.target}
            onEditMilestone={handleEditMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        </div>
      )}
    </div>
  );
};

export default MilestonesPage; 