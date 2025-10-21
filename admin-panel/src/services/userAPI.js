// admin-panel/src/services/userAPI.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

/**
 * Helper function for error handling
 */
const handleAPIError = (error) => {
  if (error.message === 'Failed to fetch') {
    throw new Error('Network error. Please check your internet connection.');
  }
  throw error;
};

/**
 * User API Service
 */
export const userAPI = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    try {
      console.log('📋 [GET ALL USERS] Request started');
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('📋 [GET ALL USERS] Response status:', response.status);

      // Handle authentication errors
      if (response.status === 401) {
        console.warn('⚠️ [GET ALL USERS] Unauthorized - clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [GET ALL USERS] Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [GET ALL USERS] Success:', data.data?.length, 'users');
      return data.data; // Return the users array
    } catch (error) {
      console.error('❌ [GET ALL USERS] Exception:', error);
      handleAPIError(error);
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      console.log('👤 [GET USER BY ID] Request for ID:', userId);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('👤 [GET USER BY ID] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [GET USER BY ID] Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [GET USER BY ID] Success:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ [GET USER BY ID] Exception:', error);
      handleAPIError(error);
    }
  },

  /**
   * Create new user
   */
  createUser: async (userData) => {
    try {
      console.log('➕ [CREATE USER] Request started');
      console.log('➕ [CREATE USER] Data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      console.log('➕ [CREATE USER] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [CREATE USER] Error response:', errorData);
        
        // Show detailed validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(e => 
            `${e.field}: ${e.message} (value: ${e.value})`
          ).join(', ');
          console.error('❌ [CREATE USER] Validation errors:', errorMessages);
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data = await response.json();
      console.log('✅ [CREATE USER] Success:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ [CREATE USER] Exception:', error);
      handleAPIError(error);
    }
  },

  /**
   * Update user
   */
  updateUser: async (userId, userData) => {
    try {
      console.log('✏️ [UPDATE USER] Request started');
      console.log('✏️ [UPDATE USER] ID:', userId, 'Type:', typeof userId);
      console.log('✏️ [UPDATE USER] Data:', userData);

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      console.log('✏️ [UPDATE USER] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [UPDATE USER] Error response:', errorData);
        
        // Show detailed validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(e => 
            `${e.field}: ${e.message} (value: ${e.value})`
          ).join(', ');
          console.error('❌ [UPDATE USER] Validation errors:', errorMessages);
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(errorData.message || 'Failed to update user');
      }

      const data = await response.json();
      console.log('✅ [UPDATE USER] Success:', data.data);
      return data.data;
    } catch (error) {
      console.error('❌ [UPDATE USER] Exception:', error);
      handleAPIError(error);
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    try {
      console.log('🗑️ [DELETE USER] Request started');
      console.log('🗑️ [DELETE USER] ID:', userId, 'Type:', typeof userId);
      console.log('🗑️ [DELETE USER] URL:', `${API_BASE_URL}/users/${userId}`);
      console.log('🗑️ [DELETE USER] Token:', localStorage.getItem('token') ? 'exists' : 'missing');

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('🗑️ [DELETE USER] Response status:', response.status);
      console.log('🗑️ [DELETE USER] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [DELETE USER] Error response:', errorData);
        console.error('❌ [DELETE USER] Full error object:', JSON.stringify(errorData, null, 2));
        
        // Show detailed validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(e => 
            `${e.field}: ${e.message} (value: ${e.value})`
          ).join(', ');
          console.error('❌ [DELETE USER] Validation errors:', errorMessages);
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const data = await response.json();
      console.log('✅ [DELETE USER] Success:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ [DELETE USER] Exception:', error);
      console.error('❌ [DELETE USER] Error stack:', error.stack);
      throw error; // Re-throw so calling code can handle it
    }
  }
};