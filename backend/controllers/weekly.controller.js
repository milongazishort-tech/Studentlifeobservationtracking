const { getWeeklySummary } = require('../services/aggregation/WeeklyAggregator');

const getSummary = async (req, res, next) => {
  try {
    const timezoneOffset = req.headers['x-timezone-offset'] || 0;
    const result = await getWeeklySummary(req.user.userId, req.params.weekNumber, timezoneOffset);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary
};
