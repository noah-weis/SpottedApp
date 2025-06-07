import AsyncStorage from '@react-native-async-storage/async-storage';
import usersData from '../data/users.json';

// Simple auth state management
let currentUser = null;
let authStateListeners = [];

// Load current user from storage on app start
const loadCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('currentUser');
    if (userData) {
      currentUser = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

// Save current user to storage
const saveCurrentUser = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('currentUser');
    }
    currentUser = user;
    // Notify all listeners
    authStateListeners.forEach(callback => callback(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Initialize auth state
loadCurrentUser();

export const authService = {
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      // Find user in JSON data
      const user = usersData.users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Create user object without password
        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        };
        
        await saveCurrentUser(userWithoutPassword);
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create new account
  signUp: async (email, password) => {
    try {
        // Check if user already exists
      const existingUser = usersData.users.find(u => u.email === email);
      
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }
      
      // Create new user
      const newUser = {
        id: (usersData.users.length + 1).toString(),
        email: email,
        password: password,
        createdAt: new Date().toISOString()
      };
      
      // Add to users array (Note: This won't persist in the JSON file, just in memory)
      usersData.users.push(newUser);
      
      // Create user object without password
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt
      };
      
      await saveCurrentUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await saveCurrentUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    authStateListeners.push(callback);
    
    // Immediately call with current user
    callback(currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }
};

// Export current user for compatibility
export const auth = {
  currentUser: currentUser
};
