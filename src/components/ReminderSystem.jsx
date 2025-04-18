import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Bell, Mail, Clock, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ReminderSystem = ({ theme }) => {
  // Load saved reminder settings from local storage
  const [reminders, setReminders] = useLocalStorage('gt3-reminders', {
    enabled: false,
    browserNotifications: true,
    emailNotifications: false,
    email: '',
    frequency: 'weekly',
    day: 'monday',
    time: '18:00',
    lastNotification: null,
  });
  
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [emailValid, setEmailValid] = useState(true);
  
  // Check notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save changes to local storage whenever reminders state changes
  const updateReminders = (updates) => {
    setReminders(prev => ({ ...prev, ...updates }));
  };
  
  // Request notification permissions
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported in this browser');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notification permission granted');
        // Send a test notification
        new Notification('GT3 Savings Tracker', {
          body: 'Notifications are now enabled for your savings goals!',
          icon: '/favicon.ico',
        });
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      toast.error('Failed to request notification permission');
    }
  };
  
  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = re.test(email);
    setEmailValid(valid);
    return valid;
  };
  
  // Save reminder settings
  const saveReminderSettings = () => {
    // If email notifications are enabled, validate email
    if (reminders.emailNotifications) {
      if (!validateEmail(reminders.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }
    
    // If browser notifications are enabled, check permission
    if (reminders.browserNotifications && notificationPermission !== 'granted') {
      requestNotificationPermission();
    }
    
    // Save settings
    updateReminders({
      lastUpdated: new Date().toISOString(),
    });
    
    toast.success('Reminder settings saved');
    
    // Schedule a test reminder if enabled
    if (reminders.enabled) {
      setTimeout(() => {
        sendTestReminder();
      }, 1000);
    }
  };
  
  // Send test reminder
  const sendTestReminder = () => {
    if (reminders.browserNotifications && notificationPermission === 'granted') {
      new Notification('GT3 Savings Tracker', {
        body: 'This is a test reminder for your savings goals. Reminders will be sent ' + reminders.frequency + '.',
        icon: '/favicon.ico',
      });
    }
    
    if (reminders.emailNotifications && emailValid) {
      // In a real implementation, this would call an API endpoint to send emails
      // For now, we'll just simulate it with a toast
      toast.success(`Test email reminder sent to ${reminders.email}`);
    }
    
    updateReminders({
      lastNotification: new Date().toISOString(),
    });
  };
  
  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-color" />
          Reminder System
        </CardTitle>
        <CardDescription>
          Set up regular reminders to track your savings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-toggle">Enable Reminders</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified to update your savings progress
              </p>
            </div>
            <Switch
              id="reminder-toggle"
              checked={reminders.enabled}
              onCheckedChange={(checked) => updateReminders({ enabled: checked })}
            />
          </div>
          
          {reminders.enabled && (
            <>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-3">Notification Methods</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    </div>
                    <Switch
                      id="browser-notifications"
                      checked={reminders.browserNotifications}
                      onCheckedChange={(checked) => updateReminders({ browserNotifications: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={reminders.emailNotifications}
                      onCheckedChange={(checked) => updateReminders({ emailNotifications: checked })}
                    />
                  </div>
                  
                  {reminders.emailNotifications && (
                    <div className="pl-6 mt-2">
                      <Label htmlFor="reminder-email" className="text-sm mb-1 block">
                        Email Address
                      </Label>
                      <Input
                        id="reminder-email"
                        type="email"
                        value={reminders.email}
                        onChange={(e) => {
                          updateReminders({ email: e.target.value });
                          validateEmail(e.target.value);
                        }}
                        className={!emailValid && reminders.email ? 'border-red-500' : ''}
                        placeholder="your@email.com"
                      />
                      {!emailValid && reminders.email && (
                        <p className="text-xs text-red-500 mt-1">
                          Please enter a valid email address
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-3">Reminder Schedule</h4>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="reminder-frequency" className="text-sm mb-1 block">
                      Frequency
                    </Label>
                    <Select
                      value={reminders.frequency}
                      onValueChange={(value) => updateReminders({ frequency: value })}
                    >
                      <SelectTrigger id="reminder-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {reminders.frequency === 'weekly' && (
                    <div>
                      <Label htmlFor="reminder-day" className="text-sm mb-1 block">
                        Day of Week
                      </Label>
                      <Select
                        value={reminders.day}
                        onValueChange={(value) => updateReminders({ day: value })}
                      >
                        <SelectTrigger id="reminder-day">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {reminders.frequency === 'monthly' && (
                    <div>
                      <Label htmlFor="reminder-date" className="text-sm mb-1 block">
                        Day of Month
                      </Label>
                      <Select
                        value={reminders.monthDay || '1'}
                        onValueChange={(value) => updateReminders({ monthDay: value })}
                      >
                        <SelectTrigger id="reminder-date">
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent className={`h-[200px] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="reminder-time" className="text-sm mb-1 block">
                      Time
                    </Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={reminders.time}
                      onChange={(e) => updateReminders({ time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>
                  {reminders.lastNotification
                    ? `Last notification sent: ${new Date(reminders.lastNotification).toLocaleString()}`
                    : 'No notifications sent yet'}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-1 text-xs">
          {notificationPermission === 'granted' ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <X className="h-3 w-3 text-red-500" />
          )}
          <span className={notificationPermission === 'granted' ? 'text-green-500' : 'text-red-500'}>
            {notificationPermission === 'granted'
              ? 'Notifications allowed'
              : 'Notifications not allowed'}
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial"
            onClick={sendTestReminder}
            disabled={!reminders.enabled || (!reminders.browserNotifications && !reminders.emailNotifications)}
          >
            Test
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-initial"
            onClick={saveReminderSettings}
            disabled={!reminders.enabled}
          >
            Save Settings
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReminderSystem; 