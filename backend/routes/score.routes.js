const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/score.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { dateParamValidation } = require('../validators/checklist.validators');

// Daily Score Endpoints (Protected by JWT authentication)
router.get('/today', authenticate, scoreController.getTodayScore);
router.get('/cycle/:cycleId', authenticate, scoreController.getCycleScores);
router.get('/:date', authenticate, validate(dateParamValidation), scoreController.getScoreByDate);

module.exports = router;
