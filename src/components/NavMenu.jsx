import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Home, Settings, User, Menu, X, LogOut, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

const NavMenu = ({ theme, toggleTheme }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Failed to log out', error);
    }
  };

  // Don't show nav on auth pages
  if (location.pathname === '/login' || 
      location.pathname === '/signup' || 
      location.pathname === '/forgot-password') {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-primary-color">GT3 Tracker</Link>
        
        {currentUser ? (
          <>
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link 
                to="/" 
                className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  location.pathname === '/' ? 'text-primary-color' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/leaderboards" 
                className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  location.pathname === '/leaderboards' ? 'text-primary-color' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Trophy size={18} />
                <span>Leaderboards</span>
              </Link>
              
              <Link 
                to="/settings" 
                className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  location.pathname === '/settings' ? 'text-primary-color' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              
              <Link 
                to="/profile" 
                className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                  location.pathname === '/profile' ? 'text-primary-color' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>
              
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </Button>
            </nav>
            
            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <button 
                className="p-2 rounded-md hover:bg-muted"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Mobile menu */}
      {isOpen && currentUser && (
        <div className="md:hidden container mx-auto px-4 pb-4 flex flex-col">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              location.pathname === '/' ? 'bg-muted text-primary-color' : 'hover:bg-muted'
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/leaderboards" 
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              location.pathname === '/leaderboards' ? 'bg-muted text-primary-color' : 'hover:bg-muted'
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Trophy size={18} />
            <span>Leaderboards</span>
          </Link>
          
          <Link 
            to="/settings" 
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              location.pathname === '/settings' ? 'bg-muted text-primary-color' : 'hover:bg-muted'
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              location.pathname === '/profile' ? 'bg-muted text-primary-color' : 'hover:bg-muted'
            }`}
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-left hover:bg-muted"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default NavMenu; 