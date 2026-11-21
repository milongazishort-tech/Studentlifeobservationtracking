const { body, param } = require('express-validator');

/**
 * Validation rules for checklist submission and updates
 */
const checklistValidation = [
  body('isOffDay')
    .optional()
    .isBoolean().withMessage('isOffDay must be a boolean.'),
  body('item1_earlyMorning')
    .optional()
    .isBoolean().withMessage('item1_earlyMorning must be a boolean.'),
  body('item2_universityAttendance')
    .optional()
    .isIn(['yes', 'no', 'off_day']).withMessage('item2_universityAttendance must be "yes", "no", or "off_day".'),
  body('item3_classParticipation_attended')
    .optional()
    .isInt({ min: 0 }).withMessage('item3_classParticipation_attended must be a non-negative integer.')
    .custom((attended, { req }) => {
      const total = req.body.item3_classParticipation_total;
      const isOffDay = req.body.isOffDay || req.body.item2_universityAttendance === 'off_day';
      if (!isOffDay && total !== undefined && attended > total) {
        throw new Error('Attended classes cannot exceed total scheduled classes.');
      }
      return true;
    }),
  body('item3_classParticipation_total')
    .optional()
    .isInt({ min: 0 }).withMessage('item3_classParticipation_total must be a non-negative integer.'),
  body('item4_personalDiscipline')
    .optional()
    .isBoolean().withMessage('item4_personalDiscipline must be a boolean.'),
  body('item5_socialInteractions')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('item5_socialInteractions must be between 0 and 50.'),
  body('item6_dailyLearning')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('item6_dailyLearning cannot exceed 500 characters.')
    .escape(),
  body('item6_dailyLearning_text')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('item6_dailyLearning_text cannot exceed 500 characters.')
    .escape(),
  body('item7_physicalActivity')
    .optional()
    .isBoolean().withMessage('item7_physicalActivity must be a boolean.'),
  body('item7_physicalMinutes')
    .optional()
    .isInt({ min: 0, max: 1440 }).withMessage('item7_physicalMinutes must be between 0 and 1440 minutes.'),
  body('item8_skillDevelopmentMinutes')
    .optional()
    .isInt({ min: 0, max: 1440 }).withMessage('item8_skillDevelopmentMinutes must be between 0 and 1440 minutes.'),
  body('item9_classWorkRecap')
    .optional()
    .isBoolean().withMessage('item9_classWorkRecap must be a boolean.'),
  body('item10_socialMediaControl')
    .optional()
    .isIn(['controlled', 'useful', 'excessive']).withMessage('item10_socialMediaControl must be "controlled", "useful", or "excessive".'),
  body('item11_selfReflection')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('item11_selfReflection cannot exceed 500 characters.')
    .escape(),
  body('item11_selfReflection_text')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('item11_selfReflection_text cannot exceed 500 characters.')
    .escape(),
  body('item12_sleepOnTime')
    .optional()
    .isBoolean().withMessage('item12_sleepOnTime must be a boolean.')
];

/**
 * Validation for ISO date param
 */
const dateParamValidation = [
  param('date')
    .isISO8601().withMessage('Date must be in valid ISO format (YYYY-MM-DD).')
];

module.exports = {
  checklistValidation,
  dateParamValidation
};
