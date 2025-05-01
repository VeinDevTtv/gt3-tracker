import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoals } from '../contexts/GoalsContext';
import SettingsPanel from '../components/SettingsPanel';
import { Button } from '../components/ui/button';
import { ArrowLeft, Bell, KeyRound, Shield, Globe, Lock, CreditCard, Calendar, UserCog, MessageSquare } from 'lucide-react';
import { Helmet } from 'react-helmet';
import ThemeSettings from '../components/ThemeSettings';
import ProfilePanel from '../components/ProfilePanel';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Input } from '../components/ui/input';
import { toast } from 'react-hot-toast';

export default function Settings({
  theme,
  visibleWeeks,
  showCumulative,
  onVisibleWeeksChange,
  onToggleCumulative,
  showConfirmReset,
  setShowConfirmReset,
  themeColor,
  onThemeColorChange,
  setTheme,
  openAIKey,
  setOpenAIKey,
  poeKey,
  setPoeKey,
  replicateKey,
  setReplicateKey,
  ollamaUrl,
  setOllamaUrl,
  ollamaModel,
  setOllamaModel,
  aiProvider,
  setAiProvider
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef(null);

  const { 
    currentGoal,
    resetAllApplicationData
  } = useGoals();

  const [aiEnabled, setAiEnabled] = useState(() => {
    return localStorage.getItem('custom-ai-enabled') !== 'false';
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications-enabled') === 'true';
  });
  
  const [weeklyReminder, setWeeklyReminder] = useState(() => {
    return localStorage.getItem('weekly-reminder') === 'true';
  });
  
  const [milestoneAlerts, setMilestoneAlerts] = useState(() => {
    return localStorage.getItem('milestone-alerts') !== 'false';
  });
  
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => {
    return localStorage.getItem('analytics-enabled') !== 'false';
  });
  
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => {
    return localStorage.getItem('auto-backup-enabled') === 'true';
  });
  
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });
  
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('date-format') || 'MM/DD/YYYY';
  });
  
  const toggleAiEnabled = (enabled) => {
    setAiEnabled(enabled);
    localStorage.setItem('custom-ai-enabled', enabled.toString());
  };
  
  const toggleNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notifications-enabled', enabled.toString());
    
    if (enabled && "Notification" in window) {
      Notification.requestPermission();
    }
  };
  
  const toggleWeeklyReminder = (enabled) => {
    setWeeklyReminder(enabled);
    localStorage.setItem('weekly-reminder', enabled.toString());
  };
  
  const toggleMilestoneAlerts = (enabled) => {
    setMilestoneAlerts(enabled);
    localStorage.setItem('milestone-alerts', enabled.toString());
  };
  
  const toggleAnalytics = (enabled) => {
    setAnalyticsEnabled(enabled);
    localStorage.setItem('analytics-enabled', enabled.toString());
  };
  
  const toggleAutoBackup = (enabled) => {
    setAutoBackupEnabled(enabled);
    localStorage.setItem('auto-backup-enabled', enabled.toString());
  };
  
  const handleCurrencyChange = (value) => {
    setCurrency(value);
    localStorage.setItem('currency', value);
  };
  
  const handleDateFormatChange = (value) => {
    setDateFormat(value);
    localStorage.setItem('date-format', value);
  };

  return (
    <>
      <Helmet>
        <title>Settings | GT3 Savings Tracker</title>
      </Helmet>

      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-6 transition-colors duration-200`}>
        <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/')} 
              className="rounded-full"
            >
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-porsche-black'}`}>
                Settings
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Configure your {currentGoal?.name || 'GT3'} tracker
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="mb-8">            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <UserCog size={16} />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Globe size={16} />
                  <span className="hidden sm:inline">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell size={16} />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield size={16} />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Bot size={16} />
                  <span className="hidden sm:inline">AI Assistant</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6">
                {currentUser && (
                  <ProfilePanel />
                )}
                
                <SettingsPanel 
                  theme={theme}
                  onResetAllData={resetAllApplicationData}
                />
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-6">
                <ThemeSettings 
                  theme={theme} 
                  setTheme={setTheme}
                  themeColor={themeColor}
                  onThemeColorChange={onThemeColorChange}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Display Settings
                    </CardTitle>
                    <CardDescription>
                      Customize how information is displayed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Select value={dateFormat} onValueChange={handleDateFormatChange}>
                        <SelectTrigger id="date-format">
                          <SelectValue placeholder="Select a date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>
                      Control how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications-toggle">Enable Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive important alerts and reminders
                        </p>
                      </div>
                      <Switch
                        id="notifications-toggle"
                        checked={notificationsEnabled}
                        onCheckedChange={toggleNotifications}
                      />
                    </div>
                    
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-sm font-medium">Notification Types</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weekly-reminder" className="font-normal">Weekly Savings Reminder</Label>
                          <p className="text-sm text-muted-foreground">
                            Get a reminder to add your savings for the week
                          </p>
                        </div>
                        <Switch
                          id="weekly-reminder"
                          checked={weeklyReminder}
                          onCheckedChange={toggleWeeklyReminder}
                          disabled={!notificationsEnabled}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="milestone-alerts" className="font-normal">Milestone Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when you reach savings milestones
                          </p>
                        </div>
                        <Switch
                          id="milestone-alerts"
                          checked={milestoneAlerts}
                          onCheckedChange={toggleMilestoneAlerts}
                          disabled={!notificationsEnabled}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy & Security
                    </CardTitle>
                    <CardDescription>
                      Manage your data privacy and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics-toggle">Usage Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow anonymous usage data to improve the app
                        </p>
                      </div>
                      <Switch
                        id="analytics-toggle"
                        checked={analyticsEnabled}
                        onCheckedChange={toggleAnalytics}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-backup-toggle">Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">
                          Create weekly backups of your data in local storage
                        </p>
                      </div>
                      <Switch
                        id="auto-backup-toggle"
                        checked={autoBackupEnabled}
                        onCheckedChange={toggleAutoBackup}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Currency & Formats
                    </CardTitle>
                    <CardDescription>
                      Set your preferred currency and display formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="currency-select">Currency</Label>
                      <Select value={currency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger id="currency-select">
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">British Pound (£)</SelectItem>
                          <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                          <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                          <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Default Chart View</Label>
                      <RadioGroup
                        defaultValue={showCumulative ? "cumulative" : "weekly"}
                        value={showCumulative ? "cumulative" : "weekly"}
                        onValueChange={(value) => onToggleCumulative(value === "cumulative")}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cumulative" id="r1" />
                          <Label htmlFor="r1">Cumulative (running total)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="r2" />
                          <Label htmlFor="r2">Weekly (individual entries)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5" />
                      Keyboard Shortcuts
                    </CardTitle>
                    <CardDescription>
                      Keyboard shortcuts to navigate the app faster
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span>Add New Entry</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + N</kbd>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span>Go to Dashboard</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">D</kbd>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span>Go to Settings</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">S</kbd>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span>Toggle Theme</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">T</kbd>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span>Help Menu</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Assistant Settings
                    </CardTitle>
                    <CardDescription>
                      Configure your built-in savings assistant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="ai-enabled" className="font-medium">Enable AI Assistant</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Toggle visibility of the built-in AI savings assistant
                          </p>
                        </div>
                        <Switch 
                          id="ai-enabled" 
                          checked={aiEnabled} 
                          onCheckedChange={toggleAiEnabled} 
                        />
                      </div>
                      
                      <div className="space-y-3 border-t pt-4">
                        <Label htmlFor="ai-provider">AI Provider</Label>
                        <Select value={aiProvider} onValueChange={setAiProvider} disabled={!aiEnabled}>
                          <SelectTrigger id="ai-provider" disabled={!aiEnabled}>
                            <SelectValue placeholder="Select an AI provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local (Built-in)</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="ollama">Ollama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {aiProvider === 'openai' && (
                        <div className="space-y-3">
                          <Label htmlFor="openai-key">OpenAI API Key</Label>
                          <Input
                            id="openai-key"
                            type="password"
                            value={openAIKey}
                            onChange={(e) => setOpenAIKey(e.target.value)}
                            placeholder="sk-..."
                            className="font-mono"
                            disabled={!aiEnabled}
                          />
                        </div>
                      )}
                      
                      {aiProvider === 'ollama' && (
                        <div className="space-y-3">
                          <Label htmlFor="ollama-url">Ollama URL</Label>
                          <Input
                            id="ollama-url"
                            type="text"
                            value={ollamaUrl}
                            onChange={(e) => setOllamaUrl(e.target.value)}
                            placeholder="http://localhost:11434"
                            className="font-mono"
                            disabled={!aiEnabled}
                          />
                          
                          <Label htmlFor="ollama-model" className="mt-3">Ollama Model</Label>
                          <Input
                            id="ollama-model"
                            type="text"
                            value={ollamaModel}
                            onChange={(e) => setOllamaModel(e.target.value)}
                            placeholder="llama3"
                            className="font-mono"
                            disabled={!aiEnabled}
                          />
                        </div>
                      )}
                      
                      <div className="bg-primary/10 p-4 rounded-md">
                        <h3 className="font-medium mb-2">About the Assistant</h3>
                        <p className="text-sm">
                          This app includes a built-in AI assistant that can help with:
                        </p>
                        <ul className="text-sm mt-2 space-y-1 list-disc pl-5">
                          <li>Tracking your savings progress</li>
                          <li>Providing personalized saving tips</li>
                          <li>Estimating completion dates</li>
                          <li>Suggesting weekly savings targets</li>
                        </ul>
                        <p className="text-sm mt-3">
                          All processing happens locally within the app, with no data sent to external servers.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <footer className={`max-w-6xl mx-auto mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>{currentGoal?.name || 'GT3'} Savings Tracker © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </>
  );
} 