// Bộ lưu trữ số lượt gọi của từng IP trong bộ nhớ RAM (In-memory store)
const rateLimitStore = new Map();

/**
 * Middleware giới hạn tần suất yêu cầu (IP-based Rate Limiting)
 * @param {Object} options Cấu hình giới hạn tần suất
 * @param {number} options.windowMs Khoảng thời gian theo dõi (mili-giây), mặc định 15 phút
 * @param {number} options.max Số lượng yêu cầu tối đa cho phép trong windowMs, mặc định 100
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 phút mặc định
  const max = 100; // Tối đa 100 request

  // Thường xuyên dọn dẹp các IP đã hết hạn trong Store để tránh rò rỉ bộ nhớ (Memory leaks)
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    // Lấy IP của Client (xử lý trường hợp chạy sau Proxy như Nginx/Cloudflare)
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    let clientData = rateLimitStore.get(ip);

    // 1. Nếu IP chưa từng gửi request hoặc đã qua thời gian reset
    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(ip, clientData);
    } else {
      // 2. IP đang trong cửa sổ thời gian giới hạn, tăng số đếm
      clientData.count++;
    }

    // Thiết lập các HTTP Header tiêu chuẩn cho Rate Limiting
    const remaining = Math.max(0, max - clientData.count);
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", new Date(clientData.resetTime).toUTCString());

    // 3. Nếu vượt quá số lượt cho phép
    if (clientData.count > max) {
      console.log(`>>> [Rate Limiter] IP ${ip} vượt quá giới hạn (${clientData.count}/${max} requests).`);
      return res.status(429).json({
        success: false,
        message: "Bạn đã gửi quá nhiều yêu cầu lên hệ thống. Vui lòng thử lại sau.",
        data: null,
      });
    }

    // Hợp lệ, cho đi tiếp
    next();
  };
};

module.exports = rateLimiter;
