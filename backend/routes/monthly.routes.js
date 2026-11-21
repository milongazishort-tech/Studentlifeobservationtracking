const express = require('express');
const router = express.Router();
const monthlyController = require('../controllers/monthly.controller');
const authenticate = require('../middleware/auth.middleware');

// Monthly Life Stage & Insights Route (Protected by JWT)
router.get('/:cycleId', authenticate, monthlyController.getReport);

module.exports = router;
