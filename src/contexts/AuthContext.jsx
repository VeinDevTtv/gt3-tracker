import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Create the auth context
const AuthContext = createContext(null);

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved auth on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gt3_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('gt3_user');
    }
    setLoading(false);
  }, []);

  // Sign up new user
  async function signup(username, email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Check if user already exists
          const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
          const userExists = users.some(user => user.email === email);
          
          if (userExists) {
            reject(new Error('User with this email already exists'));
            return;
          }
          
          // Create new user
          const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password, // In a real app, this would be hashed
            createdAt: new Date().toISOString()
          };
          
          // Save user to "database"
          users.push(newUser);
          localStorage.setItem('gt3_users', JSON.stringify(users));
          
          // Don't include password in returned user object
          const { password: _, ...userWithoutPassword } = newUser;
          resolve(userWithoutPassword);
        } catch (error) {
          reject(new Error('Failed to create account'));
        }
      }, 500); // Simulate API delay
    });
  }

  // Log in existing user
  async function login(email, password, rememberMe = false) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
          const user = users.find(user => user.email === email && user.password === password);
          
          if (!user) {
            reject(new Error('Invalid email or password'));
            return;
          }
          
          // Don't include password in user data stored in state/localStorage
          const { password: _, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          
          // If remember me is checked, store user in localStorage
          if (rememberMe) {
            localStorage.setItem('gt3_user', JSON.stringify(userWithoutPassword));
          }
          
          resolve(userWithoutPassword);
        } catch (error) {
          reject(new Error('Failed to log in'));
        }
      }, 500); // Simulate API delay
    });
  }

  // Log out user
  async function logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(null);
        localStorage.removeItem('gt3_user');
        resolve();
      }, 300); // Simulate API delay
    });
  }

  // Reset password
  async function resetPassword(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
          const user = users.find(user => user.email === email);
          
          if (!user) {
            reject(new Error('No user found with this email address'));
            return;
          }
          
          // In a real app, this would send an email with reset instructions
          console.log(`Password reset requested for user: ${email}`);
          resolve();
        } catch (error) {
          reject(new Error('Failed to reset password'));
        }
      }, 500); // Simulate API delay
    });
  }
  
  // Update user profile
  async function updateProfile(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!currentUser) {
            reject(new Error('No user is logged in'));
            return;
          }
          
          // Get all users and update the current one
          const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
          const userIndex = users.findIndex(user => user.id === currentUser.id);
          
          if (userIndex === -1) {
            reject(new Error('User not found'));
            return;
          }
          
          // Update user data
          const updatedUser = {
            ...users[userIndex],
            ...userData,
            updatedAt: new Date().toISOString()
          };
          
          // Save updated user back to storage
          users[userIndex] = updatedUser;
          localStorage.setItem('gt3_users', JSON.stringify(users));
          
          // Don't include password in updated user data
          const { password: _, ...userWithoutPassword } = updatedUser;
          setCurrentUser(userWithoutPassword);
          
          // Update current user in localStorage if they're remembered
          if (localStorage.getItem('gt3_user')) {
            localStorage.setItem('gt3_user', JSON.stringify(userWithoutPassword));
          }
          
          resolve(userWithoutPassword);
        } catch (error) {
          reject(new Error('Failed to update profile'));
        }
      }, 500); // Simulate API delay
    });
  }
  
  // Update password
  async function updatePassword(currentPassword, newPassword) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!currentUser) {
            reject(new Error('No user is logged in'));
            return;
          }
          
          // Verify current password
          const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
          const userIndex = users.findIndex(user => user.id === currentUser.id);
          
          if (userIndex === -1) {
            reject(new Error('User not found'));
            return;
          }
          
          if (users[userIndex].password !== currentPassword) {
            reject(new Error('Current password is incorrect'));
            return;
          }
          
          // Update password
          users[userIndex].password = newPassword;
          users[userIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('gt3_users', JSON.stringify(users));
          
          resolve();
        } catch (error) {
          reject(new Error('Failed to update password'));
        }
      }, 500); // Simulate API delay
    });
  }

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateProfile,
    updatePassword,
    isAuthenticated: !!currentUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 