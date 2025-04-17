import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, LogIn, LogOut, Menu, User, Settings, Home } from 'lucide-react';

export default function NavMenu() {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <nav className="px-4 py-3 bg-background border-b border-border flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary-color">GT3 Tracker</Link>
        
        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Always visible links */}
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-md ${location.pathname === '/' ? 'bg-primary-500/10 text-primary-color' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </div>
          </Link>
          
          {currentUser ? (
            <>
              <Link 
                to="/settings" 
                className={`px-3 py-2 rounded-md ${location.pathname === '/settings' ? 'bg-primary-500/10 text-primary-color' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </div>
              </Link>
              
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                  <User className="h-4 w-4" />
                  <span>{currentUser.username || 'Account'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="p-2">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={closeMenu}
                    >
                      Profile Settings
                    </Link>
                    
                    <button 
                      onClick={() => {
                        logout();
                        closeMenu();
                      }} 
                      className="w-full text-left px-4 py-2 rounded-md text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`px-3 py-2 rounded-md ${location.pathname === '/login' ? 'bg-primary-500/10 text-primary-color' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} flex items-center gap-2`}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </Link>
              
              <Link 
                to="/signup" 
                className="px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      
      {/* Mobile navigation menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-10">
          <div className="p-4 space-y-2">
            <Link 
              to="/" 
              className={`block px-4 py-2 rounded-md ${location.pathname === '/' ? 'bg-primary-500/10 text-primary-color' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              onClick={closeMenu}
            >
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </div>
            </Link>
            
            {currentUser ? (
              <>
                <Link 
                  to="/settings" 
                  className={`block px-4 py-2 rounded-md ${location.pathname === '/settings' ? 'bg-primary-500/10 text-primary-color' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </Link>
                
                <Link 
                  to="/profile" 
                  className={`block px-4 py-2 rounded-md ${location.pathname === '/profile' ? 'bg-primary-500/10 text-primary-color' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </div>
                </Link>
                
                <button 
                  onClick={() => {
                    logout();
                    closeMenu();
                  }} 
                  className="w-full text-left px-4 py-2 rounded-md text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`block px-4 py-2 rounded-md ${location.pathname === '/login' ? 'bg-primary-500/10 text-primary-color' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} flex items-center gap-2`}
                  onClick={closeMenu}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign in</span>
                </Link>
                
                <Link 
                  to="/signup" 
                  className="block px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                  onClick={closeMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 