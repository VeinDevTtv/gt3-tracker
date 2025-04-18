/**
 * dataAnalyzer.js
 * Analyze savings data to generate insights and trends
 */

import trainingData from './trainingData';

/**
 * Identify trends in weekly savings data
 * @param {array} weeks - Array of weekly savings data
 * @returns {object} - Trend information
 */
export function analyzeTrends(weeks) {
  if (!weeks || weeks.length < 2) {
    return { trend: 'insufficient', message: 'Not enough data to analyze trends.' };
  }
  const nums = weeks.map(w => w.profit).filter(n => !isNaN(n));
  const firstHalf = nums.slice(0, Math.floor(nums.length / 2));
  const secondHalf = nums.slice(Math.floor(nums.length / 2));
  const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (avg2 > avg1 * 1.05) {
    return { trend: 'increasing', message: 'Your savings are trending upward!' };
  } else if (avg2 < avg1 * 0.95) {
    return { trend: 'decreasing', message: 'Your savings rate is slowing down.' };
  }
  return { trend: 'stable', message: 'Your savings are relatively stable.' };
}

/**
 * Calculate savings statistics
 * @param {array} weeks - Array of weekly savings data
 * @returns {object} - Statistical analysis
 */
export function calculateStatistics(weeks) {
  const nums = weeks.map(w => w.profit).filter(n => !isNaN(n)).sort((a, b) => a - b);
  if (!nums.length) return { average: 0, median: 0, min: 0, max: 0 };
  const sum = nums.reduce((a, b) => a + b, 0);
  const avg = sum / nums.length;
  const median =
    nums.length % 2 === 1
      ? nums[(nums.length - 1) / 2]
      : (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2;
  return {
    average: parseFloat(avg.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    min: nums[0],
    max: nums[nums.length - 1]
  };
}

/**
 * Generate personalized insights based on savings data
 * @param {object} context - Financial context with user data
 * @returns {array} - Array of insight objects
 */
export function generateInsights(context) {
  const tips = trainingData.savingTips;
  if (context.percentComplete < 50) return tips.belowTarget;
  if (context.currentStreak >= 4) return tips.goodProgress;
  return tips.inconsistent;
}

/**
 * Estimate time to completion based on current saving rate
 * @param {object} context - Financial context
 * @returns {object} - Time estimation
 */
export function estimateTimeToCompletion(context) {
  // Parse numeric values if they're strings with currency formatting
  const target = typeof context.target === 'string' 
    ? parseFloat(context.target.replace(/[^\d.-]/g, '')) 
    : context.target;
    
  const totalSaved = typeof context.totalSaved === 'string'
    ? parseFloat(context.totalSaved.replace(/[^\d.-]/g, ''))
    : context.totalSaved;
    
  const weeklyAverage = typeof context.weeklyAverage === 'string'
    ? parseFloat(context.weeklyAverage.replace(/[^\d.-]/g, ''))
    : context.weeklyAverage;
  
  const remaining = target - totalSaved;
  
  if (!weeklyAverage || weeklyAverage <= 0) {
    return { 
      estimatedWeeks: 0, 
      estimatedDate: 'Unknown', 
      confidence: 'low',
      message: 'Need more data to estimate completion date'
    };
  }
  
  const weeks = Math.ceil(remaining / weeklyAverage);
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  
  return {
    estimatedWeeks: weeks,
    estimatedDate: d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    confidence: weeks < 10 ? 'high' : weeks < 20 ? 'medium' : 'low',
    message: null
  };
}

/**
 * Generate savings tips based on user's data and behavior
 * @param {object} context - Financial context
 * @returns {array} - Array of personalized saving tips
 */
export function generateSavingTips(context) {
  const tips = trainingData.savingTips;
  if (context.percentComplete < 50) return tips.belowTarget;
  if (context.percentComplete >= 80) return tips.goodProgress;
  return tips.inconsistent;
}

export default {
  analyzeTrends,
  calculateStatistics,
  generateInsights,
  estimateTimeToCompletion,
  generateSavingTips
}; 