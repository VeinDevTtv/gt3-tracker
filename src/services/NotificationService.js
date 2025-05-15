import { toast } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.checkInterval = null;
    this.lastCheckDay = null;
    this.lastCheckHour = -1;
    this.lastCheckMinute = -1;
  }

  /**
   * Initialize the notification service
   * @param {Function} getReminders - Function to get current reminders from storage
   * @param {Function} updateReminder - Function to update a reminder (e.g., lastTriggered)
   * @param {boolean} notificationsEnabled - Whether browser notifications are enabled
   */
  initialize(getReminders, updateReminder, notificationsEnabled) {
    this.getReminders = getReminders;
    this.updateReminder = updateReminder;
    this.enabled = notificationsEnabled;
    
    this.stopChecking(); // Clear any existing interval
    
    // Check every minute if enabled
    if (this.enabled) {
      this.checkInterval = setInterval(() => this.checkReminders(), 60000); // Check every minute
      // Also check immediately
      this.checkReminders();
    }
  }
  
  /**
   * Stop checking for reminders
   */
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  /**
   * Check if reminders should be triggered
   */
  checkReminders() {
    if (!this.enabled || !this.getReminders) return;
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Skip if we've already checked this minute
    if (
      this.lastCheckDay === currentDay &&
      this.lastCheckHour === currentHour &&
      this.lastCheckMinute === currentMinute
    ) {
      return;
    }
    
    // Update last check time
    this.lastCheckDay = currentDay;
    this.lastCheckHour = currentHour;
    this.lastCheckMinute = currentMinute;
    
    // Get current reminders
    const reminders = this.getReminders();
    if (!reminders || !reminders.length) return;
    
    // Map day names to day numbers
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      daily: 'daily',
    };
    
    // Check each reminder
    reminders.forEach(reminder => {
      if (!reminder.enabled) return;
      
      const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
      const reminderDay = dayMap[reminder.day];
      
      // Check if this reminder should trigger (either it's daily or it's the right day)
      if (
        (reminderDay === 'daily' || reminderDay === currentDay) &&
        reminderHour === currentHour &&
        reminderMinute === currentMinute
      ) {
        this.triggerReminder(reminder);
      }
    });
  }
  
  /**
   * Trigger a notification for a reminder
   * @param {Object} reminder - The reminder to trigger
   */
  triggerReminder(reminder) {
    // Update the last triggered time
    const updatedReminder = {
      ...reminder,
      lastTriggered: new Date().toISOString()
    };
    
    if (this.updateReminder) {
      this.updateReminder(updatedReminder);
    }
    
    // Show toast notification
    toast(reminder.title, {
      icon: '🔔',
      duration: 5000
    });
    
    // Send browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Goal Tracker Reminder', {
        body: reminder.title,
        icon: '/favicon.ico'
      });
    }
  }
  
  /**
   * Set whether notifications are enabled
   * @param {boolean} enabled - Whether notifications are enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    
    if (enabled) {
      this.initialize(this.getReminders, this.updateReminder, true);
    } else {
      this.stopChecking();
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();
export default notificationService; 