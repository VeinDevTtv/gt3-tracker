import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Sun, Moon } from 'lucide-react';

const ThemeSettings = ({ theme, setTheme, themeColor, onThemeColorChange }) => {
  const handleThemeToggle = (checked) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance of your savings tracker
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-toggle">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark themes
            </p>
          </div>
          <Switch
            id="theme-toggle"
            checked={theme === 'dark'}
            onCheckedChange={handleThemeToggle}
          />
        </div>

        <div className="space-y-3">
          <Label>Accent Color</Label>
          <RadioGroup
            defaultValue={themeColor}
            value={themeColor}
            onValueChange={onThemeColorChange}
            className="grid grid-cols-5 gap-2"
          >
            <Label
              htmlFor="theme-blue"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="blue" id="theme-blue" className="sr-only" />
              <span className="block w-6 h-6 rounded-full bg-blue-500" />
              <span className="mt-2 text-xs">Blue</span>
            </Label>
            <Label
              htmlFor="theme-green"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="green" id="theme-green" className="sr-only" />
              <span className="block w-6 h-6 rounded-full bg-green-500" />
              <span className="mt-2 text-xs">Green</span>
            </Label>
            <Label
              htmlFor="theme-red"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="red" id="theme-red" className="sr-only" />
              <span className="block w-6 h-6 rounded-full bg-red-500" />
              <span className="mt-2 text-xs">Red</span>
            </Label>
            <Label
              htmlFor="theme-purple"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="purple" id="theme-purple" className="sr-only" />
              <span className="block w-6 h-6 rounded-full bg-purple-500" />
              <span className="mt-2 text-xs">Purple</span>
            </Label>
            <Label
              htmlFor="theme-orange"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="orange" id="theme-orange" className="sr-only" />
              <span className="block w-6 h-6 rounded-full bg-orange-500" />
              <span className="mt-2 text-xs">Orange</span>
            </Label>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings; 