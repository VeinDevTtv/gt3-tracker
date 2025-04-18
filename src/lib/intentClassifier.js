/**
 * intentClassifier.js
 * Simple intent classification for the custom AI assistant
 */

// Define known intents with example phrases and regex patterns
const INTENTS = {
  GREETING: {
    name: 'greeting',
    examples: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    regex: /^(hi|hello|hey|howdy|greetings|good\s(morning|afternoon|evening))[\s\.,!]*$/i
  },
  SAVING_PROGRESS: {
    name: 'savingProgress',
    examples: ['how am I doing', 'what\'s my progress', 'how much have I saved', 'show my progress', 'savings progress'],
    regex: /^(how\s(am\si|is\smy|are\smy)|what\'?s\smy)\s(progress|saving|savings)|how\smuch\s(have\si|did\si)\ssave(d)?|show\s(me\s)?(my\s)?progress/i
  },
  TIME_REMAINING: {
    name: 'timeRemaining',
    examples: ['when will I reach my goal', 'how long until', 'time remaining', 'how much longer', 'completion date'],
    regex: /^(when\swill|how\slong\suntil|how\smuch\slonger|how\smany\sweeks|how\smany\smonths|completion\sdate)/i
  },
  ADVICE: {
    name: 'advice',
    examples: ['give me advice', 'how can I save more', 'saving tips', 'financial advice', 'suggestions'],
    regex: /^(give\sme|any|some|what)?\s?((financial|money|saving)\s)?(advice|tips|suggestions|ideas|help)/i
  },
  WEEKLY_TARGET: {
    name: 'weeklyTarget',
    examples: ['weekly target', 'how much should I save each week', 'weekly goal', 'weekly amount'],
    regex: /^(what\sis|what\'s|how\smuch\sis|tell\sme)?\s?(my)?\s?(weekly|monthly|per\sweek)\s(target|goal|saving|amount)/i
  },
  PREDICTION: {
    name: 'prediction',
    examples: ['predict my savings', 'future savings', 'how much will I save', 'savings forecast'],
    regex: /^(predict|forecast|project|estimate|calculate)\s(my|future|next|weekly)\s(savings|progress|amount)/i
  },
  HELP: {
    name: 'help',
    examples: ['help', 'what can you do', 'commands', 'features', 'assistance'],
    regex: /^(help|assist|what\scan\syou\sdo|how\sdo\syou\swork|commands|features)/i
  }
};

/**
 * Find the most likely intent from a user message
 * @param {string} message - The user's message
 * @returns {object} - The identified intent or UNKNOWN
 */
export function classifyIntent(message) {
  // IMPLEMENT:
  // 1. Preprocess the message (lowercase, remove punctuation)
  // 2. Check against regex patterns
  // 3. If no regex match, use more advanced classification
  // 4. Return matched intent or UNKNOWN

  // Simple implementation - expand this with your NLP logic
  const text = message.toLowerCase().trim();
  
  // Check regex patterns first (for quick matching)
  for (const intentKey in INTENTS) {
    const intent = INTENTS[intentKey];
    if (intent.regex.test(text)) {
      return { name: intent.name, confidence: 0.9 };
    }
  }
  
  // If no regex match, check for partial matches (examples)
  for (const intentKey in INTENTS) {
    const intent = INTENTS[intentKey];
    for (const example of intent.examples) {
      if (text.includes(example)) {
        return { name: intent.name, confidence: 0.7 };
      }
    }
  }
  
  // Return unknown intent if no match
  return { name: 'unknown', confidence: 0 };
}

/**
 * Extract entities from the user message
 * @param {string} message - The user's message
 * @returns {object} - Extracted entities
 */
export function extractEntities(message) {
  // IMPLEMENT:
  // 1. Extract numbers, dates, monetary values
  // 2. Extract specific entities like "week number" or "amount"
  // 3. Return structured entities
  
  return {};
}

// Export intents for use in other modules
export const IntentTypes = Object.fromEntries(
  Object.entries(INTENTS).map(([key, value]) => [key, value.name])
);

export default {
  classifyIntent,
  extractEntities,
  IntentTypes
}; 