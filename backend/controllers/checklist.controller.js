const checklistService = require('../services/checklist.service');

const submitTodayChecklist = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await checklistService.submitTodayChecklist(req.user.userId, req.body, timezoneOffset);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateTodayChecklist = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await checklistService.updateTodayChecklist(req.user.userId, req.body, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateYesterdayChecklist = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await checklistService.updateYesterdayChecklist(req.user.userId, req.body, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getTodayActivity = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await checklistService.getTodayActivity(req.user.userId, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getActivityByDate = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await checklistService.getActivityByDate(req.user.userId, req.params.date, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitTodayChecklist,
  updateTodayChecklist,
  updateYesterdayChecklist,
  getTodayActivity,
  getActivityByDate
};
