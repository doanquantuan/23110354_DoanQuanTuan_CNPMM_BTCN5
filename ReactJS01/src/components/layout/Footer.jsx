import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Heart, Send } from "lucide-react";
import { useDispatch } from "react-redux";
import { showToast } from "../../store/slices/toastSlice";

const Footer = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      dispatch(
        showToast({
          type: "success",
          title: "ĐĂNG KÝ THÀNH CÔNG",
          description: "Cảm ơn bạn đã đăng ký nhận thông tin ưu đãi từ Aura Bakery!",
        })
      );
      setEmail("");
    }
  };

  return (
    <footer className="bg-stone-100 text-stone-600 mt-20 border-t border-stone-200 font-sans">
      {/* Top Newsletter banner section */}
      <div className="border-b border-stone-200 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left space-y-2 max-w-lg">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Bản tin Aura Patisserie
            </h3>
            <p className="text-xs text-stone-500 font-medium leading-relaxed">
              Nhận thông tin về các mẻ bánh mới ra lò, ưu đãi đặc quyền theo mùa và công thức làm bánh độc quyền.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="relative w-full max-w-md flex items-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn..."
              className="w-full pl-0 pr-12 py-3 bg-transparent border-b border-stone-300 focus:border-stone-800 text-stone-900 placeholder-stone-400 text-xs font-semibold focus:outline-none transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-0 p-2 text-stone-400 hover:text-stone-900 transition-colors duration-200"
            >
              <Send className="w-4 h-4 stroke-[2]" />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer columns */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 text-left text-xs leading-relaxed">
        {/* About column */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center">
            <span className="font-serif font-black text-lg text-stone-900 tracking-wider">
              AURA BAKERY
            </span>
          </Link>
          <p className="text-stone-500 font-medium">
            Tiệm bánh ngọt Aura cam kết đem đến những mẻ bánh nướng thủ công thơm ngon hảo hạng, sử dụng 100% nguyên liệu cao cấp chuẩn Âu để thăng hoa vị giác của bạn.
          </p>
        </div>

        {/* Categories column */}
        <div className="space-y-4">
          <h4 className="text-stone-900 font-bold uppercase tracking-widest text-[10px]">
            Sản phẩm
          </h4>
          <ul className="space-y-2.5 font-medium text-stone-500">
            <li><Link to="/shop?category=Bánh Kem" className="hover:text-stone-900 transition-colors">Bánh Kem Signature</Link></li>
            <li><Link to="/shop?category=Croissant" className="hover:text-stone-900 transition-colors">Bánh Croissant Bơ Pháp</Link></li>
            <li><Link to="/shop?category=Bánh Ngọt" className="hover:text-stone-900 transition-colors">Bánh Tiramisu Ý</Link></li>
            <li><Link to="/shop?category=Combo" className="hover:text-stone-900 transition-colors">Set Trà Chiều Hoàng Gia</Link></li>
          </ul>
        </div>

        {/* Operating hours column */}
        <div className="space-y-4">
          <h4 className="text-stone-900 font-bold uppercase tracking-widest text-[10px]">
            Giờ mở cửa
          </h4>
          <ul className="space-y-2.5 font-medium text-stone-500">
            <li>Thứ Hai - Thứ Sáu: 07:00 - 21:00</li>
            <li>Thứ Bảy - Chủ Nhật: 08:00 - 22:00</li>
            <li className="text-stone-700 font-semibold italic">Giao hàng tận nơi trong 30 phút</li>
          </ul>
        </div>

        {/* Contact info column */}
        <div className="space-y-4">
          <h4 className="text-stone-900 font-bold uppercase tracking-widest text-[10px]">
            Liên hệ
          </h4>
          <ul className="space-y-3 font-medium text-stone-500">
            <li className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>Đại học CNTT & TT Việt - Hàn, Đường Trần Đại Nghĩa, Đà Nẵng</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-stone-400" />
              <span>Hotline: <strong className="text-stone-900 font-semibold">1900 8198</strong></span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-stone-400" />
              <span>lienhe@aurabakery.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright area */}
      <div className="border-t border-stone-200 py-8 px-6 text-center text-[10px] text-stone-500 font-bold bg-stone-200/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; 2026 Aura Bakery. All rights reserved.</span>
          <span className="flex items-center space-x-1 font-medium">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>in Vietnam</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
