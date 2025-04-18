/**
 * responseGenerator.js
 * Generate appropriate responses based on user intent and financial context
 */

import { IntentTypes } from './intentClassifier';

// Templates for responses based on intent
const RESPONSE_TEMPLATES = {
  [IntentTypes.GREETING]: [
    "Hello! How can I help with your savings journey?",
    "Hi there! Need any insights about your savings goal?",
    "Hey! I'm here to help you track your progress towards your {{goalName}}."
  ],
  
  [IntentTypes.SAVING_PROGRESS]: [
    "You've saved {{totalSaved}} so far, which is {{percentComplete}} of your {{goalName}} goal. You still need {{remaining}} to reach your target.",
    "You're making good progress! So far you've accumulated {{totalSaved}} ({{percentComplete}} of your goal). Keep it up!",
    "Currently, you've saved {{totalSaved}} towards your {{goalName}}. You're {{percentComplete}} of the way to your target of {{target}}."
  ],
  
  [IntentTypes.TIME_REMAINING]: [
    "Based on your current savings rate, you're on track to reach your {{goalName}} goal by {{predictedCompletion}}.",
    "If you continue saving at this rate, you should have your {{goalName}} around {{predictedCompletion}}.",
    "Your {{goalName}} goal should be reached by {{predictedCompletion}} if you maintain your current savings pattern."
  ],
  
  [IntentTypes.ADVICE]: [
    "To reach your goal faster, try increasing your weekly savings by 10%. This could get you to your {{goalName}} {{timeAdvantage}} sooner.",
    "Based on your saving pattern, setting aside just $50 more each week could significantly speed up reaching your {{goalName}} goal.",
    "Consider automating your savings to maintain consistency. Your current streak is {{currentStreak}} weeks - keeping this going is key to success!"
  ],
  
  [IntentTypes.WEEKLY_TARGET]: [
    "To reach your {{goalName}} goal on schedule, aim to save {{weeklyTarget}} each week.",
    "Your weekly target is {{weeklyTarget}} to stay on track for your {{goalName}} goal.",
    "Based on your timeline, you should be saving {{weeklyTarget}} per week to reach your {{target}} target."
  ],
  
  [IntentTypes.PREDICTION]: [
    "Looking at your saving history, I predict you'll save around {{nextMonthPrediction}} next month.",
    "Based on your past {{weeksWithData}} weeks of data, your savings might be {{futurePrediction}} in the coming weeks.",
    "Your saving trend suggests you might reach {{percentPrediction}}% of your goal within the next {{timeFrame}} weeks."
  ],
  
  [IntentTypes.HELP]: [
    "I can help with: checking your progress, predicting completion dates, suggesting saving tips, calculating weekly targets, and analyzing your saving trends. Just ask!",
    "You can ask me about your savings progress, how long until you reach your goal, advice for saving more efficiently, or your weekly savings target.",
    "I'm your savings assistant! Ask about your progress, predictions, weekly targets, or request savings advice."
  ],
  
  // Default responses for unknown intents
  unknown: [
    "I'm not sure I understand. You can ask about your savings progress, goal timeline, or request advice.",
    "Could you phrase that differently? I can help with savings progress, predictions, and financial advice.",
    "I didn't quite catch that. Try asking about your progress, weekly targets, or when you'll reach your goal."
  ]
};

/**
 * Fill a template with context data
 * @param {string} template - Template string with {{placeholders}}
 * @param {object} context - Context data to fill the template
 * @returns {string} - Filled template
 */
export function fillTemplate(template, context) {
  // IMPLEMENT:
  // Replace all {{placeholders}} with actual values from context
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

/**
 * Generate a response based on intent and context
 * @param {string} intent - The classified intent
 * @param {object} context - Financial context data
 * @returns {string} - Generated response
 */
export function generateResponse(intent, context) {
  // IMPLEMENT:
  // 1. Get appropriate templates for the intent
  // 2. Select a template (random or based on context)
  // 3. Fill the template with context data
  // 4. Return the filled response
  
  // Get templates for the intent or use unknown intent templates
  const templates = RESPONSE_TEMPLATES[intent] || RESPONSE_TEMPLATES.unknown;
  
  // Randomly select a template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Fill in the template with context data
  return fillTemplate(template, context);
}

/**
 * Generate a complex response that may contain multiple elements
 * @param {string} intent - The classified intent
 * @param {object} context - Financial context data
 * @param {object} entities - Extracted entities from the message
 * @returns {string} - Generated complex response
 */
export function generateComplexResponse(intent, context, entities = {}) {
  // IMPLEMENT:
  // 1. Handle special cases based on intent and entities
  // 2. Combine multiple response elements when appropriate
  // 3. Add additional context-sensitive information
  
  // Placeholder for implementation
  return generateResponse(intent, context);
}

export default {
  generateResponse,
  generateComplexResponse,
  fillTemplate
}; 