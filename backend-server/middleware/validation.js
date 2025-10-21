// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation Middleware - Complete Working Version
 */

// User creation validation
exports.validateCreateUser = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .matches(/^(AG|SV|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/)
    .withMessage('Username must be in format: AGxxx, SVxxx, or ADxxx (001-999)'),
 
  body('fullName')
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
 
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['Agent', 'Supervisor', 'Admin']).withMessage('Invalid role'),
 
  body('teamId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      const id = Number(value);
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Team ID must be a positive integer');
      }
      return true;
    }),
 
  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
 
  // Custom validation: Agent/Supervisor must have teamId
  body('teamId').custom((value, { req }) => {
    if ((req.body.role === 'Agent' || req.body.role === 'Supervisor') && !value) {
      throw new Error('Team ID is required for Agent and Supervisor roles');
    }
    return true;
  })
];

// User update validation
exports.validateUpdateUser = [
  param('id')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .custom((value) => {
      const id = Number(value);
      if (!Number.isInteger(id) || id < 1) {
        throw new Error(`Invalid user ID: ${value}`);
      }
      return true;
    }),
 
  body('username')
    .optional(),
 
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
 
  body('role')
    .optional()
    .trim()
    .isIn(['Agent', 'Supervisor', 'Admin']).withMessage('Invalid role'),
 
  body('teamId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      const id = Number(value);
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Team ID must be a positive integer');
      }
      return true;
    }),
 
  body('status')
    .optional()
    .trim()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive')
];

// User ID validation - FIXED for DELETE
exports.validateUserId = [
  param('id')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .custom((value) => {
      const id = Number(value);
      if (!Number.isInteger(id) || id < 1) {
        throw new Error(`Invalid user ID: ${value} (type: ${typeof value})`);
      }
      return true;
    })
];

// Query filters validation
exports.validateUserFilters = [
  query('role')
    .optional()
    .trim()
    .isIn(['Agent', 'Supervisor', 'Admin']).withMessage('Invalid role filter'),
 
  query('status')
    .optional()
    .trim()
    .isIn(['Active', 'Inactive']).withMessage('Invalid status filter'),
 
  query('teamId')
    .optional()
    .custom((value) => {
      const id = Number(value);
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('Invalid team ID filter');
      }
      return true;
    })
];

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};