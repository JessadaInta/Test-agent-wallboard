// services/userService.js
const userRepository = require('../repositories/userRepository');

const userService = {
  /**
   * Get all users with optional filtering
   */
  async getAllUsers(filters = {}) {
    try {
      const users = await userRepository.findAll(filters);
      return users;
    } catch (error) {
      console.error('Error in getAllUsers service:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await userRepository.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in getUserById service:', error);
      throw error;
    }
  },

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      // 1. Validate username format
      const usernameRegex = /^(AG|SV|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
      if (!usernameRegex.test(userData.username)) {
        throw new Error('Invalid username format. Use AGxxx, SVxxx, or ADxxx (001-999)');
      }

      // 2. Check if username already exists
      const exists = await userRepository.usernameExists(userData.username);
      if (exists) {
        throw new Error(`Username "${userData.username}" already exists`);
      }

      // 3. Validate role-specific rules
      if ((userData.role === 'Agent' || userData.role === 'Supervisor') && !userData.teamId) {
        throw new Error('Team ID is required for Agent and Supervisor roles');
      }
      
      // 4. Create user
      const newUser = await userRepository.create(userData);
      
      return newUser;
    } catch (error) {
      console.error('Error in createUser service:', error);
      
      // Improved error handling
      if (error.code === 'SQLITE_CONSTRAINT') {
        if (error.message.includes('UNIQUE')) {
          throw new Error(`Username "${userData.username}" already exists`);
        }
        if (error.message.includes('FOREIGN KEY')) {
          throw new Error(`Team ID ${userData.teamId} does not exist`);
        }
      }
      
      throw error;
    }
  },

  /**
   * Update existing user
   */
  async updateUser(userId, userData) {
    try {
      console.log('Service - Received userData:', userData);

      // 1. Check if user exists
      const existingUser = await userRepository.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // 2. Remove username from update data (username cannot be changed)
      if (userData.username !== undefined) {
        delete userData.username;
        console.log('Username removed from update data');
      }

      // 3. Validate role-specific rules
      const newRole = userData.role !== undefined ? userData.role : existingUser.role;
      const newTeamId = userData.teamId !== undefined ? userData.teamId : existingUser.team_id;
      
      if (newRole === 'Agent' || newRole === 'Supervisor') {
        if (!newTeamId) { 
          throw new Error('Team ID is required for Agent and Supervisor roles');
        }
      }

      console.log('Service - Updating with:', userData);
      
      // 4. Update user
      await userRepository.update(userId, userData);
      
      // 5. Return updated user
      const updatedUser = await userRepository.findById(userId);
      
      if (!updatedUser) {
        throw new Error('Update failed: User not found after update');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser service:', error);
      
      if (error.message.includes('User not found') || error.message.includes('already deleted')) {
        throw new Error('User not found or already deleted');
      }
      
      throw error;
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
  try {
    // 1. Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found or already deleted');
    }
    
    // 2. Hard delete - permanently remove from database
    await userRepository.hardDelete(userId);
    
    // 3. Return success message
    return { success: true, message: `User ${userId} deleted successfully` };
  } catch (error) {
    console.error('Error in deleteUser service:', error);
    
    if (error.message.includes('User not found or already deleted')) {
      throw new Error('User not found or already deleted');
    }
    
    throw error;
  }
},

  /**
   * Validate username format
   */
  validateUsername(username) {
    const regex = /^(AG|SV|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
    return regex.test(username);
  },

  /**
   * Get role from username prefix
   */
  getRoleFromUsername(username) {
    if (username.startsWith('AG')) return 'Agent';
    if (username.startsWith('SV')) return 'Supervisor';
    if (username.startsWith('AD')) return 'Admin';
    return null;
  }
};

module.exports = userService;