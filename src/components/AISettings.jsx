import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle, AlertTriangle, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AISettings = ({
  openAIKey = '',
  setOpenAIKey,
  poeKey = '',
  setPoeKey,
  replicateKey = '',
  setReplicateKey,
  ollamaUrl = 'http://localhost:11434',
  setOllamaUrl,
  ollamaModel = 'llama3',
  setOllamaModel,
  aiProvider = 'openai',
  setAiProvider,
}) => {
  const [ollamaStatus, setOllamaStatus] = useState('unknown');
  const [checking, setChecking] = useState(false);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const checkOllamaConnection = async () => {
    setChecking(true);
    setOllamaStatus('checking');
    
    try {
      const url = ollamaUrl?.trim() || '';
      if (!url) {
        setOllamaStatus('failed');
        toast.error('Please enter a valid Ollama server URL');
        setChecking(false);
        return;
      }
      
      const response = await fetch(`${url}/api/tags`);
      
      if (response.ok) {
        const data = await response.json();
        setOllamaStatus('connected');
        setOllamaModels(data.models || []);
        toast.success('Ollama server connected successfully');
      } else {
        setOllamaStatus('failed');
        toast.error('Failed to connect to Ollama server');
      }
    } catch (error) {
      console.error('Error checking Ollama connection:', error);
      setOllamaStatus('failed');
      toast.error('Connection to Ollama server failed');
    } finally {
      setChecking(false);
    }
  };

  const handleProviderChange = (value) => {
    setAiProvider(value);
    toast.success(`AI provider changed to ${value}`);
  };

  const saveOpenAIKey = () => {
    if (openAIKey && openAIKey.trim()) {
      localStorage.setItem('openai-api-key', openAIKey.trim());
      toast.success('OpenAI API key saved');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const savePoeKey = () => {
    if (poeKey && poeKey.trim()) {
      localStorage.setItem('poe-api-key', poeKey.trim());
      toast.success('Poe API key saved');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const saveReplicateKey = () => {
    if (replicateKey && replicateKey.trim()) {
      localStorage.setItem('replicate-api-key', replicateKey.trim());
      toast.success('Replicate API key saved');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const saveOllamaSettings = () => {
    if (ollamaUrl && ollamaUrl.trim()) {
      localStorage.setItem('ollama-url', ollamaUrl.trim());
      localStorage.setItem('ollama-model', ollamaModel || 'llama3');
      toast.success('Ollama settings saved');
    } else {
      toast.error('Please enter a valid Ollama server URL');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant Settings
        </CardTitle>
        <CardDescription>
          Configure your AI assistant provider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">AI Provider</Label>
            <Select value={aiProvider} onValueChange={handleProviderChange}>
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                <SelectItem value="ollama">Ollama (Local AI)</SelectItem>
                <SelectItem value="poe">Poe</SelectItem>
                <SelectItem value="replicate">Replicate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue={aiProvider} value={aiProvider}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="ollama">Ollama</TabsTrigger>
              <TabsTrigger value="poe">Poe</TabsTrigger>
              <TabsTrigger value="replicate">Replicate</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="openai-api-key"
                    type="password"
                    placeholder="sk-..."
                    value={openAIKey || ''}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                  />
                  <Button onClick={saveOpenAIKey}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-primary-color"
                  >
                    OpenAI dashboard
                  </a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openai-model">Model</Label>
                <Select defaultValue="gpt-3.5-turbo">
                  <SelectTrigger id="openai-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="ollama" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="ollama-url">Ollama Server URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ollama-url"
                    type="url"
                    placeholder="http://localhost:11434"
                    value={ollamaUrl || ''}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                  />
                  <Button 
                    onClick={checkOllamaConnection} 
                    disabled={checking || !(ollamaUrl && ollamaUrl.trim())}
                  >
                    {checking ? 'Checking...' : 'Check'}
                  </Button>
                </div>
                
                {ollamaStatus === 'connected' && (
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Connected to Ollama server
                  </div>
                )}
                
                {ollamaStatus === 'failed' && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Failed to connect to Ollama server
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Ollama runs locally on your machine. Make sure it's installed and running.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ollama-model">Model</Label>
                <Select 
                  value={ollamaModel} 
                  onValueChange={setOllamaModel}
                  disabled={ollamaModels.length === 0}
                >
                  <SelectTrigger id="ollama-model">
                    <SelectValue placeholder={ollamaModels.length === 0 ? "Connect to see available models" : "Select model"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ollamaModels.length > 0 ? (
                      ollamaModels.map(model => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="llama3">Llama 3</SelectItem>
                        <SelectItem value="mistral">Mistral</SelectItem>
                        <SelectItem value="phi3">Phi-3</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={saveOllamaSettings}>Save Ollama Settings</Button>
            </TabsContent>
            
            <TabsContent value="poe" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="poe-api-key">Poe API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="poe-api-key"
                    type="password"
                    placeholder="Enter your Poe API key"
                    value={poeKey || ''}
                    onChange={(e) => setPoeKey(e.target.value)}
                  />
                  <Button onClick={savePoeKey}>Save</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="replicate" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="replicate-api-key">Replicate API Key</Label>
                <div className="flex space-x-2">
                  <Input
                    id="replicate-api-key"
                    type="password"
                    placeholder="Enter your Replicate API key"
                    value={replicateKey || ''}
                    onChange={(e) => setReplicateKey(e.target.value)}
                  />
                  <Button onClick={saveReplicateKey}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://replicate.com/account/api-tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-primary-color"
                  >
                    Replicate dashboard
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISettings; 