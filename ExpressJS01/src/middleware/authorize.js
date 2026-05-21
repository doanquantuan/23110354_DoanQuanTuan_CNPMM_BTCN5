/**
 * Middleware phân quyền (Role-based Authorization)
 * @param  {...string} allowedRoles Danh sách các role được phép truy cập
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Kiểm tra xem user đã qua middleware authenticate (auth.js) chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa xác thực danh tính. Vui lòng đăng nhập.",
        data: null,
      });
    }

    // 2. Kiểm tra quyền hạn
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`>>> [Authorize Middleware] Quyền truy cập bị từ chối. User role: ${req.user.role}, Yêu cầu: ${allowedRoles.join(", ")}`);
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này. Yêu cầu vai trò: [${allowedRoles.join(", ")}]`,
        data: null,
      });
    }

    // 3. Hợp lệ, đi tiếp
    console.log(`>>> [Authorize Middleware] Quyền truy cập hợp lệ. User: ${req.user.email}, Role: ${req.user.role}`);
    next();
  };
};

module.exports = authorize;
