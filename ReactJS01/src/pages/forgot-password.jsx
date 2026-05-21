import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showToast } from "../store/slices/toastSlice";
import { forgotPasswordApi, verifyOtpApi } from "../util/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = "Vui lòng nhập email!";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email không hợp lệ!";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateOtp = () => {
    const tempErrors = {};
    if (!otp) {
      tempErrors.otp = "Vui lòng nhập mã OTP!";
    } else if (otp.length !== 6) {
      tempErrors.otp = "Mã OTP phải có đúng 6 chữ số!";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const res = await forgotPasswordApi(email);
      if (res && res.EC === 0) {
        dispatch(
          showToast({
            type: "success",
            title: "GỬI MÃ OTP THÀNH CÔNG",
            description: res?.EM ?? "Mã OTP đã được gửi vào email của bạn",
          })
        );
        setStep(2);
      } else {
        dispatch(
          showToast({
            type: "error",
            title: "GỬI MÃ OTP THẤT BẠI",
            description: res?.EM ?? "Không thể gửi OTP, vui lòng thử lại",
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "error",
          title: "GỬI MÃ OTP THẤT BẠI",
          description: "Có lỗi xảy ra trong lúc gửi yêu cầu.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setLoading(true);
    try {
      const res = await verifyOtpApi(email, otp);
      if (res && res.EC === 0) {
        dispatch(
          showToast({
            type: "success",
            title: "XÁC THỰC THÀNH CÔNG",
            description: res?.EM ?? "Mã OTP hợp lệ, đang chuyển hướng...",
          })
        );
        setTimeout(() => {
          navigate(`/reset-password?token=${res.resetToken}&email=${email}`);
        }, 1500);
      } else {
        dispatch(
          showToast({
            type: "error",
            title: "XÁC THỰC THẤT BẠI",
            description: res?.EM ?? "Mã OTP không chính xác hoặc đã hết hạn",
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "error",
          title: "XÁC THỰC THẤT BẠI",
          description: "Mạng kết nối không khả dụng lúc này.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-slide-in">
      <div className="w-full max-w-md">
        <Card
          title="Quên mật khẩu"
          legendColor="text-primary-600 text-center !text-2xl font-black uppercase tracking-wide"
          icon={
            <div className="mx-auto bg-primary-50 p-3.5 rounded-full text-primary-600 shadow-sm flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m-5-3a5 5 0 11-5 5 5 5 0 015-5z" />
              </svg>
            </div>
          }
          className="shadow-2xl border border-gray-100"
          footer={
            <div className="flex items-center justify-between text-sm text-gray-500 font-semibold py-1 px-1">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Đăng nhập</span>
              </Link>
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
                Đăng ký tài khoản
              </Link>
            </div>
          }
        >
          {step === 1 ? (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-gray-500 text-left leading-relaxed">
                Nhập email của bạn để nhận mã OTP gồm 6 chữ số dùng để xác minh và đặt lại mật khẩu mới.
              </p>
              <form onSubmit={onSendOtp} className="space-y-5">
                <Input
                  label="Địa chỉ Email"
                  name="email"
                  type="email"
                  placeholder="nhapemailcuaban@gmail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  icon={
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <Button type="submit" variant="primary" block size="lg" loading={loading} className="bg-bakery-primary hover:bg-bakery-dark text-white font-bold">
                  Gửi mã OTP xác thực
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-4 mt-2 text-left">
              <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100 text-left">
                <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                  Mã xác thực OTP đã được gửi đến email: <br />
                  <strong className="text-primary-600 font-bold">{email}</strong>
                </p>
                <p className="text-xs text-amber-600 font-bold mt-2">
                  Vui lòng nhập mã OTP để tiếp tục đặt lại mật khẩu mới.
                </p>
              </div>

              <form onSubmit={onVerifyOtp} className="space-y-5">
                <Input
                  label="Mã OTP (6 chữ số)"
                  name="otp"
                  type="text"
                  placeholder="123456"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  error={errors.otp}
                  style={{
                    letterSpacing: "4px",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                  icon={
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <Button type="submit" variant="primary" block size="lg" loading={loading} className="bg-bakery-primary hover:bg-bakery-dark text-white font-bold">
                  Xác thực mã OTP
                </Button>
              </form>

              <div className="bg-bakery-primary hover:bg-bakery-dark text-white font-bold">
                <Button
                  variant="link"
                  onClick={() => {
                    setStep(1);
                    setErrors({});
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center justify-center space-x-1 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Thay đổi email khác</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
