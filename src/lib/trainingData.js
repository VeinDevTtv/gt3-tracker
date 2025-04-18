/**
 * trainingData.js
 * Sample data for training the custom AI assistant
 */

// Sample responses for different intents
export const responseTemplates = {
  greeting: [
    "Hello! I'm your GT3 Savings Assistant. How can I help you today?",
    "Hi there! I'm here to help you reach your savings goal. What would you like to know?",
    "Welcome back! How can I assist with your savings journey today?",
    "Hello! Need any insights about your savings progress?"
  ],
  
  progress: [
    "You've saved {{totalSaved}} so far, which is {{percentComplete}}% of your goal. Keep up the good work!",
    "Currently, you've saved {{totalSaved}} toward your {{goalName}}. That's {{percentComplete}}% of your target!",
    "You're making progress! So far you've saved {{totalSaved}} ({{percentComplete}}% of your goal).",
    "Your savings journey is {{percentComplete}}% complete with {{totalSaved}} saved toward your {{goalName}}."
  ],
  
  timeToGoal: [
    "Based on your current savings rate, you should reach your goal by {{predictedCompletion}}.",
    "At your current pace, you're on track to reach your target around {{predictedCompletion}}.",
    "If you continue saving at this rate, expect to reach your goal by {{predictedCompletion}}.",
    "Your {{goalName}} fund should be complete by {{predictedCompletion}} if you maintain your current savings rate."
  ],
  
  savingsTips: [
    "Consider setting up automatic transfers to your savings account each payday.",
    "Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
    "Look for regular expenses you can reduce, like subscription services you don't use much.",
    "Challenge yourself to a 'no-spend' weekend once a month and transfer the savings.",
    "Round up your daily purchases to the nearest dollar and save the difference.",
    "Set up a separate account for your {{goalName}} fund to avoid temptation.",
    "Track all your expenses for a month to identify areas where you can cut back.",
    "Try meal planning to reduce food costs and save more consistently.",
    "Consider a side hustle to accelerate your progress toward your {{goalName}}.",
    "Celebrate small milestones to stay motivated on your savings journey."
  ],
  
  weeklyTarget: [
    "To reach your {{goalName}} goal on schedule, aim to save {{weeklyTarget}} each week.",
    "Your weekly savings target is {{weeklyTarget}} to stay on track.",
    "To hit your goal by your target date, try to save {{weeklyTarget}} weekly.",
    "I recommend saving {{weeklyTarget}} per week to reach your {{goalName}} goal on time."
  ],
  
  congratulations: [
    "Great job this week! You've saved {{weeklyAmount}}, which is {{comparison}} your weekly target.",
    "Excellent work! Your {{currentStreak}} week saving streak is impressive. Keep it up!",
    "Congratulations on reaching the {{milestone}} milestone! You're making excellent progress.",
    "You've now saved {{percentComplete}}% of your goal! That's a significant achievement."
  ],
  
  encouragement: [
    "I noticed you missed a week. Don't worry - stay consistent moving forward.",
    "Small steps add up! Even saving a little each week will help you reach your goal.",
    "Remember why you're saving for your {{goalName}}. Keeping your goal in mind helps motivation.",
    "This week was below target, but consistency matters more than perfect weeks."
  ]
};

// Sample training examples for intent classification
export const intentExamples = {
  greeting: [
    "hello",
    "hi there",
    "hey",
    "good morning",
    "hi assistant",
    "hello there",
    "greetings",
    "howdy"
  ],
  
  savingProgress: [
    "how am I doing?",
    "what's my progress?",
    "how much have I saved?",
    "show me my progress",
    "how far along am I?",
    "what percentage of my goal have I reached?",
    "how much money have I saved so far?",
    "what's my savings status?"
  ],
  
  timeRemaining: [
    "when will I reach my goal?",
    "how long until I can buy my car?",
    "how many more weeks until I'm done?",
    "when will I have enough saved?",
    "estimated completion date?",
    "how much longer until I reach my target?",
    "time remaining until goal completion?",
    "when will I finish saving?"
  ],
  
  advice: [
    "any saving tips?",
    "how can I save more?",
    "give me some advice",
    "help me save faster",
    "what should I do to reach my goal sooner?",
    "financial advice please",
    "suggestions for saving more",
    "tips for increasing my savings"
  ],
  
  weeklyTarget: [
    "what's my weekly target?",
    "how much should I save each week?",
    "weekly savings goal?",
    "what amount should I save per week?",
    "how much do I need to save weekly?",
    "what's my weekly savings amount?",
    "weekly saving target?",
    "how much per week to reach my goal?"
  ]
};

// Sample tips based on different saving patterns
export const savingTips = {
  inconsistent: [
    "Setting up automatic transfers can help maintain consistency in your savings.",
    "Try setting a reminder on your phone for your weekly savings deposit.",
    "Consider using a savings app that rounds up purchases and saves the difference.",
    "Breaking your weekly target into daily amounts might make it easier to stay consistent."
  ],
  
  belowTarget: [
    "Look for one subscription service you could pause temporarily.",
    "Try a no-spend challenge for a weekend to boost your savings.",
    "Consider meal planning to reduce food expenses.",
    "Track all expenses for a week to identify potential savings opportunities."
  ],
  
  goodProgress: [
    "You're doing great! Consider increasing your weekly target by 5-10%.",
    "Have you thought about setting up a separate high-yield savings account?",
    "Consider setting milestone rewards to keep your motivation high.",
    "You're on track - remember to reassess your goal periodically."
  ],
  
  recentSetback: [
    "One setback doesn't erase your progress. Just get back on track this week.",
    "Consider setting aside a small emergency fund to handle unexpected expenses.",
    "Try the 24-hour rule before non-essential purchases to avoid impulse spending.",
    "Look at your budget categories to see if you can adjust to make up the difference."
  ]
};

// Sample insights based on saving patterns
export const insightPatterns = {
  consistentSaver: {
    pattern: "User has saved consistently for 4+ weeks",
    insights: [
      "Your consistency is impressive! Consistent savers are 65% more likely to reach their goals.",
      "Your saving streak shows strong commitment to your goal.",
      "Maintaining consistent weekly savings is one of the best predictors of success."
    ]
  },
  
  increasingTrend: {
    pattern: "User's savings amounts have increased over the past 3+ weeks",
    insights: [
      "I've noticed you're saving more each week - that's excellent progress!",
      "Your increasing savings rate could help you reach your goal {{weeksSooner}} weeks sooner.",
      "Your upward savings trend is putting you ahead of schedule."
    ]
  },
  
  approaching50Percent: {
    pattern: "User is between 45-55% of their goal",
    insights: [
      "You're approaching the halfway point! This is a great milestone.",
      "You've saved almost half of your target - the momentum is on your side now.",
      "The halfway point is a great time to review and potentially increase your weekly target."
    ]
  },
  
  missedWeeks: {
    pattern: "User has 2+ weeks with $0 in the last month",
    insights: [
      "I've noticed some missed weeks recently. Setting up automatic transfers might help.",
      "Even small amounts during tough weeks help maintain your saving habit.",
      "Consider a more conservative weekly target that might be easier to maintain consistently."
    ]
  }
};

// Export all training data
export default {
  responseTemplates,
  intentExamples,
  savingTips,
  insightPatterns
}; 