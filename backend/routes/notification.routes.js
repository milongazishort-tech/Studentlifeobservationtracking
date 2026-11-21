const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  subscribeValidation,
  unsubscribeValidation
} = require('../validators/notification.validators');

// Notification & Web Push Endpoints
router.get('/vapid-public-key', notificationController.getPublicKey);
router.post('/subscribe', authenticate, validate(subscribeValidation), notificationController.subscribe);
router.delete('/unsubscribe', authenticate, validate(unsubscribeValidation), notificationController.unsubscribe);

module.exports = router;
