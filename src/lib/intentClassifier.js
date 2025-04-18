/**
 * intentClassifier.js
 * Simple intent classification for the custom AI assistant
 */

import { preprocessText, extractNumbers, extractTimeEntities } from './nluUtils';

// Define known intents with example phrases and regex patterns
const INTENTS = {
  GREETING: {
    name: 'greeting',
    examples: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    regex: /^(hi|hello|hey|howdy|greetings|good\s(morning|afternoon|evening))/i
  },
  SAVING_PROGRESS: {
    name: 'savingProgress',
    examples: ['how am I doing', "what's my progress", 'how much have I saved', 'show my progress'],
    regex: /(how\s(am\si|much\shave\si)|what('|')s\s(my)?\s(progress|savings?))/i
  },
  TIME_REMAINING: {
    name: 'timeRemaining',
    examples: ['when will I reach my goal', 'how long until', 'time remaining'],
    regex: /(when\swill|how\slong\suntil|time\sremaining)/i
  },
  ADVICE: {
    name: 'advice',
    examples: ['give me advice', 'saving tips', 'financial advice'],
    regex: /(give\sme|any)\s((financial|saving)\s)?(advice|tips)/i
  },
  WEEKLY_TARGET: {
    name: 'weeklyTarget',
    examples: ['weekly target', 'how much should I save each week'],
    regex: /(weekly|per\sweek)\s(target|goal|amount)/i
  },
  PREDICTION: {
    name: 'prediction',
    examples: ['predict my savings', 'forecast savings'],
    regex: /(predict|forecast|estimate)\s.*(savings|progress)/i
  },
  HELP: {
    name: 'help',
    examples: ['help', 'what can you do', 'commands'],
    regex: /^(help|what\scan\syou\sdo|commands)/i
  }
};

/**
 * Find the most likely intent from a user message
 * @param {string} message - The user's message
 * @returns {object} - The identified intent or UNKNOWN
 */
export function classifyIntent(message) {
  const text = preprocessText(message);

  // 1. Try regex
  for (const { name, regex } of Object.values(INTENTS)) {
    if (regex.test(text)) {
      return { name, confidence: 0.9 };
    }
  }

  // 2. Fallback to example matching
  for (const { name, examples } of Object.values(INTENTS)) {
    for (const ex of examples) {
      if (text.includes(preprocessText(ex))) {
        return { name, confidence: 0.7 };
      }
    }
  }

  return { name: 'unknown', confidence: 0 };
}

/**
 * Extract entities from the user message
 * @param {string} message - The user's message
 * @returns {object} - Extracted entities
 */
export function extractEntities(message) {
  const numbers = extractNumbers(message);
  const times = extractTimeEntities(message);
  return { numbers, times };
}

// Export intents for use in other modules
export const IntentTypes = Object.fromEntries(
  Object.values(INTENTS).map(i => [i.name.toUpperCase(), i.name])
);

export default {
  classifyIntent,
  extractEntities,
  IntentTypes
}; 