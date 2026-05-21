import React, { useState } from "react";
import { User, LogOut, ChevronDown, Award } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { showToast } from "../../store/slices/toastSlice";
import { useNavigate } from "react-router-dom";

const UserInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(
      showToast({
        type: "success",
        title: "HẸN GẶP LẠI",
        description: "Bạn đã đăng xuất tài khoản thành công!",
      })
    );
    setDropdownOpen(false);
    navigate("/");
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2.5 px-4 py-2 border border-bakery-beige bg-white hover:bg-bakery-bg/30 text-bakery-dark rounded-2xl text-sm font-extrabold shadow-sm transition-all duration-200"
      >
        <div className="w-6 h-6 rounded-full bg-bakery-primary/10 text-bakery-primary flex items-center justify-center font-black text-xs uppercase shadow-sm">
          {
            auth?.user?.name?.charAt(0) ||
            auth?.user?.email?.charAt(0) ||
            "U"
          }
        </div>
        <span className="max-w-[120px] truncate font-extrabold">{auth.user?.name || auth.user?.email}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
          <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white border border-bakery-beige/50 shadow-xl z-50 overflow-hidden py-2 animate-slide-in">
            <div className="px-4 py-3 border-b border-bakery-bg/50">
              <p className="text-xs text-gray-400 font-extrabold uppercase">Thành viên thân thiết</p>
              <p className="text-sm font-black text-bakery-dark truncate mt-0.5">{auth.user?.name || "Khách Aura"}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{auth.user?.email}</p>

              <div className="mt-2.5 inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-200">
                <Award className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Hội viên Aura Gold</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-4 py-3 text-sm font-extrabold text-red-600 hover:bg-red-50/50 transition-colors duration-150 text-left"
            >
              <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserInfo;
