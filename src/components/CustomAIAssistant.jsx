import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Lightbulb, Send, X, Maximize2, Minimize2 } from 'lucide-react';
import AIService from '../services/CustomAIService';
import { Skeleton } from './ui/skeleton';

const CustomAIAssistant = ({ 
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
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Initialize AI service
  useEffect(() => {
    const initService = async () => {
      setIsLoading(true);
      try {
        const userData = {
          weeks,
          goalName,
          target,
          totalProfit,
          remaining,
          progressPercentage,
          prediction,
          streakInfo,
          weeklyTargetAverage
        };
        
        await AIService.initialize(userData);
        
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: `👋 Hello! I'm your Savings Assistant. I can help you with:
- Understanding your savings progress
- Providing tips to reach your ${goalName} goal faster
- Answering questions about your savings data
- Suggesting weekly savings targets

How can I help you today?`
        }]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        setMessages([{
          role: 'assistant',
          content: 'Sorry, I had trouble initializing. Please try again later.'
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initService();
  }, [weeks, goalName, target, totalProfit, remaining, progressPercentage, prediction, streakInfo, weeklyTargetAverage]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await AIService.sendMessage(input);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Fixed position styles for the floating UI
  const floatingStyles = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    width: isCollapsed ? 'auto' : '350px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s ease',
    maxHeight: isCollapsed ? 'auto' : '500px'
  };
  
  // Collapsed button style
  const collapsedButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#2D3748' : '#FFF',
    color: theme === 'dark' ? '#FFF' : '#1A202C',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };
  
  return (
    <div style={floatingStyles}>
      {isCollapsed ? (
        <Button 
          onClick={toggleCollapse}
          style={collapsedButtonStyle}
          aria-label="Open AI Assistant"
        >
          <Lightbulb size={24} />
        </Button>
      ) : (
        <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} overflow-hidden`}>
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <div className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Savings Assistant
              </h3>
            </div>
            <div className="flex">
              <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8 p-0">
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8 p-0 ml-1">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent 
            className={`p-3 overflow-y-auto ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
            style={{ height: '300px', maxHeight: '300px' }}
          >
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 ${message.role === 'user' ? 'ml-auto text-right' : ''}`}
              >
                <div 
                  className={`inline-block rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap 
                    ${message.role === 'user' 
                      ? `${theme === 'dark' ? 'bg-primary text-white' : 'bg-primary/10 text-primary-foreground'}` 
                      : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}`
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-3">
                <div className={`inline-block rounded-lg px-3 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Skeleton className="h-4 w-[200px] mb-2" />
                  <Skeleton className="h-4 w-[170px]" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>
          
          <CardFooter className={`p-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex w-full gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isInitialized || isLoading}
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}
              />
              <Button 
                size="icon" 
                onClick={handleSend} 
                disabled={!isInitialized || isLoading || input.trim() === ''}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CustomAIAssistant; 