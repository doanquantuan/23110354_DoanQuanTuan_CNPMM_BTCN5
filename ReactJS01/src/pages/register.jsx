import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showToast } from "../store/slices/toastSlice";
import { createUserApi, verifyRegisterOtpApi } from "../util/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Fill form, 2: Verify OTP
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});

  const validateRegister = () => {
    const tempErrors = {};
    if (!name) tempErrors.name = "Vui lòng nhập tên của bạn!";
    if (!email) {
      tempErrors.email = "Vui lòng nhập email!";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email không hợp lệ!";
    }
    if (!password) {
      tempErrors.password = "Vui lòng nhập mật khẩu!";
    } else if (password.length < 6) {
      tempErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    }
    if (!confirmPassword) {
      tempErrors.confirmPassword = "Vui lòng xác nhận mật khẩu!";
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
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

  const onFinishRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setLoading(true);
    try {
      const res = await createUserApi(name, email, password);
      if (res && res.EC === 0) {
        dispatch(
          showToast({
            type: "success",
            title: "ĐĂNG KÝ THÀNH CÔNG",
            description: res?.EM ?? "Mã OTP đã được gửi vào email của bạn. Vui lòng kiểm tra email!",
          })
        );
        setStep(2);
      } else {
        dispatch(
          showToast({
            type: "error",
            title: "ĐĂNG KÝ THẤT BẠI",
            description: res?.EM ?? "Đăng ký thất bại, vui lòng thử lại",
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "error",
          title: "ĐĂNG KÝ THẤT BẠI",
          description: "Có lỗi xảy ra, vui lòng liên hệ quản trị viên.",
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
      const res = await verifyRegisterOtpApi(email, otp);
      if (res && res.EC === 0) {
        dispatch(
          showToast({
            type: "success",
            title: "XÁC THỰC THÀNH CÔNG",
            description: res?.EM ?? "Đăng ký tài khoản thành công! Đang chuyển hướng...",
          })
        );
        setTimeout(() => {
          navigate("/login");
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
          description: "Có lỗi liên kết mạng xảy ra, vui lòng thử lại.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-slide-in">
      <div className="w-full max-w-md">
        <Card
          title={step === 1 ? "Đăng ký thành viên" : "Xác thực tài khoản"}
          legendColor="text-primary-600 text-center !text-2xl font-black uppercase tracking-wide"
          icon={
            <div className="mx-auto bg-primary-50 p-3.5 rounded-full text-primary-600 shadow-sm flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          }
          className="shadow-2xl border border-gray-100"
          footer={
            <div className="flex items-center justify-between text-sm text-gray-500 font-semibold py-1 px-1">
              <Link
                to="/"
                className="inline-flex items-center space-x-1 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Trang chủ</span>
              </Link>
              <div>
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
                  Đăng nhập
                </Link>
              </div>
            </div>
          }
        >
          {step === 1 ? (
            <form onSubmit={onFinishRegister} className="space-y-4 mt-4">
              <Input
                label="Họ và tên"
                name="name"
                type="text"
                placeholder="Nguyễn Văn A"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                icon={
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />

              <Input
                label="Địa chỉ Email"
                name="email"
                type="email"
                placeholder="nguyenvana@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              <Input
                label="Mật khẩu"
                name="password"
                type="password"
                placeholder="Mật khẩu tối thiểu 6 ký tự"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Input
                label="Xác nhận Mật khẩu"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu để xác nhận"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                icon={
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                variant="primary"
                block
                size="lg"
                loading={loading}
                className="bg-bakery-primary hover:bg-bakery-dark text-white font-bold"
              >
                Đăng ký tài khoản
              </Button>
            </form>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100 text-left">
                <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                  Mã xác thực OTP đăng ký đã được gửi đến email: <br />
                  <strong className="text-primary-600 font-bold">{email}</strong>
                </p>
                <p className="text-xs text-amber-600 font-bold mt-2">
                  Vui lòng nhập mã OTP gồm 6 chữ số từ email của bạn để kích hoạt tài khoản.
                </p>
              </div>

              <form onSubmit={onVerifyOtp} className="space-y-5">
                <Input
                  label="Mã OTP xác thực (6 chữ số)"
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

                <Button
                  type="submit"
                  variant="primary"
                  block
                  size="lg"
                  loading={loading}
                  className="bg-bakery-primary hover:bg-bakery-dark text-white font-bold"
                >
                  Kích hoạt tài khoản
                </Button>
              </form>

              <div className="text-center pt-2">
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
                  <span>Thay đổi thông tin / Gửi lại</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
