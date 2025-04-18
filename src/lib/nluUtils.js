/**
 * nluUtils.js
 * Utility functions for natural language understanding
 */

/**
 * Calculate similarity score between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
export function calculateSimilarity(str1, str2) {
  // IMPLEMENT:
  // Basic similarity calculation using Jaccard similarity or similar algorithm
  // This is a placeholder - implement a proper similarity algorithm
  
  // Convert strings to lowercase and split into words
  const words1 = str1.toLowerCase().split(/\W+/).filter(word => word.length > 0);
  const words2 = str2.toLowerCase().split(/\W+/).filter(word => word.length > 0);
  
  // Create sets of unique words
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  // Calculate intersection and union sizes
  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);
  
  // Jaccard similarity
  return intersection.size / union.size;
}

/**
 * Preprocess text for NLU processing
 * @param {string} text - Input text
 * @returns {string} - Preprocessed text
 */
export function preprocessText(text) {
  // IMPLEMENT:
  // 1. Convert to lowercase
  // 2. Remove punctuation
  // 3. Remove extra whitespace
  // 4. Optional: Stemming/lemmatization
  
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Remove extra whitespace
    .trim();
}

/**
 * Extract numbers from text
 * @param {string} text - Input text
 * @returns {array} - Array of extracted numbers
 */
export function extractNumbers(text) {
  // IMPLEMENT:
  // Extract all numbers (including currency values) from text
  
  const matches = text.match(/(\$\s*\d+(\.\d+)?|\d+(\.\d+)?)/g) || [];
  return matches.map(match => {
    // Remove currency symbols and parse as float
    return parseFloat(match.replace(/[^\d.]/g, ''));
  });
}

/**
 * Detect the sentiment of text
 * @param {string} text - Input text
 * @returns {object} - Sentiment score and label
 */
export function detectSentiment(text) {
  // IMPLEMENT:
  // Simple rule-based sentiment analysis
  // This is a placeholder - implement a proper sentiment analyzer
  
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'fantastic', 'wonderful', 
    'happy', 'glad', 'positive', 'nice', 'love', 'well', 'better', 'best', 
    'improve', 'improving', 'improved', 'success', 'successful', 'achieve',
    'accomplished', 'progress', 'goal', 'reached', 'milestone'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'poor', 'negative', 'sad', 
    'unhappy', 'disappointed', 'upset', 'fail', 'failure', 'failed', 
    'worse', 'worst', 'problem', 'difficult', 'hard', 'challenge', 'trouble'
  ];
  
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 0);
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++;
    if (negativeWords.includes(word)) negativeScore++;
  });
  
  const score = (positiveScore - negativeScore) / words.length;
  
  return {
    score,
    label: score > 0.05 ? 'positive' : score < -0.05 ? 'negative' : 'neutral'
  };
}

/**
 * Extract time-related entities from text
 * @param {string} text - Input text
 * @returns {array} - Array of time entities
 */
export function extractTimeEntities(text) {
  // IMPLEMENT:
  // Extract time-related entities (weeks, months, years)
  // This is a placeholder - implement proper time entity extraction
  
  const timePatterns = [
    { regex: /(\d+)\s*weeks?/i, unit: 'week' },
    { regex: /(\d+)\s*months?/i, unit: 'month' },
    { regex: /(\d+)\s*years?/i, unit: 'year' },
    { regex: /(\d+)\s*days?/i, unit: 'day' }
  ];
  
  const result = [];
  
  timePatterns.forEach(pattern => {
    const match = text.match(pattern.regex);
    if (match) {
      result.push({
        value: parseInt(match[1]),
        unit: pattern.unit
      });
    }
  });
  
  return result;
}

export default {
  calculateSimilarity,
  preprocessText,
  extractNumbers,
  detectSentiment,
  extractTimeEntities
}; 