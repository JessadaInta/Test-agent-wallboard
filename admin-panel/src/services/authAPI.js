const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

let authToken = null;
let currentUser = null;

export const authAPI = {
  // Login
  login: async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: username })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.data?.token) {
        authToken = data.data.token;
        currentUser = data.data.user;
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
      
      return data.data; // Return { user, token }
      
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get token
  getToken: () => {
    if (!authToken) {
      authToken = localStorage.getItem('token');
    }
    return authToken;
  },

  // Get current user
  getCurrentUser: () => {
    if (!currentUser) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          currentUser = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }
    return currentUser;
  },

  // Check if logged in
  isLoggedIn: () => {
    const token = authAPI.getToken();
    const user = authAPI.getCurrentUser();
    return !!(token && user);
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authAPI.getCurrentUser();
    return user?.role?.toUpperCase() === 'ADMIN';
  }
};