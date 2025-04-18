import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { 
  SendHorizontal, 
  BrainCircuit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Lightbulb
} from 'lucide-react';

export default function CustomAIAssistant({
  theme, 
  weeks, 
  goalName, 
  target, 
  totalProfit, 
  remaining, 
  progressPercentage, 
  prediction, 
  streakInfo,
  weeklyTargetAverage
}) {
  const { 
    messages, 
    isLoading, 
    isInitialized,
    aiError, 
    isCollapsed, 
    sendMessage, 
    clearConversation, 
    toggleCollapsed 
  } = useAI();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Create AI context data from props
  const createAIContext = useCallback(() => {
    // IMPLEMENT:
    // Format all the financial data into a context object for the AI
    
    // Format the prediction data for the AI
    let predictionInfo = "Not enough data yet";
    
    if (prediction) {
      if (prediction.insufficient) {
        predictionInfo = prediction.message || "Insufficient data";
      } else {
        predictionInfo = `${prediction.targetDate} (${prediction.confidence} confidence, based on ${prediction.dataPoints} weeks of data)`;
      }
    }
    
    return {
      goalName,
      target: target.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      totalSaved: totalProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      percentComplete: progressPercentage.toFixed(2),
      remaining: remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      weeksWithData: weeks.filter(week => week.profit > 0).length,
      totalWeeks: weeks.length,
      weeklyAverage: weeks.filter(week => week.profit > 0).length > 0 
        ? (weeks.reduce((sum, week) => sum + week.profit, 0) / weeks.filter(week => week.profit > 0).length).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        : '$0',
      currentStreak: streakInfo.currentStreak,
      bestStreak: streakInfo.bestStreak,
      predictedCompletion: predictionInfo,
      weeklyTarget: weeklyTargetAverage.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      recentPerformance: weeks.slice(-4).map(week => ({ 
        week: week.week, 
        amount: week.profit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
      }))
    };
  }, [
    goalName, 
    target, 
    totalProfit, 
    progressPercentage, 
    remaining, 
    weeks, 
    streakInfo, 
    prediction,
    weeklyTargetAverage
  ]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue, createAIContext());
      setInputValue('');
    }
  }, [inputValue, isLoading, sendMessage, createAIContext]);

  // Handle Enter key to send message
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // If collapsed, just show the expand button
  if (isCollapsed) {
    return (
      <div className={`fixed bottom-4 right-4 z-50`}>
        <Button 
          onClick={toggleCollapsed}
          size="sm"
          className={`rounded-full h-12 w-12 shadow-lg flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
        >
          <BrainCircuit className="h-5 w-5 text-primary-color" />
        </Button>
      </div>
    );
  }

  return (
    <Card 
      className={`fixed bottom-4 right-4 w-80 sm:w-96 shadow-xl z-50 overflow-hidden
        ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}
    >
      <CardHeader className={`flex flex-row items-center justify-between py-3 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <CardTitle className={`text-sm font-medium flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : ''
        }`}>
          <BrainCircuit className="h-4 w-4 text-primary-color" />
          GT3 AI Assistant
        </CardTitle>
        
        <div className="flex items-center gap-1">
          {aiError && (
            <div className="text-xs text-red-500 mr-2">
              {aiError}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={clearConversation}
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleCollapsed}
            title="Minimize"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={`p-0 h-80 overflow-auto ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white'
      }`}>
        <div className="flex flex-col">
          {/* Message bubbles */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } p-2`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? theme === 'dark'
                      ? 'bg-primary-color/90 text-white'
                      : 'bg-primary-color text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start p-2">
              <div
                className={`flex items-center gap-2 max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-100'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className={`p-2 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {!isInitialized ? (
          <div className={`w-full text-center py-2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Initializing AI assistant...
          </div>
        ) : (
          <div className="flex w-full items-center gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your savings..."
              ref={inputRef}
              className={`resize-none h-9 min-h-9 py-1.5 ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
              }`}
            />
            
            <Button
              size="icon"
              disabled={!inputValue.trim() || isLoading}
              onClick={handleSendMessage}
              className="h-9 w-9 shrink-0"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>

      {!isCollapsed && (
        <div className={`absolute top-0 right-12 -mt-8 ${
          theme === 'dark' ? 'text-white' : 'text-gray-700'
        }`}>
          {(weeks.length > 0 && totalProfit > 0) && (
            <div className="bg-primary-color/20 p-1.5 rounded-full flex items-center justify-center">
              <Lightbulb size={14} className="text-primary-color" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}; 