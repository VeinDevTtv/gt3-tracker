import React, { useState, useEffect } from 'react';
import { Bell, CalendarCheck, Clock, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function RemindersPanel() {
  const [reminders, setReminders] = useLocalStorage('gt3-reminders', []);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useLocalStorage('gt3-browser-notifications', false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDay, setReminderDay] = useState('monday');
  const [reminderTime, setReminderTime] = useState('18:00');
  
  useEffect(() => {
    // Check if browser notifications are supported
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          setBrowserNotificationsEnabled(true);
          toast.success('Notifications enabled!');
          // Send a test notification
          new Notification('GT3 Tracker Notifications', {
            body: 'You will now receive reminders about your savings goals!',
            icon: '/favicon.ico'
          });
        } else {
          setBrowserNotificationsEnabled(false);
          toast.error('Permission to send notifications was denied');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast.error('Failed to enable notifications');
      }
    } else {
      toast.error('Your browser does not support notifications');
    }
  };
  
  const addReminder = () => {
    if (!reminderTitle.trim()) {
      toast.error('Please provide a reminder title');
      return;
    }
    
    const newReminder = {
      id: Date.now().toString(),
      title: reminderTitle.trim(),
      day: reminderDay,
      time: reminderTime,
      enabled: true,
      lastTriggered: null
    };
    
    setReminders([...reminders, newReminder]);
    setShowAddForm(false);
    resetForm();
    toast.success('Reminder added!');
  };
  
  const resetForm = () => {
    setReminderTitle('');
    setReminderDay('monday');
    setReminderTime('18:00');
  };
  
  const toggleReminder = (id) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
    ));
  };
  
  const deleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    toast.success('Reminder deleted');
  };
  
  const getDayLabel = (day) => {
    const days = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      daily: 'Every day'
    };
    return days[day] || day;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Reminders
        </CardTitle>
        <CardDescription>
          Set up reminders to keep track of your savings goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="browser-notifications"
                checked={browserNotificationsEnabled}
                onCheckedChange={(checked) => {
                  if (checked && notificationPermission !== 'granted') {
                    requestNotificationPermission();
                  } else {
                    setBrowserNotificationsEnabled(checked);
                  }
                }}
              />
              {notificationPermission === 'denied' && (
                <div className="text-xs text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Blocked in browser settings
                </div>
              )}
            </div>
          </div>
          
          {!showAddForm ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowAddForm(true)}
            >
              Add New Reminder
            </Button>
          ) : (
            <div className="border rounded-md p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-title">Reminder Title</Label>
                <Input
                  id="reminder-title"
                  placeholder="e.g., Update your savings progress"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder-day">Day</Label>
                  <Select value={reminderDay} onValueChange={setReminderDay}>
                    <SelectTrigger id="reminder-day">
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Every day</SelectItem>
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
                
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={addReminder}>
                  Add Reminder
                </Button>
              </div>
            </div>
          )}
          
          {reminders.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Active Reminders</h4>
              {reminders.map(reminder => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${reminder.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Bell className={`h-4 w-4 ${reminder.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <div className="flex items-center">
                          <CalendarCheck className="h-3 w-3 mr-1" />
                          <span>{getDayLabel(reminder.day)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{reminder.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No reminders set up yet
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Reminders will only work when the browser is open. For more reliable reminders, consider enabling calendar integration.</p>
      </CardFooter>
    </Card>
  );
} 