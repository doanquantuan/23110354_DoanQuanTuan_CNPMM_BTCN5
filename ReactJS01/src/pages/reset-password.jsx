import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showToast } from "../store/slices/toastSlice";
import { resetPasswordApi } from "../util/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const validate = () => {
    const tempErrors = {};
    if (!password) {
      tempErrors.password = "Vui lòng nhập mật khẩu mới!";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token || !email) {
      dispatch(
        showToast({
          type: "error",
          title: "ĐẶT LẠI MẬT KHẨU",
          description: "Liên kết không hợp lệ hoặc đã hết hạn",
        })
      );
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordApi(email, token, password);
      if (res && res.EC === 0) {
        dispatch(
          showToast({
            type: "success",
            title: "ĐẶT LẠI MẬT KHẨU THÀNH CÔNG",
            description: res?.EM ?? "Mật khẩu đã được đặt lại thành công! Đang chuyển hướng...",
          })
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        dispatch(
          showToast({
            type: "error",
            title: "XÁC THỰC THẤT BẠI",
            description: res?.EM ?? "Đặt lại mật khẩu thất bại, vui lòng thử lại.",
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "error",
          title: "LỖI KẾT NỐI",
          description: "Đường truyền mạng lỗi, vui lòng thử lại.",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-slide-in">
        <div className="w-full max-w-md">
          <Card
            title="Liên kết không hợp lệ"
            legendColor="text-red-600 text-center font-bold"
            icon={
              <div className="mx-auto bg-red-50 p-3 rounded-full text-red-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            }
          >
            <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu một liên kết mới.
            </p>
            <div className="pt-4 text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-bold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Quay lại yêu cầu mã OTP</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-slide-in">
      <div className="w-full max-w-md">
        <Card
          title="Đặt lại mật khẩu"
          legendColor="text-primary-600 text-center !text-2xl font-black uppercase tracking-wide"
          icon={
            <div className="mx-auto bg-primary-50 p-3.5 rounded-full text-primary-600 shadow-sm flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
          <div className="space-y-4 mt-2">
            <div className="bg-primary-50/50 rounded-xl p-4.5 border border-primary-100 text-left">
              <p className="text-sm text-gray-600 font-semibold leading-relaxed">
                Nhập mật khẩu mới cho tài khoản: <br />
                <strong className="text-primary-600 font-bold">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Mật khẩu mới"
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
                label="Xác nhận mật khẩu mới"
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

              <Button type="submit" variant="primary" block size="lg" loading={loading} className="bg-bakery-primary hover:bg-bakery-dark text-white font-bold">
                Đổi mật khẩu tài khoản
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
