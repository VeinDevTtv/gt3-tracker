import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { SendHorizontal, BrainCircuit, Bug } from 'lucide-react';
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
  const [debugMode, setDebugMode] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

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
    setErrorDetails('');
    
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
      
      if (debugMode) console.log('Sending request to OpenAI with messages:', [systemMessage, ...messages, userMessage]);

      // Send to OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, ...messages, userMessage],
        temperature: 0.7,
        max_tokens: 250
      });
      
      if (debugMode) console.log('Received response from OpenAI:', response);
      
      // Add OpenAI's response
      const assistantMessage = { 
        role: 'assistant', 
        content: response.choices[0].message.content 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting OpenAI response:', error);
      
      // Store detailed error for debug mode
      setErrorDetails(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Provide more specific error messages
      let errorMessage = 'Sorry, I encountered an error. Please check your API key or try again later.';
      
      if (error.message?.includes('401')) {
        errorMessage = 'Invalid API key. Please check that you\'ve entered a valid OpenAI API key.';
      } else if (error.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded. Your account has reached its API request limit or has insufficient quota.';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'CORS error detected. This may be due to browser security restrictions.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      if (debugMode) {
        errorMessage += ` (Error: ${error.message})`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, apiKey, messages, createAIContext, goalName, debugMode]);

  return (
    <div className={`rounded-lg p-5 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
          <h2 className="text-xl font-bold">AI Assistant</h2>
        </div>
        <button 
          onClick={() => setDebugMode(!debugMode)} 
          className={`text-xs p-1 rounded ${debugMode ? 'bg-yellow-200 text-yellow-800' : 'text-gray-400 hover:text-gray-600'}`}
          title="Toggle debug mode"
        >
          <Bug size={16} />
        </button>
      </div>
      
      {showApiKeyInput ? (
        <div className="mb-4">
          <p className="text-sm mb-2">Enter your OpenAI API key to enable the AI assistant:</p>
          <div className="flex gap-2">
            <input
              type="password"
              className={`flex-1 p-2 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <Button onClick={handleApiKeySave} disabled={!apiKey.trim()}>Save</Button>
          </div>
          <p className="text-xs mt-2 text-gray-500">Your key is stored locally and never sent to our servers.</p>
        </div>
      ) : (
        <>
          <div 
            className={`h-64 overflow-y-auto mb-4 p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>Ask me anything about your savings!</p>
                <p className="text-sm mt-2">Examples:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>"How am I doing with my savings?"</li>
                  <li>"What's my current streak?"</li>
                  <li>"When will I reach my goal?"</li>
                  <li>"What should my weekly target be?"</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-3 p-2 rounded ${
                    msg.role === 'user' 
                      ? theme === 'dark' ? 'bg-blue-800 ml-8' : 'bg-blue-100 ml-8' 
                      : theme === 'dark' ? 'bg-gray-600 mr-8' : 'bg-white mr-8 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))
            )}
            {isLoading && (
              <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600 mr-8' : 'bg-white mr-8 shadow-sm'}`}>
                <div className="flex space-x-2 justify-center items-center h-6">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'} animation-delay-200`}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600'} animation-delay-400`}></div>
                </div>
              </div>
            )}
            {debugMode && errorDetails && (
              <div className="mt-3 p-2 text-xs bg-red-100 text-red-800 rounded overflow-auto max-h-24">
                <strong>Debug Error:</strong>
                <pre>{errorDetails}</pre>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              className={`flex-1 p-2 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your savings..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading || !apiKey}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isLoading || !apiKey}
              title="Send message"
            >
              <SendHorizontal size={18} />
            </Button>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <button 
              onClick={() => setShowApiKeyInput(true)}
              className="text-xs text-blue-500 hover:underline"
            >
              Change API key
            </button>
            <span className="text-xs text-gray-500">Powered by OpenAI</span>
          </div>
        </>
      )}
    </div>
  );
}