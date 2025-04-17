import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { SendHorizontal, BrainCircuit, Bug, RefreshCw, Cpu } from 'lucide-react';
import { OpenAI } from 'openai';

// Create a configurable OpenAI client
const openai = new OpenAI({
  apiKey: '', // The user will need to provide their own API key
  dangerouslyAllowBrowser: true // This is for client-side usage
});

// API providers
const API_PROVIDERS = {
  OPENAI: 'openai',
  POE: 'poe',
  REPLICATE: 'replicate',
  OLLAMA: 'ollama'
};

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
  
  const [apiProvider, setApiProvider] = useState(
    localStorage.getItem('ai-assistant-provider') || API_PROVIDERS.OLLAMA
  );
  
  // OpenAI specific state
  const [openaiApiKey, setOpenaiApiKey] = useState(
    localStorage.getItem('openai-api-key') || ''
  );
  
  // Poe specific state
  const [poeApiKey, setPoeApiKey] = useState(
    localStorage.getItem('poe-api-key') || ''
  );

  // Replicate specific state  
  const [replicateApiKey, setReplicateApiKey] = useState(
    localStorage.getItem('replicate-api-key') || ''
  );
  
  // Ollama specific state
  const [ollamaHost, setOllamaHost] = useState(
    localStorage.getItem('ollama-host') || 'http://localhost:11434'
  );
  
  const [ollamaModel, setOllamaModel] = useState(
    localStorage.getItem('ollama-model') || 'llama3'
  );
  
  const [showApiKeyInput, setShowApiKeyInput] = useState(
    apiProvider === API_PROVIDERS.OPENAI 
      ? !localStorage.getItem('openai-api-key') 
      : apiProvider === API_PROVIDERS.POE 
        ? !localStorage.getItem('poe-api-key')
        : apiProvider === API_PROVIDERS.REPLICATE
          ? !localStorage.getItem('replicate-api-key')
          : !localStorage.getItem('ollama-host')
  );
  
  const [ollamaStatus, setOllamaStatus] = useState('unknown'); // 'unknown', 'running', 'error'
  const [debugMode, setDebugMode] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [showFreeAlternatives, setShowFreeAlternatives] = useState(false);

  // Check Ollama status when it's selected
  useEffect(() => {
    if (apiProvider === API_PROVIDERS.OLLAMA) {
      checkOllamaStatus();
    }
  }, [apiProvider, ollamaHost]);

  // Check if Ollama is running
  const checkOllamaStatus = async () => {
    try {
      const response = await fetch(`${ollamaHost}/api/tags`);
      if (response.ok) {
        setOllamaStatus('running');
        return true;
      } else {
        setOllamaStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      setOllamaStatus('error');
      return false;
    }
  };

  // Save API key/settings to local storage
  const handleApiKeySave = () => {
    if (apiProvider === API_PROVIDERS.OPENAI && openaiApiKey.trim()) {
      localStorage.setItem('openai-api-key', openaiApiKey.trim());
      setShowApiKeyInput(false);
    } else if (apiProvider === API_PROVIDERS.POE && poeApiKey.trim()) {
      localStorage.setItem('poe-api-key', poeApiKey.trim());
      setShowApiKeyInput(false);
    } else if (apiProvider === API_PROVIDERS.REPLICATE && replicateApiKey.trim()) {
      localStorage.setItem('replicate-api-key', replicateApiKey.trim());
      setShowApiKeyInput(false);
    } else if (apiProvider === API_PROVIDERS.OLLAMA) {
      localStorage.setItem('ollama-host', ollamaHost.trim());
      localStorage.setItem('ollama-model', ollamaModel.trim());
      setShowApiKeyInput(false);
      checkOllamaStatus();
    }
  };

  // Switch API provider
  const handleSwitchProvider = (newProvider) => {
    setApiProvider(newProvider);
    localStorage.setItem('ai-assistant-provider', newProvider);
    setShowApiKeyInput(
      newProvider === API_PROVIDERS.OPENAI 
        ? !localStorage.getItem('openai-api-key') 
        : newProvider === API_PROVIDERS.POE
          ? !localStorage.getItem('poe-api-key')
          : newProvider === API_PROVIDERS.REPLICATE
            ? !localStorage.getItem('replicate-api-key')
            : !localStorage.getItem('ollama-host')
    );
    
    if (newProvider === API_PROVIDERS.OLLAMA) {
      checkOllamaStatus();
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

  // Send message to Ollama
  const sendMessageToOllama = async (userMessage, context) => {
    if (!ollamaHost.trim()) throw new Error('Ollama host is required');
    if (!ollamaModel.trim()) throw new Error('Ollama model is required');

    // Create a context message
    const prompt = `You are a helpful financial assistant for a savings tracker app. 
The user is saving for a ${context.goalName}. Here's their current data:
- Target: ${context.target}
- Total Saved: ${context.totalSaved} (${context.percentComplete} complete)
- Remaining: ${context.remaining}
- Tracking for ${context.weeksWithData} out of ${context.totalWeeks} weeks
- Average weekly saving: ${context.weeklyAverage}
- Current streak: ${context.currentStreak} weeks
- Best streak: ${context.bestStreak} weeks
- Estimated completion date: ${context.predictedCompletion}
- Recent 4 weeks: ${JSON.stringify(context.recentPerformance)}

Please provide concise, helpful advice about their savings journey based on this data. 
Be encouraging and practical.

User question: ${userMessage}`;

    if (debugMode) console.log('Sending request to Ollama with prompt:', prompt);

    // Using Ollama API
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (debugMode) console.log('Received response from Ollama:', data);
    
    // Extract just the response text
    return data.response;
  };

  // Make a request to Replicate API
  const sendMessageToReplicate = async (userMessage, context) => {
    const apiKey = replicateApiKey.trim();
    if (!apiKey) throw new Error('Replicate API key is required');

    // Create a context message
    const prompt = `You are a helpful financial assistant for a savings tracker app. 
The user is saving for a ${context.goalName}. Here's their current data:
- Target: ${context.target}
- Total Saved: ${context.totalSaved} (${context.percentComplete} complete)
- Remaining: ${context.remaining}
- Tracking for ${context.weeksWithData} out of ${context.totalWeeks} weeks
- Average weekly saving: ${context.weeklyAverage}
- Current streak: ${context.currentStreak} weeks
- Best streak: ${context.bestStreak} weeks
- Estimated completion date: ${context.predictedCompletion}
- Recent 4 weeks: ${JSON.stringify(context.recentPerformance)}

Please provide concise, helpful advice about their savings journey based on this data. 
Be encouraging and practical.

User question: ${userMessage}`;

    if (debugMode) console.log('Sending request to Replicate with prompt:', prompt);

    // Using Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: "meta/llama-4-scout-instruct",
        input: {
          prompt: prompt,
          max_tokens: 250,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Replicate API error: ${response.status} ${response.statusText} - ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    // Get the prediction ID from the response
    const prediction = await response.json();
    
    if (debugMode) console.log('Prediction created:', prediction);
    
    // Poll for the prediction result
    let result = null;
    while (!result || result.status === 'processing' || result.status === 'starting') {
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!pollResponse.ok) {
        const errorData = await pollResponse.json().catch(() => ({}));
        throw new Error(`Replicate API polling error: ${pollResponse.status} ${pollResponse.statusText} - ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
      
      result = await pollResponse.json();
      
      if (result.status === 'succeeded') {
        break;
      } else if (result.status === 'failed') {
        throw new Error(`Replicate model execution failed: ${result.error || 'Unknown error'}`);
      }
      
      // Wait for 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (debugMode) console.log('Received response from Replicate:', result);
    
    // Extract the output from the result
    // Replicate returns an array of strings for streaming outputs
    const output = Array.isArray(result.output) ? result.output.join('') : result.output;
    return output;
  };

  // Make a request to Poe API
  const sendMessageToPoe = async (userMessage, context) => {
    const apiKey = poeApiKey.trim();
    if (!apiKey) throw new Error('Poe API key is required');

    // Create a context message for Claude
    const prompt = `You are a helpful financial assistant for a savings tracker app. 
The user is saving for a ${context.goalName}. Here's their current data:
- Target: ${context.target}
- Total Saved: ${context.totalSaved} (${context.percentComplete} complete)
- Remaining: ${context.remaining}
- Tracking for ${context.weeksWithData} out of ${context.totalWeeks} weeks
- Average weekly saving: ${context.weeklyAverage}
- Current streak: ${context.currentStreak} weeks
- Best streak: ${context.bestStreak} weeks
- Estimated completion date: ${context.predictedCompletion}
- Recent 4 weeks: ${JSON.stringify(context.recentPerformance)}

Please provide concise, helpful advice about their savings journey based on this data. 
Be encouraging and practical.

User question: ${userMessage}`;

    if (debugMode) console.log('Sending request to Poe with prompt:', prompt);

    // Using Poe API
    const response = await fetch('https://api.poe.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'claude-instant', // Using Claude Instant model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Poe API error: ${response.status} ${response.statusText} - ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (debugMode) console.log('Received response from Poe:', data);
    
    return data.choices[0].message.content;
  };

  // Send message to OpenAI
  const sendMessageToOpenAI = async (userMessage, context, previousMessages) => {
    const apiKey = openaiApiKey.trim();
    if (!apiKey) throw new Error('OpenAI API key is required');
    
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
    
    if (debugMode) console.log('Sending request to OpenAI with messages:', [systemMessage, ...previousMessages, { role: 'user', content: userMessage }]);

    // Send to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...previousMessages, { role: 'user', content: userMessage }],
      temperature: 0.7,
      max_tokens: 250
    });
    
    if (debugMode) console.log('Received response from OpenAI:', response);
    
    return response.choices[0].message.content;
  };

  // Send message to selected API provider
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    // Check API key/settings based on provider
    if (apiProvider === API_PROVIDERS.OPENAI && !openaiApiKey) {
      setShowApiKeyInput(true);
      return;
    } else if (apiProvider === API_PROVIDERS.POE && !poeApiKey) {
      setShowApiKeyInput(true);
      return;
    } else if (apiProvider === API_PROVIDERS.REPLICATE && !replicateApiKey) {
      setShowApiKeyInput(true);
      return;
    } else if (apiProvider === API_PROVIDERS.OLLAMA) {
      // Check if Ollama is running
      const isRunning = await checkOllamaStatus();
      if (!isRunning) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Ollama server is not running. Make sure Ollama is installed and running on your computer. If you just installed it, you may need to restart your browser.'
        }]);
        return;
      }
    }
    
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setErrorDetails('');
    
    try {
      // Get context data
      const context = createAIContext();
      
      // Send message to selected provider
      let responseContent;
      if (apiProvider === API_PROVIDERS.OPENAI) {
        responseContent = await sendMessageToOpenAI(inputValue, context, messages);
      } else if (apiProvider === API_PROVIDERS.POE) {
        responseContent = await sendMessageToPoe(inputValue, context);
      } else if (apiProvider === API_PROVIDERS.REPLICATE) {
        responseContent = await sendMessageToReplicate(inputValue, context);
      } else if (apiProvider === API_PROVIDERS.OLLAMA) {
        responseContent = await sendMessageToOllama(inputValue, context);
      }
      
      // Add response to messages
      const assistantMessage = { 
        role: 'assistant', 
        content: responseContent
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(`Error getting ${apiProvider} response:`, error);
      
      // Store detailed error for debug mode
      setErrorDetails(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Provide more specific error messages
      let errorMessage = `Sorry, I encountered an error with the ${
        apiProvider === API_PROVIDERS.OPENAI 
          ? 'OpenAI' 
          : apiProvider === API_PROVIDERS.POE 
            ? 'Poe' 
            : apiProvider === API_PROVIDERS.REPLICATE
              ? 'Replicate'
              : 'Ollama'
      } API. Please check your settings or try again later.`;
      
      if (apiProvider === API_PROVIDERS.OPENAI) {
        if (error.message?.includes('401')) {
          errorMessage = 'Invalid OpenAI API key. Please check that you\'ve entered a valid key.';
        } else if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('insufficient_quota')) {
          errorMessage = 'OpenAI rate limit exceeded or insufficient quota. This likely means you need to set up billing for your OpenAI account.';
          setShowFreeAlternatives(true);
        } else if (error.message?.includes('CORS')) {
          errorMessage = 'CORS error detected. This may be due to browser security restrictions.';
        } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      } else if (apiProvider === API_PROVIDERS.POE) {
        // Poe API specific errors
        if (error.message?.includes('401') || error.message?.includes('403')) {
          errorMessage = 'Invalid Poe API key. Please check that you\'ve entered a valid key.';
        } else if (error.message?.includes('429')) {
          errorMessage = 'Poe API rate limit exceeded.';
        }
      } else if (apiProvider === API_PROVIDERS.REPLICATE) {
        if (error.message?.includes('401') || error.message?.includes('403')) {
          errorMessage = 'Invalid Replicate API key. Please check that you\'ve entered a valid key.';
        } else if (error.message?.includes('429')) {
          errorMessage = 'Replicate API rate limit exceeded.';
        } else if (error.message?.includes('Failed to fetch') || error.message?.includes('CORS')) {
          errorMessage = 'CORS error detected. Replicate API cannot be called directly from a browser. You need a backend server to make these API calls. Try the alternatives below.';
          setShowFreeAlternatives(true);
          
          // Automatically switch to OpenAI if available
          if (openaiApiKey) {
            errorMessage += ' Switching to OpenAI API for now.';
            handleSwitchProvider(API_PROVIDERS.OPENAI);
          }
        }
      } else if (apiProvider === API_PROVIDERS.OLLAMA) {
        if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
          errorMessage = 'Unable to connect to Ollama server. Make sure Ollama is installed and running on your computer.';
        } else if (error.message?.includes('not found')) {
          errorMessage = `Model "${ollamaModel}" not found. You may need to run "ollama pull ${ollamaModel}" in your terminal first.`;
        }
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
  }, [
    inputValue, 
    apiProvider, 
    openaiApiKey, 
    poeApiKey,
    replicateApiKey,
    ollamaHost,
    ollamaModel,
    ollamaStatus,
    messages, 
    createAIContext, 
    debugMode,
    checkOllamaStatus,
    handleSwitchProvider
  ]);

  return (
    <div className={`rounded-lg p-5 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
          <h2 className="text-xl font-bold">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={apiProvider}
            onChange={(e) => handleSwitchProvider(e.target.value)}
            className={`text-xs py-1 px-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
          >
            <option value={API_PROVIDERS.OLLAMA}>Ollama (Local AI)</option>
            <option value={API_PROVIDERS.REPLICATE}>Replicate (Free Credits)</option>
            <option value={API_PROVIDERS.OPENAI}>OpenAI (Paid)</option>
            <option value={API_PROVIDERS.POE}>Poe (Paid)</option>
          </select>
          <button 
            onClick={() => setDebugMode(!debugMode)} 
            className={`text-xs p-1 rounded ${debugMode ? 'bg-yellow-200 text-yellow-800' : 'text-gray-400 hover:text-gray-600'}`}
            title="Toggle debug mode"
          >
            <Bug size={16} />
          </button>
        </div>
      </div>
      
      {showApiKeyInput ? (
        <div className="mb-4">
          <p className="text-sm mb-2">
            {apiProvider === API_PROVIDERS.OPENAI 
              ? 'Enter your OpenAI API key (requires billing setup):' 
              : apiProvider === API_PROVIDERS.POE
                ? 'Enter your Poe API key (requires subscription):'
                : apiProvider === API_PROVIDERS.REPLICATE
                  ? 'Enter your Replicate API key (free credits available):'
                  : 'Configure Ollama settings:'}
          </p>
          
          {apiProvider === API_PROVIDERS.OLLAMA ? (
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs">Ollama Server Address</label>
                <input
                  type="text"
                  className={`p-2 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  value={ollamaHost}
                  onChange={(e) => setOllamaHost(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs">Model Name</label>
                <input
                  type="text"
                  className={`p-2 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3"
                />
                <p className="text-xs text-gray-500 mt-1">Common models: llama3, mistral, gemma, phi</p>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleApiKeySave} 
                  disabled={!ollamaHost.trim() || !ollamaModel.trim()}
                >
                  Save &amp; Test Connection
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                className={`flex-1 p-2 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                value={
                  apiProvider === API_PROVIDERS.OPENAI 
                    ? openaiApiKey 
                    : apiProvider === API_PROVIDERS.POE
                      ? poeApiKey
                      : replicateApiKey
                }
                onChange={(e) => {
                  if (apiProvider === API_PROVIDERS.OPENAI) {
                    setOpenaiApiKey(e.target.value);
                  } else if (apiProvider === API_PROVIDERS.POE) {
                    setPoeApiKey(e.target.value);
                  } else {
                    setReplicateApiKey(e.target.value);
                  }
                }}
                placeholder={
                  apiProvider === API_PROVIDERS.OPENAI 
                    ? 'sk-...' 
                    : apiProvider === API_PROVIDERS.POE
                      ? 'poe-...'
                      : 'r8_...'
                }
              />
              <Button 
                onClick={handleApiKeySave} 
                disabled={
                  (apiProvider === API_PROVIDERS.OPENAI && !openaiApiKey.trim()) || 
                  (apiProvider === API_PROVIDERS.POE && !poeApiKey.trim()) ||
                  (apiProvider === API_PROVIDERS.REPLICATE && !replicateApiKey.trim())
                }
              >
                Save
              </Button>
            </div>
          )}
          
          <div className="mt-3 text-xs space-y-1">
            <p className="text-gray-500">Your settings are stored locally and never sent to our servers.</p>
            
            {apiProvider === API_PROVIDERS.OLLAMA && (
              <>
                <p className="text-green-600">✓ Runs completely locally - no API keys or payments needed!</p>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-xs">
                  <h3 className="font-bold mb-1">Ollama Setup Guide:</h3>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Download and install Ollama from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ollama.com</a></li>
                    <li>Run Ollama after installation</li>
                    <li>Open a terminal/command prompt and run: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">ollama pull llama3</code></li>
                    <li>Wait for the model to download (one-time setup)</li>
                    <li>Make sure Ollama is running in the background</li>
                  </ol>
                </div>
              </>
            )}
            
            {apiProvider === API_PROVIDERS.REPLICATE && (
              <>
                <p className="text-green-600">✓ Replicate offers free credits for new users!</p>
                <p className="text-gray-500">
                  <a 
                    href="https://replicate.com/signin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Sign up for Replicate to get free credits
                  </a>
                </p>
              </>
            )}
            
            {(apiProvider === API_PROVIDERS.OPENAI || apiProvider === API_PROVIDERS.POE) && (
              <>
                <p className="text-yellow-600">⚠️ Both OpenAI and Poe APIs require paid subscriptions.</p>
                <button 
                  onClick={() => handleSwitchProvider(API_PROVIDERS.OLLAMA)} 
                  className="text-blue-500 hover:underline"
                >
                  Switch to Ollama (completely free, local AI)
                </button>
              </>
            )}
          </div>
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
                <p className="text-xs mt-3">
                  Using: <span className="font-semibold">
                    {apiProvider === API_PROVIDERS.OPENAI 
                      ? 'OpenAI API' 
                      : apiProvider === API_PROVIDERS.POE
                        ? 'Poe API (Claude)'
                        : apiProvider === API_PROVIDERS.REPLICATE
                          ? 'Replicate API (Llama 4)'
                          : `Ollama (${ollamaModel})`
                    }
                  </span>
                </p>
                {apiProvider === API_PROVIDERS.OLLAMA && ollamaStatus === 'running' && (
                  <p className="text-xs text-green-600 mt-1">✓ Ollama server running locally</p>
                )}
                {apiProvider === API_PROVIDERS.OLLAMA && ollamaStatus === 'error' && (
                  <p className="text-xs text-red-600 mt-1 flex items-center justify-center gap-1">
                    <span>⚠ Ollama not running</span>
                    <button 
                      onClick={() => setShowApiKeyInput(true)} 
                      className="underline"
                    >
                      Setup
                    </button>
                  </p>
                )}
                {apiProvider === API_PROVIDERS.REPLICATE && (
                  <p className="text-xs text-green-600 mt-1">✓ Free credits available with new Replicate account</p>
                )}
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
              disabled={isLoading || (apiProvider === API_PROVIDERS.OLLAMA && ollamaStatus === 'error')}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isLoading || (apiProvider === API_PROVIDERS.OLLAMA && ollamaStatus === 'error')}
              title="Send message"
            >
              <SendHorizontal size={18} />
            </Button>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowApiKeyInput(true)}
                className="text-xs text-blue-500 hover:underline"
              >
                {apiProvider === API_PROVIDERS.OLLAMA ? 'Ollama Settings' : 'Change API Key'}
              </button>
            </div>
            <span className="text-xs text-gray-500">
              Powered by {
                apiProvider === API_PROVIDERS.OPENAI 
                  ? 'OpenAI' 
                  : apiProvider === API_PROVIDERS.POE 
                    ? 'Poe (Claude)' 
                    : apiProvider === API_PROVIDERS.REPLICATE
                      ? 'Replicate (Llama 4)'
                      : `Ollama (${ollamaModel})`
              }
            </span>
          </div>
        </>
      )}
    </div>
  );
}