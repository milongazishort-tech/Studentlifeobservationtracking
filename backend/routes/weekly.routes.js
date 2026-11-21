const express = require('express');
const router = express.Router();
const weeklyController = require('../controllers/weekly.controller');
const authenticate = require('../middleware/auth.middleware');

// Weekly Analytics Route (Protected by JWT)
router.get('/:weekNumber', authenticate, weeklyController.getSummary);

module.exports = router;
