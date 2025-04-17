import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { SendHorizontal, BrainCircuit } from 'lucide-react';
import { OpenAI } from 'openai';

// Create a configurable OpenAI client
const openai = new OpenAI({
  apiKey: '', // The user will need to provide their own API key
  dangerouslyAllowBrowser: true // This is for client-side usage
});

export default function AIAssistant({ 
  theme, 
  weeks, 
  goalName, 
  target, 
  totalProfit, 
  remaining, 
  progressPercentage, 
  prediction, 
  streakInfo 
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai-api-key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!localStorage.getItem('openai-api-key'));

  // Save API key to local storage
  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai-api-key', apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  // Format data for the AI
  const createAIContext = useCallback(() => {
    return {
      goalName,
      target: target.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      totalSaved: totalProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      percentComplete: progressPercentage.toFixed(2) + '%',
      remaining: remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      weeksWithData: weeks.filter(week => week.profit > 0).length,
      totalWeeks: weeks.length,
      weeklyAverage: weeks.filter(week => week.profit > 0).length > 0 
        ? (weeks.reduce((sum, week) => sum + week.profit, 0) / weeks.filter(week => week.profit > 0).length).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        : '$0',
      currentStreak: streakInfo.currentStreak,
      bestStreak: streakInfo.bestStreak,
      predictedCompletion: prediction ? prediction.targetDate : 'Not enough data',
      recentPerformance: weeks.slice(-4).map(week => ({ 
        week: week.week, 
        amount: week.profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
      }))
    };
  }, [goalName, target, totalProfit, progressPercentage, remaining, weeks, streakInfo, prediction]);

  // Send message to OpenAI
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !apiKey) return;
    
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Get context data
      const context = createAIContext();
      
      // Initialize OpenAI with user's API key
      openai.apiKey = apiKey;
      
      // Create system message with context
      const systemMessage = {
        role: 'system',
        content: `You are a helpful financial assistant for a savings tracker app. 
        The user is saving for a ${goalName}. Use this data to give personalized advice:
        Target: ${context.target}
        Total Saved: ${context.totalSaved}
        Progress: ${context.percentComplete}
        Remaining: ${context.remaining}
        Weeks with data: ${context.weeksWithData} out of ${context.totalWeeks}
        Weekly Average: ${context.weeklyAverage}
        Current Streak: ${context.currentStreak} weeks
        Best Streak: ${context.bestStreak} weeks
        Predicted goal completion: ${context.predictedCompletion}
        Recent performance (last 4 weeks): ${JSON.stringify(context.recentPerformance)}
        
        Keep responses concise and focused on their savings journey. Offer encouragement and practical advice.`
      };
      
      // Send message to OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [systemMessage, userMessage],
        max_tokens: 1000,
        n: 1,
        stop: null,
        temperature: 0.7,
      });
      
      // Update messages
      setMessages(prev => [...prev, response.choices[0].message]);
    } catch (error) {
      console.error('Error sending message to OpenAI:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, apiKey, createAIContext]);

  return (
    <div className="flex flex-col h-full">
      {/* Rest of the component code remains unchanged */}
    </div>
  );
}