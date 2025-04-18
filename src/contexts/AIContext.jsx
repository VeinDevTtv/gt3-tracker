import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customAIService from '../services/CustomAIService';

// Create the AI context
const AIContext = createContext(null);

// Hook to use the AI context
export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

// AI Context Provider component
export function AIProvider({ children }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ai-assistant-messages');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'Hello! I\'m your GT3 Savings Assistant. How can I help you today?' }
    ];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(() => 
    localStorage.getItem('ai-assistant-collapsed') === 'true'
  );

  // Initialize the AI service
  useEffect(() => {
    async function initAI(userData) {
      try {
        const success = await customAIService.initialize(userData || {});
        setIsInitialized(success);
        if (!success) {
          setAiError('Failed to initialize AI assistant');
        }
      } catch (error) {
        console.error('Error initializing AI:', error);
        setAiError('Error initializing AI assistant');
      }
    }
    
    // We don't have user data here, but the CustomAIAssistant component 
    // will initialize the service with the correct data when it mounts
    initAI();
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ai-assistant-messages', JSON.stringify(messages));
  }, [messages]);
  
  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('ai-assistant-collapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Process a user message and get a response
  const sendMessage = useCallback(async (message, context) => {
    if (!message.trim()) return;
    
    // IMPLEMENT:
    // 1. Add the user message to the messages array
    // 2. Set loading state
    // 3. Process the message with the AI service
    // 4. Add the AI response to the messages array
    // 5. Clear loading state
    
    // Add user message
    const newMessages = [
      ...messages,
      { role: 'user', content: message }
    ];
    setMessages(newMessages);
    setIsLoading(true);
    
    try {
      // Process with AI service
      const response = await customAIService.processMessage(message, context, messages);
      
      // Add AI response
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error processing message:', error);
      setAiError('Error processing your message');
      
      // Add error message
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error processing your message. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    setMessages([
      { role: 'assistant', content: 'Hello! I\'m your GT3 Savings Assistant. How can I help you today?' }
    ]);
  }, []);

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Context value
  const value = {
    messages,
    isLoading,
    isInitialized,
    aiError,
    isCollapsed,
    sendMessage,
    clearConversation,
    toggleCollapsed
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export default AIContext; 