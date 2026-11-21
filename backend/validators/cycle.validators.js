const { body, param } = require('express-validator');
const { normalizeToMidnight } = require('../utils/date.utils');

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Validator for starting a new cycle
 */
const startCycleValidation = [
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO8601 date string.')
    .custom((value, { req }) => {
      const offset = req.headers['x-timezone-offset'] || 0;
      const startMidnight = normalizeToMidnight(value, offset);
      const todayMidnight = normalizeToMidnight(new Date(), offset);

      if (startMidnight.getTime() > todayMidnight.getTime()) {
        throw new Error('Cycle start date cannot be scheduled in the future.');
      }
      return true;
    }),
  body('targetWakeUpTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Target wake-up time must follow HH:mm format (00:00 - 23:59).'),
  body('targetSleepTime')
    .optional()
    .matches(TIME_REGEX).withMessage('Target sleep time must follow HH:mm format (00:00 - 23:59).')
];

/**
 * Validator for cycle ID parameter
 */
const cycleIdParamValidation = [
  param('id')
    .isMongoId().withMessage('Invalid cycle ID format.')
];

module.exports = {
  startCycleValidation,
  cycleIdParamValidation
};
