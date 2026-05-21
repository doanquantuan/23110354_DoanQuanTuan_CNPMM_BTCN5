const {
  createUserService,
  loginService,
  getUserService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
  verifyRegisterOtpService,
} = require("../services/userService");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await createUserService(name, email, password);
  return res.status(200).json(data);
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService(email, password);

  return res.status(200).json(data);
};

const getUser = async (req, res) => {
  const data = await getUserService();
  return res.status(200).json(data);
};

const getAccount = async (req, res) => {
  return res.status(200).json(req.user);
};

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  const data = await forgotPasswordService(email);
  return res.status(200).json(data);
};

const handleResetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  const data = await resetPasswordService(email, token, password);
  return res.status(200).json(data);
};

const handleVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const data = await verifyOtpService(email, otp);
  return res.status(200).json(data);
};

const handleVerifyRegisterOtp = async (req, res) => {
  const { email, otp } = req.body;
  const data = await verifyRegisterOtpService(email, otp);
  return res.status(200).json(data);
};

module.exports = {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  handleForgotPassword,
  handleVerifyOtp,
  handleResetPassword,
  handleVerifyRegisterOtp,
};
