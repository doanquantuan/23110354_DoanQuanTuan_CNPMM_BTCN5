/**
 * Middleware kiểm tra và xác thực dữ liệu đầu vào (Request Validation)
 * @param {Object} schema Schema định nghĩa các quy tắc kiểm tra
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Duyệt qua các vùng dữ liệu: body, query, params
    for (const location of ["body", "query", "params"]) {
      if (schema[location]) {
        const data = req[location] || {};
        const rules = schema[location];

        for (const field in rules) {
          const rule = rules[field];
          const value = data[field];

          // 1. Kiểm tra trường bắt buộc (required)
          if (rule.required && (value === undefined || value === null || value === "")) {
            errors.push(`Trường '${field}' trong ${location} là bắt buộc.`);
            continue;
          }

          // Nếu không bắt buộc và không truyền giá trị, bỏ qua các kiểm tra khác
          if (value === undefined || value === null || value === "") {
            continue;
          }

          // 2. Kiểm tra kiểu dữ liệu (type)
          if (rule.type) {
            if (rule.type === "number") {
              if (isNaN(Number(value))) {
                errors.push(`Trường '${field}' trong ${location} phải là số.`);
              }
            } else if (typeof value !== rule.type) {
              errors.push(`Trường '${field}' trong ${location} phải có kiểu dữ liệu là ${rule.type}.`);
            }
          }

          // 3. Kiểm tra định dạng email
          if (rule.email) {
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(String(value).toLowerCase())) {
              errors.push(`Trường '${field}' trong ${location} không đúng định dạng email.`);
            }
          }

          // 4. Kiểm tra độ dài tối thiểu (minLength)
          if (rule.minLength !== undefined && String(value).length < rule.minLength) {
            errors.push(`Trường '${field}' trong ${location} phải có ít nhất ${rule.minLength} ký tự.`);
          }

          // 5. Kiểm tra độ dài tối đa (maxLength)
          if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
            errors.push(`Trường '${field}' trong ${location} chỉ được phép tối đa ${rule.maxLength} ký tự.`);
          }

          // 6. Kiểm tra mẫu khớp (regex pattern)
          if (rule.pattern && !rule.pattern.test(String(value))) {
            errors.push(`Trường '${field}' trong ${location} có định dạng không hợp lệ.`);
          }
        }
      }
    }

    // Nếu có lỗi, trả về phản hồi 400 chuẩn hóa JSON
    if (errors.length > 0) {
      console.log(">>> [Validation Middleware] Lỗi kiểm tra dữ liệu đầu vào: ", errors);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.",
        data: errors,
      });
    }

    // Dữ liệu hợp lệ, đi tiếp
    next();
  };
};

module.exports = validate;
