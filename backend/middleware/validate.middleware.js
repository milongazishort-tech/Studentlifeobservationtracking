const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Helper middleware that executes express-validator rules
 * and delegates formatting to the centralized errorHandler.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const firstError = errors.array()[0];
    const field = firstError.path || firstError.param || null;
    return next(new ValidationError(firstError.msg, field));
  };
};

module.exports = validate;
