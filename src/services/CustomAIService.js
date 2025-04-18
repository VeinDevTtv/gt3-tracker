/**
 * CustomAIService.js
 * A custom AI assistant implementation that doesn't rely on external APIs
 */

import { classifyIntent, extractEntities, IntentTypes } from '../lib/intentClassifier';
import { generateResponse, generateComplexResponse } from '../lib/responseGenerator';
import {
  analyzeTrends,
  calculateStatistics,
  generateInsights,
  estimateTimeToCompletion,
  generateSavingTips
} from '../lib/dataAnalyzer';
import nluUtils from '../lib/nluUtils';
import trainingData from '../lib/trainingData';

class CustomAIService {
  constructor() {
    this.initialized = false;
    this.trainingData = null;
    this.intents = null;
    this.responses = null;
    this.context = null;
  }

  /**
   * Initialize the AI service with user's financial data context
   */
  async initialize(userData) {
    if (this.initialized && this.context) return true;
    
    try {
      // Load sample training data
      this.trainingData = trainingData;
      this.intents = trainingData.intentExamples;
      this.responses = trainingData.responseTemplates;
      
      // Store user data as context
      this.context = {
        goalName: userData.goalName,
        target: userData.target.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        totalSaved: userData.totalProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        percentComplete: userData.progressPercentage.toFixed(2),
        remaining: userData.remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        weeksWithData: userData.weeks.filter(week => week.profit > 0).length,
        totalWeeks: userData.weeks.length,
        weeklyAverage: userData.weeks.filter(week => week.profit > 0).length > 0 
          ? (userData.weeks.reduce((sum, week) => sum + week.profit, 0) / 
             userData.weeks.filter(week => week.profit > 0).length)
            .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
          : '$0',
        currentStreak: userData.streakInfo.currentStreak,
        bestStreak: userData.streakInfo.bestStreak,
        weeklyTarget: userData.weeklyTargetAverage.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        recentPerformance: userData.weeks.slice(-4).map(week => ({ 
          week: week.week, 
          amount: week.profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
        }))
      };
      
      // Check if prediction data exists and format it
      if (userData.prediction) {
        if (userData.prediction.insufficient) {
          this.context.predictedCompletion = userData.prediction.message || "Insufficient data";
        } else {
          this.context.predictedCompletion = `${userData.prediction.targetDate} (${userData.prediction.confidence} confidence, based on ${userData.prediction.dataPoints} weeks of data)`;
        }
      } else {
        this.context.predictedCompletion = "Not enough data yet";
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize CustomAIService:', error);
      return false;
    }
  }

  /**
   * Send a message to the AI and get a response
   * This is the main method called from the assistant component
   */
  async sendMessage(message) {
    if (!this.initialized || !this.context) {
      throw new Error('AI service not initialized');
    }
    
    return this.processMessage(message, this.context);
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(message, context, history = []) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // 1. Preprocess and classify intent
      const cleaned = nluUtils.preprocessText(message);
      const intentResult = classifyIntent(cleaned);
      const intentName = intentResult.name;

      // 2. Extract entities
      const entities = extractEntities(message);

      // 3. Generate a response based on intent
      let responseText = '';
      switch (intentName) {
        case IntentTypes.GREETING:
          responseText = generateResponse(IntentTypes.GREETING, context);
          break;

        case IntentTypes.SAVING_PROGRESS:
          responseText = generateResponse(IntentTypes.SAVING_PROGRESS, context);
          break;

        case IntentTypes.TIME_REMAINING: {
          // Estimate completion date
          const numeric = {
            target: parseFloat(context.target.replace(/[^\d.-]/g, '')),
            totalSaved: parseFloat(context.totalSaved.replace(/[^\d.-]/g, '')),
            weeklyAverage: parseFloat(context.weeklyAverage.replace(/[^\d.-]/g, ''))
          };
          const eta = estimateTimeToCompletion(numeric);
          context.predictedCompletion = eta.estimatedDate;
          responseText = generateResponse(IntentTypes.TIME_REMAINING, context);
          break;
        }

        case IntentTypes.ADVICE: {
          // Pull personalized tips
          const tips = generateSavingTips({
            percentComplete: parseFloat(context.percentComplete),
            currentStreak: context.currentStreak
          });
          responseText = `Here are some savings tips:\n${tips.map(t => `• ${t}`).join('\n')}`;
          break;
        }

        case IntentTypes.WEEKLY_TARGET:
          responseText = generateResponse(IntentTypes.WEEKLY_TARGET, context);
          break;

        case IntentTypes.PREDICTION: {
          // Predict next-week savings based on recentPerformance
          const nums = (context.recentPerformance || []).map(w =>
            parseFloat(w.amount.replace(/[^\d.-]/g, ''))
          );
          const pred = this.predictFuturePerformance(nums);
          context.nextWeekPrediction = `$${pred.nextWeekPrediction.toLocaleString()}`;
          responseText = generateResponse(IntentTypes.PREDICTION, context);
          break;
        }

        case IntentTypes.HELP:
          responseText = generateResponse(IntentTypes.HELP, context);
          break;

        default:
          responseText = generateResponse('unknown', context);
      }

      return responseText;
    } catch (error) {
      console.error('Error processing message:', error);
      return 'I encountered an error while processing your message. Please try again.';
    }
  }

  /**
   * Analyze financial data to generate insights
   */
  analyzeFinancialData(data) {
    return {
      trends: analyzeTrends(data.weeks),
      stats: calculateStatistics(data.weeks),
      insights: generateInsights(data),
      eta: estimateTimeToCompletion(data)
    };
  }

  /**
   * Generate a single savings tip
   */
  generateSavingsTip(context) {
    const tips = generateSavingTips(context);
    return tips.length
      ? tips[Math.floor(Math.random() * tips.length)]
      : 'Consider reviewing your budget categories for additional savings.';
  }

  /**
   * Predict future performance based on historical weekly data
   */
  predictFuturePerformance(weeks) {
    const nums = Array.isArray(weeks) ? weeks.filter(n => !isNaN(n)) : [];
    if (!nums.length) {
      return { nextWeekPrediction: 0, confidence: 'low' };
    }
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return {
      nextWeekPrediction: parseFloat(avg.toFixed(2)),
      confidence: 'medium'
    };
  }
}

// Create and export a singleton instance
const customAIService = new CustomAIService();
export default customAIService; 