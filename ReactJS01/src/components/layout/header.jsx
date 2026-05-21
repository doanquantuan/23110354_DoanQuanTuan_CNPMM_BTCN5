import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingBag, Menu, X } from "lucide-react";
import { toggleCart } from "../../store/slices/cartSlice";
import SearchBar from "../ui/SearchBar";
import UserInfo from "../ui/UserInfo";
import CartDrawer from "../ui/CartDrawer";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname + location.search === path;
  };

  const navLinks = [
    { label: "Trang chủ", path: "/" },
    { label: "Cửa hàng", path: "/shop" },
    { label: "Bánh ngọt", path: "/shop?category=Bánh Ngọt" },
    { label: "Combo", path: "/shop?category=Combo" },
    { label: "Khuyến mãi", path: "/shop?category=Khuyến Mãi" },
  ];

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="font-serif font-extrabold text-xl text-stone-900 tracking-wider uppercase">
                Aura Bakery
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex space-x-8 pt-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-bold uppercase tracking-widest transition-all duration-200 relative py-1 ${
                    isActive(link.path)
                      ? "text-bakery-primary"
                      : "text-stone-400 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-bakery-primary rounded-full animate-fade-in" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-6">
            <SearchBar />

            {/* Cart Icon with simple dot */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 text-stone-700 hover:text-bakery-primary transition-all duration-200 flex items-center justify-center"
              title="Xem giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 bg-bakery-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Auth Info or Login button */}
            {auth.isAuthenticated ? (
              <UserInfo />
            ) : (
              <div className="flex items-center space-x-6 pl-4 border-l border-stone-100">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 border border-stone-900 text-stone-900 text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all duration-200 rounded-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Cart Icon for Mobile */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 text-stone-700"
            >
              <ShoppingBag className="w-5.5 h-5.5 stroke-[1.8]" />
              {totalCartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-bakery-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-700"
            >
              {isMobileMenuOpen ? (
                <X className="w-5.5 h-5.5 stroke-[1.8]" />
              ) : (
                <Menu className="w-5.5 h-5.5 stroke-[1.8]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-6 py-6 space-y-6 text-left animate-slide-in">
          <div className="w-full">
            <SearchBar />
          </div>

          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive(link.path)
                    ? "text-bakery-primary font-extrabold"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-6 flex flex-col space-y-4">
            {auth.isAuthenticated ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold uppercase text-xs">
                    {auth.user?.name ? auth.user.name.charAt(0) : auth.user?.email.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-none">{auth.user?.name || "Khách Aura"}</p>
                    <p className="text-[10px] text-stone-400 mt-1">{auth.user?.email}</p>
                  </div>
                </div>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2 border border-stone-900 text-stone-900 text-center text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all rounded-sm"
                >
                  Tài khoản
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 border border-stone-200 rounded-sm text-center text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 bg-stone-900 text-white rounded-sm text-center text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer trượt bên phải */}
      <CartDrawer />
    </nav>
  );
};

export default Header;
