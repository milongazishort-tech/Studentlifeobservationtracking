const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycle.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { startCycleValidation, cycleIdParamValidation } = require('../validators/cycle.validators');

// Cycle Lifecycle Endpoints (Protected by JWT authentication)
router.post('/', authenticate, validate(startCycleValidation), cycleController.startCycle);
router.get('/active', authenticate, cycleController.getActiveCycle);
router.get('/', authenticate, cycleController.getCycleHistory);
router.patch('/:id/abandon', authenticate, validate(cycleIdParamValidation), cycleController.abandonCycle);

module.exports = router;
