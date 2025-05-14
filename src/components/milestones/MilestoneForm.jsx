import React, { useState, useEffect } from 'react';

// Icon options for milestones
const ICON_OPTIONS = [
  '🏁', '🛞', '🔧', '⚙️', '🚗', '🏎️', '💰', '🎯', '🏆',
  '🎉', '💎', '🔑', '🚀', '📈', '🎊', '🤑', '🏅'
];

/**
 * MilestoneForm - Form for adding or editing milestones
 */
const MilestoneForm = ({ onSubmit, onCancel, initialData, goalTarget, currentTotal }) => {
  // State for form fields
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [icon, setIcon] = useState('🏁');
  const [errorMessage, setErrorMessage] = useState('');
  const [showIconSelector, setShowIconSelector] = useState(false);

  // Populate form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount);
      setPercentage(initialData.percentage);
      setTitle(initialData.title);
      setDescription(initialData.description);
      setReward(initialData.reward);
      setIcon(initialData.icon);
    }
  }, [initialData]);

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    
    if (value && goalTarget) {
      const newPercentage = (parseFloat(value) / goalTarget) * 100;
      setPercentage(newPercentage.toFixed(1));
    } else {
      setPercentage('');
    }
  };

  // Handle percentage change
  const handlePercentageChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPercentage(value);
    
    if (value && goalTarget) {
      const newAmount = (parseFloat(value) / 100) * goalTarget;
      setAmount(Math.round(newAmount));
    } else {
      setAmount('');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!amount || isNaN(parseFloat(amount))) {
      setErrorMessage('Please enter a valid amount');
      return;
    }
    
    if (!title.trim()) {
      setErrorMessage('Please enter a title');
      return;
    }
    
    const milestoneData = {
      amount: parseFloat(amount),
      percentage: parseFloat(percentage),
      title: title.trim(),
      description: description.trim(),
      reward: reward.trim(),
      icon
    };
    
    onSubmit(milestoneData);
    
    // Reset form if not editing
    if (!initialData) {
      setAmount('');
      setPercentage('');
      setTitle('');
      setDescription('');
      setReward('');
      setIcon('🏁');
    }
  };

  // Pre-calculate potential milestone amounts
  const suggestedAmounts = [];
  if (goalTarget) {
    const percentages = [10, 25, 50, 75, 90];
    for (const percent of percentages) {
      const suggestionAmount = Math.round((percent / 100) * goalTarget);
      suggestedAmounts.push({
        percentage: percent,
        amount: suggestionAmount
      });
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 dark:text-white">
        {initialData ? 'Edit Milestone' : 'Add New Milestone'}
      </h3>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Amount field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary"
                placeholder="Enter amount"
              />
            </div>
            
            {/* Show current progress against this amount */}
            {amount && currentTotal && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {currentTotal >= parseFloat(amount) ? (
                  <span className="text-green-600 dark:text-green-400">
                    This milestone has already been achieved!
                  </span>
                ) : (
                  <span>
                    You need {formatCurrency(parseFloat(amount) - currentTotal)} more to reach this milestone
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Percentage field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Percentage of Goal
            </label>
            <div className="relative">
              <input
                type="text"
                value={percentage}
                onChange={handlePercentageChange}
                className="w-full pl-4 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary"
                placeholder="Enter percentage"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">
                %
              </span>
            </div>
          </div>
          
          {/* Title field */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary"
              placeholder="e.g. First $10,000 Saved"
            />
          </div>
          
          {/* Description field */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary"
              placeholder="Describe this milestone"
              rows={2}
            />
          </div>
          
          {/* Reward field */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reward (Optional)
            </label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary"
              placeholder="e.g. Treat yourself to a nice dinner"
            />
          </div>
          
          {/* Icon selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconSelector(!showIconSelector)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-primary focus:border-primary flex items-center justify-between"
              >
                <span className="text-2xl">{icon}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">▼</span>
              </button>
              
              {showIconSelector && (
                <div className="absolute left-0 right-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
                  <div className="grid grid-cols-6 gap-2">
                    {ICON_OPTIONS.map((iconOption) => (
                      <button
                        key={iconOption}
                        type="button"
                        onClick={() => {
                          setIcon(iconOption);
                          setShowIconSelector(false);
                        }}
                        className={`w-10 h-10 flex items-center justify-center text-xl rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          icon === iconOption ? 'bg-gray-200 dark:bg-gray-700' : ''
                        }`}
                      >
                        {iconOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Suggested amounts */}
        {!initialData && suggestedAmounts.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suggested Milestones
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestedAmounts.map((suggestion) => (
                <button
                  key={suggestion.percentage}
                  type="button"
                  onClick={() => {
                    setAmount(suggestion.amount);
                    setPercentage(suggestion.percentage);
                    setTitle(`${suggestion.percentage}% Milestone`);
                  }}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                >
                  {suggestion.percentage}% ({formatCurrency(suggestion.amount)})
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Form buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
          >
            {initialData ? 'Update Milestone' : 'Add Milestone'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MilestoneForm; 