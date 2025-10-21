// services/authService.js
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository'); // Assuming this is still used for other auth-related tasks

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

/**
 * Authentication Service
 * Removed loginWithoutPassword method
 */
const authService = {
    // -------------------------------------------------------------
    // REMOVED: loginWithoutPassword method was here
    // -------------------------------------------------------------

    /**
     * Verify JWT token
     */
    verifyToken: (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
};

module.exports = authService;