/**
 * responseGenerator.js
 * Generate appropriate responses based on user intent and financial context
 */

import { IntentTypes } from './intentClassifier';

// Templates for responses based on intent
const RESPONSE_TEMPLATES = {
  [IntentTypes.GREETING]: [
    "Hello! How can I help with your savings journey?",
    "Hi there! Need any insights about your savings goal?"
  ],
  [IntentTypes.SAVING_PROGRESS]: [
    "You've saved {{totalSaved}} so far, which is {{percentComplete}}% of your {{goalName}} goal. You still need {{remaining}}.",
    "Currently you've saved {{totalSaved}} ({{percentComplete}}%) of your {{goalName}}. Keep it up!",
    "Your progress is {{percentComplete}}% toward your {{goalName}} with {{totalSaved}} saved. You need {{remaining}} more to reach your goal.",
    "So far, you've accumulated {{totalSaved}} ({{percentComplete}}%) toward your {{goalName}}. Keep saving to reach the remaining {{remaining}}.",
    "You're making good progress! {{totalSaved}} saved so far, which is {{percentComplete}}% of your {{goalName}} goal. Just {{remaining}} to go!"
  ],
  [IntentTypes.TIME_REMAINING]: [
    "Based on your pace, you'll reach {{goalName}} by {{predictedCompletion}}.",
    "At this rate, expect to finish {{goalName}} around {{predictedCompletion}}."
  ],
  [IntentTypes.ADVICE]: [
    "Try automating your savings and celebrate every small milestone.",
    "Increasing your weekly deposit by 5% can shave weeks off your timeline."
  ],
  [IntentTypes.WEEKLY_TARGET]: [
    "To stay on track, save {{weeklyTarget}} each week for {{goalName}}.",
    "Your weekly goal is {{weeklyTarget}} to hit {{goalName}} on time."
  ],
  [IntentTypes.PREDICTION]: [
    "I predict around {{nextWeekPrediction}} saved next week based on your trend.",
    "Next week you might save approximately {{nextWeekPrediction}}."
  ],
  [IntentTypes.HELP]: [
    "I can show your progress, predict completion dates, give saving tips, or calculate weekly targets.",
    "Ask me about your savings progress, timeline, tips, or weekly goals!"
  ],
  unknown: [
    "Sorry, I didn't catch that. Try asking about your progress or tips for saving.",
    "I can help with savings progress, predictions, or advice. What would you like?"
  ]
};

/**
 * Fill a template with context data
 * @param {string} template - Template string with {{placeholders}}
 * @param {object} context - Context data to fill the template
 * @returns {string} - Filled template
 */
export function fillTemplate(template, context) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    context[key] !== undefined ? context[key] : `{{${key}}}`
  );
}

/**
 * Generate a response based on intent and context
 * @param {string} intent - The classified intent
 * @param {object} context - Financial context data
 * @returns {string} - Generated response
 */
export function generateResponse(intent, context) {
  const templates = RESPONSE_TEMPLATES[intent] || RESPONSE_TEMPLATES.unknown;
  const tmpl = templates[Math.floor(Math.random() * templates.length)];
  return fillTemplate(tmpl, context);
}

/**
 * Generate a complex response that may contain multiple elements
 * @param {string} intent - The classified intent
 * @param {object} context - Financial context data
 * @param {object} entities - Extracted entities from the message
 * @returns {string} - Generated complex response
 */
export function generateComplexResponse(intent, context, entities = {}) {
  // For now, just delegate to generateResponse
  return generateResponse(intent, context);
}

export default { generateResponse, generateComplexResponse, fillTemplate }; 