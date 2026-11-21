const { body } = require('express-validator');

/**
 * Validation for web push subscription
 */
const subscribeValidation = [
  body('endpoint')
    .trim()
    .notEmpty().withMessage('Push service endpoint URL is required.')
    .isURL().withMessage('Endpoint must be a valid URL.'),
  body('keys')
    .notEmpty().withMessage('Encryption keys object is required.'),
  body('keys.p256dh')
    .trim()
    .notEmpty().withMessage('Client public encryption key (p256dh) is required.'),
  body('keys.auth')
    .trim()
    .notEmpty().withMessage('Client authentication secret (auth) is required.')
];

/**
 * Validation for web push unsubscription
 */
const unsubscribeValidation = [
  body('endpoint')
    .trim()
    .notEmpty().withMessage('Push service endpoint URL is required.')
];

module.exports = {
  subscribeValidation,
  unsubscribeValidation
};
