const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  handleForgotPassword,
  handleVerifyOtp,
  handleResetPassword,
  handleVerifyRegisterOtp,
} = require("../controllers/userController");
const {
  getProducts,
  getProductById,
  getBestSellers,
  getMostViewed,
} = require("../controllers/productController");

// Import các middleware bảo mật mới
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validation");
const rateLimiter = require("../middleware/rateLimiter");
const delay = require("../middleware/delay");

const routerAPI = express.Router();

// --- 1. Cấu hình Rate Limiting ---
// Giới hạn chung cho toàn bộ các API: Tối đa 100 requests trong 15 phút
const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Giới hạn nghiêm ngặt cho các API nhạy cảm (Authentication): Tối đa 10 requests trong 5 phút
const authRateLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10
});

// Áp dụng Rate Limiter chung cho toàn bộ API routes
routerAPI.use(generalRateLimiter);


// --- 2. Định nghĩa Schema Validation ---
const registerSchema = {
  body: {
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  }
};

const loginSchema = {
  body: {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 }
  }
};

const otpVerifySchema = {
  body: {
    email: { required: true, email: true },
    otp: { required: true, minLength: 6, maxLength: 6 }
  }
};

const forgotPasswordSchema = {
  body: {
    email: { required: true, email: true }
  }
};

const resetPasswordSchema = {
  body: {
    email: { required: true, email: true },
    token: { required: true },
    password: { required: true, minLength: 6 }
  }
};


// --- 3. Đăng ký các Route API ---

routerAPI.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Chào mừng bạn đến với hệ thống API bảo mật",
    data: "Hello world api"
  });
});

// Public routes (không cần xác thực danh tính, nhưng có giới hạn tần suất chặt chẽ và Validate dữ liệu)
routerAPI.post("/register", authRateLimiter, validate(registerSchema), createUser);
routerAPI.post("/login", authRateLimiter, validate(loginSchema), handleLogin);
routerAPI.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), handleForgotPassword);
routerAPI.post("/verify-otp", authRateLimiter, validate(otpVerifySchema), handleVerifyOtp);
routerAPI.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), handleResetPassword);
routerAPI.post("/verify-register-otp", authRateLimiter, validate(otpVerifySchema), handleVerifyRegisterOtp);

// Products routes (Công khai, áp dụng rate limiter chung)
routerAPI.get("/products/best-seller", getBestSellers);
routerAPI.get("/products/most-viewed", getMostViewed);
routerAPI.get("/products", getProducts);
routerAPI.get("/products/:id", getProductById);


// --- 4. Protected routes (Yêu cầu xác thực Authentication) ---
routerAPI.use(auth);

// Lấy danh sách toàn bộ users: Chỉ dành riêng cho Admin (Authorization)
routerAPI.get("/user", authorize("Admin"), getUser);

// Lấy thông tin tài khoản cá nhân: Dành cho bất kỳ ai đã đăng nhập (User, Admin)
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI;
