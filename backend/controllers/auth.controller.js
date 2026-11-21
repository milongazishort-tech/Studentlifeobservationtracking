const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    const result = await authService.verifyEmail(token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword
};
