import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="transition-transform hover:rotate-45" />
      ) : (
        <Moon size={18} className="transition-transform hover:scale-110" />
      )}
    </Button>
  );
};

export default ThemeToggle; 