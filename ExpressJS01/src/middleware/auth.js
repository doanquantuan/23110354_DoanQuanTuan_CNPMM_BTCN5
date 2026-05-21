require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const white_lists = [
    "/",
    "/register",
    "/login",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/verify-register-otp",
  ];

  // Nếu route nằm trong whitelist, bỏ qua xác thực
  if (white_lists.find((item) => "/v1/api" + item === req.originalUrl)) {
    return next();
  }

  // Lấy token từ header Authorization
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Truy vấn thông tin người dùng mới nhất từ database
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password", "resetToken", "resetTokenExpiry"] }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Người dùng không tồn tại hoặc tài khoản đã bị xóa",
          data: null
        });
      }

      if (user.isVerified === false) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản của bạn chưa được xác thực email",
          data: null
        });
      }

      // Đính kèm thông tin user vào request
      req.user = user.toJSON();
      
      console.log(">>> [Auth Middleware] Xác thực thành công cho user: ", user.email);
      next();
    } catch (error) {
      console.error(">>> [Auth Middleware] Lỗi giải mã token: ", error.message);
      return res.status(401).json({
        success: false,
        message: "Token bị hết hạn hoặc không hợp lệ",
        data: null
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa truyền Access Token ở header/Hoặc token không hợp lệ",
      data: null
    });
  }
};

module.exports = auth;
