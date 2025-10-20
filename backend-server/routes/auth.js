// routes/auth.js
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { body, validationResult } = require('express-validator');

/**
 * 🆕 POST /api/auth/login
 * Login without password
 */
router.post(
  '/login',
  // Validation
  body('username')
    .notEmpty().withMessage('Username is required')
    .matches(/^(AG|SP|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/)
    .withMessage('Invalid username format'),

  // Handler
  async (req, res) => {
    try {
      // ✅ Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { username } = req.body;

      // ✅ Login
      const result = await authService.loginWithoutPassword(username);
      res.status(200).json(result);

    } catch (error) {
      console.error('Login error:', error);

      // ✅ ตรวจสอบ error จาก SQLite ที่บอกว่า "no such column: u.fullName"
      if (error.message.includes('no such column: u.fullName')) {
        return res.status(500).json({
          success: false,
          message: 'Database schema mismatch: column "fullName" not found. Please ensure your users table uses "name" instead of "fullName".',
          hint: 'Try updating your database or adjust the SQL query in authService.js to use "u.name AS fullName".'
        });
      }

      // ✅ Map HTTP Status
      let statusCode = 500;
      if (error.message === 'Invalid username') {
        statusCode = 401;
      } else if (error.message === 'User account is inactive') {
        statusCode = 403;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
