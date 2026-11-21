const cycleService = require('../services/cycle.service');

const startCycle = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await cycleService.startCycle(req.user.userId, req.body, timezoneOffset);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getActiveCycle = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await cycleService.getActiveCycle(req.user.userId, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCycleHistory = async (req, res, next) => {
  try {
    const result = await cycleService.getCycleHistory(req.user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const abandonCycle = async (req, res, next) => {
  try {
    const result = await cycleService.abandonCycle(req.user.userId, req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startCycle,
  getActiveCycle,
  getCycleHistory,
  abandonCycle
};
