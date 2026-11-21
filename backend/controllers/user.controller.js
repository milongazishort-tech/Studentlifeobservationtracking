const userService = require('../services/user.service');

const getProfile = async (req, res, next) => {
  try {
    const result = await userService.getProfile(req.user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const result = await userService.updateProfile(req.user.userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const result = await userService.deleteAccount(req.user.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
