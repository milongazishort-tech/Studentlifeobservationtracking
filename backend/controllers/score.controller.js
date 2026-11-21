const checklistService = require('../services/checklist.service');

const getTodayScore = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await checklistService.getTodayScore(req.user.userId, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getScoreByDate = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await checklistService.getScoreByDate(req.user.userId, req.params.date, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCycleScores = async (req, res, next) => {
  try {
    const result = await checklistService.getCycleScores(req.user.userId, req.params.cycleId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayScore,
  getScoreByDate,
  getCycleScores
};
