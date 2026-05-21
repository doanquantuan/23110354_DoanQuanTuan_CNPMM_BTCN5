import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuth, setActionLoading } from "../store/slices/authSlice";
import { showToast } from "../store/slices/toastSlice";
import { loginApi } from "../util/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.actionLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
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
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(setActionLoading(true));
    try {
      const res = await loginApi(email, password);

      if (res && res.EC === 0) {
        localStorage.setItem("access_token", res.access_token);
        dispatch(
          showToast({
            type: "success",
            title: "ĐĂNG NHẬP THÀNH CÔNG",
            description: "Chúc mừng bạn đã đăng nhập thành công!",
          })
        );
        dispatch(
          setAuth({
            isAuthenticated: true,
            user: {
              email: res?.user?.email ?? "",
              name: res?.user?.name ?? "",
            },
          })
        );
        navigate("/");
      } else {
        dispatch(
          showToast({
            type: "error",
            title: "ĐĂNG NHẬP THẤT BẠI",
            description: res?.EM ?? "Thông tin tài khoản hoặc mật khẩu không chính xác",
          })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "error",
          title: "ĐĂNG NHẬP THẤT BẠI",
          description: "Có lỗi xảy ra trong quá trình kết nối.",
        })
      );
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-slide-in">
      <div className="w-full max-w-md">
        <Card
          title="Đăng nhập tài khoản"
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
            <div className="text-center text-sm text-gray-500 font-semibold py-1">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold transition-colors">
                Đăng ký ngay
              </Link>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <Input
              label="Địa chỉ Email"
              name="email"
              type="email"
              placeholder="ten@viethanh.edu.vn"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <div>
              <Input
                label="Mật khẩu"
                name="password"
                type="password"
                placeholder="••••••••"
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
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" block size="lg" loading={loading} className="bg-bakery-primary hover:bg-bakery-dark text-white font-bold">
              Đăng nhập hệ thống
            </Button>
          </form>

          <div className="flex items-center justify-center pt-4 border-t border-gray-50">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Quay lại trang chủ</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
