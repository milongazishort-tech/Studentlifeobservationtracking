const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateProfileValidation } = require('../validators/auth.validators');

// User & Profile Routes (Protected by JWT authentication)
router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, validate(updateProfileValidation), userController.updateProfile);
router.delete('/me', authenticate, userController.deleteAccount);

module.exports = router;
