import React, { useState } from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BellRing, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReminderSettings = ({ theme }) => {
  const { activeGoal, scheduleReminder, requestNotificationPermission } = useGoals();
  
  const [reminderEnabled, setReminderEnabled] = useState(
    activeGoal?.reminderEnabled || false
  );
  
  const [reminderDay, setReminderDay] = useState(
    activeGoal?.reminderDay || "friday"
  );
  
  const [reminderTime, setReminderTime] = useState(
    activeGoal?.reminderTime || "18:00"
  );
  
  const handleToggleReminder = async (checked) => {
    if (checked) {
      // Request permission when enabling
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        toast.error("Notification permission is required for reminders");
        return;
      }
    }
    
    setReminderEnabled(checked);
    
    if (activeGoal) {
      await scheduleReminder(
        activeGoal.id,
        reminderDay,
        reminderTime,
        checked
      );
    }
  };
  
  const saveReminderSettings = async () => {
    if (!activeGoal) return;
    
    await scheduleReminder(
      activeGoal.id,
      reminderDay,
      reminderTime,
      reminderEnabled
    );
  };
  
  const handleTestNotification = () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return;
    }
    
    if (Notification.permission !== "granted") {
      requestNotificationPermission().then(granted => {
        if (granted) {
          sendTestNotification();
        } else {
          toast.error("Notification permission denied");
        }
      });
    } else {
      sendTestNotification();
    }
  };
  
  const sendTestNotification = () => {
    try {
      new Notification("Savings Reminder Test", {
        body: `This is a test reminder for your ${activeGoal?.name || 'savings'} goal!`,
        icon: '/logo192.png'
      });
      toast.success("Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    }
  };
  
  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary-color" />
          Weekly Reminders
        </CardTitle>
        <CardDescription>
          Get reminded to update your savings progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-toggle">Enable Reminders</Label>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Get notified to update your savings
              </p>
            </div>
            <Switch 
              id="reminder-toggle"
              checked={reminderEnabled}
              onCheckedChange={handleToggleReminder}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-day">Reminder Day</Label>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                When to send the reminder
              </p>
            </div>
            <Select 
              id="reminder-day"
              value={reminderDay}
              onValueChange={setReminderDay}
              disabled={!reminderEnabled}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Time of day for reminder
              </p>
            </div>
            <Input 
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-[150px]"
              disabled={!reminderEnabled}
            />
          </div>
          
          <div className={`p-3 rounded-md flex items-center gap-2 ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Info size={16} className="text-blue-500 flex-shrink-0" />
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Reminders will be sent via browser notifications. You need to have the app open for notifications to work.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button 
              variant="outline" 
              onClick={handleTestNotification}
              disabled={!reminderEnabled}
            >
              Test Notification
            </Button>
            <Button onClick={saveReminderSettings} disabled={!reminderEnabled}>
              Save Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderSettings; 