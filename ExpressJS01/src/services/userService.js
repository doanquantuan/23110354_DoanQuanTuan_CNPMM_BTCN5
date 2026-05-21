require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const saltRounds = 10;

// Configure nodemailer (update with your email settings)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const createUserService = async (name, email, password) => {
  try {
    // Check user exist
    const user = await User.findOne({ where: { email } });
    if (user && user.isVerified === true) {
      console.log(`>>> User exist with email: ${email}`);
      return {
        EC: 1,
        EM: "Email đã được đăng ký",
      };
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Hash user password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    if (user && user.isVerified === false) {
      // Update existing unverified user
      await user.update({
        name: name,
        password: hashPassword,
        otpCode: otp,
        otpExpiry: otpExpiry,
      });
    } else {
      // Save user to database
      await User.create({
        name: name,
        email: email,
        password: hashPassword,
        role: "User",
        otpCode: otp,
        otpExpiry: otpExpiry,
        isVerified: false,
      });
    }

    // Send register verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác thực OTP đăng ký tài khoản",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
          <h2 style="color: #52c41a; text-align: center; border-bottom: 2px solid #52c41a; padding-bottom: 10px;">Xác thực đăng ký tài khoản</h2>
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã đăng ký thành viên. Vui lòng sử dụng mã xác thực (OTP) dưới đây để hoàn tất đăng ký tài khoản của bạn:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #52c41a; letter-spacing: 5px; background: #f6ffed; padding: 10px 25px; border-radius: 5px; border: 1px dashed #b7eb8f;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #fa8c16; font-weight: bold;">Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút.</p>
          <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      EC: 0,
      EM: "Mã OTP xác thực đăng ký đã được gửi đến email",
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: "Lỗi từ server",
    };
  }
};

const loginService = async (email, password) => {
  try {
    // Fetch user by email
    const user = await User.findOne({ where: { email: email } });

    if (user) {
      // Compare password
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return {
          EC: 2,
          EM: "Email/Password không hợp lệ",
        };
      } else {
        // Check if verified
        if (user.isVerified === false) {
          return {
            EC: 3,
            EM: "Tài khoản của bạn chưa được xác thực email. Vui lòng xác thực trước khi đăng nhập.",
          };
        }

        // Create an access token
        const payload = {
          email: user.email,
          name: user.name,
          id: user.id,
          role: user.role,
        };

        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });
        return {
          EC: 0,
          access_token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }
    } else {
      return {
        EC: 1,
        EM: "Email/Password không hợp lệ",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: "Lỗi từ server",
    };
  }
};

const getUserService = async (email) => {
  try {
    let result = await User.findAll({
      attributes: { exclude: ["password", "resetToken", "resetTokenExpiry"] },
    });
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const forgotPasswordService = async (email) => {
  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại trong hệ thống",
      };
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to user
    await user.update({
      otpCode: otp,
      otpExpiry: otpExpiry,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã xác thực OTP đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
          <h2 style="color: #1890ff; text-align: center; border-bottom: 2px solid #1890ff; padding-bottom: 10px;">Đặt lại mật khẩu</h2>
          <p style="font-size: 16px; color: #333;">Xin chào,</p>
          <p style="font-size: 16px; color: #333;">Bạn đã yêu cầu khôi phục mật khẩu. Vui lòng sử dụng mã xác thực (OTP) dưới đây để tiến hành xác nhận email của bạn:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #1890ff; letter-spacing: 5px; background: #e6f7ff; padding: 10px 25px; border-radius: 5px; border: 1px dashed #91d5ff;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #fa8c16; font-weight: bold;">Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút.</p>
          <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      EC: 0,
      EM: "Mã OTP đã được gửi đến email của bạn",
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: "Lỗi từ server",
    };
  }
};

const verifyOtpService = async (email, otp) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại trong hệ thống",
      };
    }

    if (!user.otpCode || user.otpCode !== otp) {
      return {
        EC: 2,
        EM: "Mã OTP không chính xác",
      };
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return {
        EC: 3,
        EM: "Mã OTP đã hết hạn",
      };
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token and clear OTP code
    await user.update({
      resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry,
      otpCode: null,
      otpExpiry: null,
    });

    return {
      EC: 0,
      EM: "Mã OTP hợp lệ",
      resetToken: resetToken,
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: "Lỗi từ server",
    };
  }
};

const resetPasswordService = async (email, token, newPassword) => {
  try {
    // Find user with matching email and token
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return {
        EC: 1,
        EM: "Người dùng không tồn tại",
      };
    }

    // Check if token is valid and not expired
    if (user.resetToken !== token) {
      return {
        EC: 2,
        EM: "Token không hợp lệ",
      };
    }

    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return {
        EC: 3,
        EM: "Token đã hết hạn",
      };
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token
    await user.update({
      password: hashPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return {
      EC: 0,
      EM: "Mật khẩu đã được đặt lại thành công",
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: "Lỗi từ server",
    };
  }
};

const verifyRegisterOtpService = async (email, otp) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại trong hệ thống",
      };
    }

    if (user.isVerified === true) {
      return {
        EC: 4,
        EM: "Tài khoản đã được xác thực trước đó",
      };
    }

    if (!user.otpCode || user.otpCode !== otp) {
      return {
        EC: 2,
        EM: "Mã OTP không chính xác",
      };
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return {
        EC: 3,
        EM: "Mã OTP đã hết hạn",
      };
    }

    // Update user to verified and clear OTP
    await user.update({
      isVerified: true,
      otpCode: null,
      otpExpiry: null,
    });

    return {
      EC: 0,
      EM: "Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay.",
    };
  } catch (error) {
    console.log(error);
    return {
      EC: -1,
      EM: "Lỗi từ server",
    };
  }
};

module.exports = {
  createUserService,
  loginService,
  getUserService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
  verifyRegisterOtpService,
};
