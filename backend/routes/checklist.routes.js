const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklist.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { checklistValidation, dateParamValidation } = require('../validators/checklist.validators');

// Daily Checklist Endpoints (Protected by JWT authentication)
router.post('/', authenticate, validate(checklistValidation), checklistController.submitTodayChecklist);
router.put('/today', authenticate, validate(checklistValidation), checklistController.updateTodayChecklist);
router.put('/yesterday', authenticate, validate(checklistValidation), checklistController.updateYesterdayChecklist);
router.get('/today', authenticate, checklistController.getTodayActivity);
router.get('/:date', authenticate, validate(dateParamValidation), checklistController.getActivityByDate);

module.exports = router;
