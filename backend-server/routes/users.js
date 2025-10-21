// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validation = require('../middleware/validation');

// GET /api/users
router.get('/',
  validation.validateUserFilters,
  validation.handleValidationErrors,
  userController.getAllUsers
);

// GET /api/users/:id
router.get('/:id',
  validation.validateUserId,
  validation.handleValidationErrors,
  userController.getUserById
);

// POST /api/users
router.post('/',
  validation.validateCreateUser,
  validation.handleValidationErrors,
  userController.createUser
);

// PUT /api/users/:id
router.put('/:id',
  validation.validateUpdateUser,
  validation.handleValidationErrors,
  userController.updateUser
);

// DELETE /api/users/:id
router.delete('/:id',
  validation.validateUserId,
  validation.handleValidationErrors,
  userController.deleteUser
);

module.exports = router;
