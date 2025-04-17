import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  getAuth
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create the auth context
const AuthContext = createContext(null);

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gt3_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('gt3_user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gt3_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gt3_user');
    }
  }, [currentUser]);

  // Mock signup function - in a real app, this would use Firebase, Auth0, etc.
  const signup = async (username, email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('gt3_users') || '[]');
    if (existingUsers.some(user => user.email === email)) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      createdAt: new Date().toISOString(),
      settings: {
        theme: 'blue',
      }
    };
    
    // Save to users collection
    localStorage.setItem('gt3_users', JSON.stringify([...existingUsers, newUser]));
    
    return newUser;
  };

  // Mock login function
  const login = async (email, password, remember) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user
    const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In a real app, we would check the password hash here
    // For demo purposes, we're just checking the email exists
    
    // Save user to state
    setCurrentUser(user);
    
    // Save to localStorage if remember is true
    if (remember) {
      localStorage.setItem('gt3_user', JSON.stringify(user));
    }
    
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gt3_user');
  };

  const resetPassword = async (email) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would send a password reset email
    // For now, we'll just check if the email exists
    
    const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('No account found with this email');
    }
    
    return true;
  };

  // Fetch user data from localStorage
  async function fetchUserData(uid) {
    const users = JSON.parse(localStorage.getItem('gt3_users') || '[]');
    const user = users.find(u => u.id === uid);
    
    if (user) {
      setUserData(user);
      return user;
    } else {
      console.error("No such user document!");
      return null;
    }
  }
  
  // Update user settings
  async function updateUserSettings(settings) {
    if (!currentUser) return false;
    
    try {
      const userDocRef = doc(db, "users", currentUser.id);
      await setDoc(userDocRef, { settings }, { merge: true });
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...settings
        }
      }));
      
      return true;
    } catch (error) {
      console.error("Error updating user settings:", error);
      return false;
    }
  }
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        fetchUserData(user.id);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  // Check session persistence on app refresh/reload
  useEffect(() => {
    const checkPersistence = () => {
      const persistence = sessionStorage.getItem('auth_persistence') || 
                          localStorage.getItem('auth_persistence');
      
      // If persistence is 'session' and we're in a new session, log out
      if (persistence === 'session' && !sessionStorage.getItem('current_session')) {
        // Set current session marker
        sessionStorage.setItem('current_session', 'true');
      }
    };

    checkPersistence();
  }, []);
  
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
    userData,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    fetchUserData,
    updateUserSettings,
    isAuthenticated: !!currentUser,
    updateProfile,
    updatePassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
} 