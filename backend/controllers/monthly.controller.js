const { getMonthlyReport } = require('../services/aggregation/MonthlyAggregator');

const getReport = async (req, res, next) => {
  try {
    const result = await getMonthlyReport(req.user.userId, req.params.cycleId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReport
};
