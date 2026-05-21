import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { toggleCart, removeFromCart, updateQuantity } from "../../store/slices/cartSlice";
import { showToast } from "../../store/slices/toastSlice";
import QuantitySelector from "./QuantitySelector";
import Button from "./Button";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { cartItems, isCartOpen } = useSelector((state) => state.cart);

  if (!isCartOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleQtyChange = (id, newQty) => {
    dispatch(updateQuantity({ id, quantity: newQty }));
  };

  const handleRemove = (id, name) => {
    dispatch(removeFromCart(id));
    dispatch(
      showToast({
        type: "success",
        title: "ĐÃ XÓA",
        description: `Đã xóa bánh ${name} khỏi giỏ hàng!`,
      })
    );
  };

  const handleCheckout = () => {
    dispatch(toggleCart());
    dispatch(
      showToast({
        type: "success",
        title: "THANH TOÁN THÀNH CÔNG",
        description: "Cảm ơn bạn đã đặt bánh tại Aura Bakery! Đơn hàng đang được xử lý.",
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay with fade transition */}
      <div
        className="absolute inset-0 bg-bakery-dark/45 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => dispatch(toggleCart())}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full rounded-l-[2rem] border-l border-bakery-beige/30 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-bakery-bg/60 flex items-center justify-between bg-bakery-bg/30">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-bakery-primary/10 rounded-xl text-bakery-primary">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-lg font-black text-bakery-dark">Giỏ hàng của bạn</h2>
            </div>
            <button
              onClick={() => dispatch(toggleCart())}
              className="p-2 text-gray-400 hover:text-bakery-primary hover:bg-bakery-bg rounded-xl transition-all"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-5 bg-bakery-bg/50 rounded-full text-bakery-primary/60">
                  <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-bakery-dark">Giỏ hàng trống</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                    Bạn chưa chọn chiếc bánh ngọt ngào nào. Hãy ghé cửa hàng ngay nhé!
                  </p>
                </div>
                <button
                  onClick={() => dispatch(toggleCart())}
                  className="mt-2 px-6 py-2.5 bg-bakery-primary hover:bg-bakery-dark text-white font-extrabold rounded-2xl text-sm transition-all shadow-md"
                >
                  Ghé Aura Shop
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 border border-bakery-bg/40 rounded-2xl bg-bakery-bg/10 hover:border-bakery-beige transition-colors"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-bakery-beige/30"
                  />

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-extrabold text-bakery-dark line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-bakery-primary font-black mt-0.5">
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <QuantitySelector
                        quantity={item.quantity}
                        onChange={(q) => handleQtyChange(item.id, q)}
                        max={item.stock}
                      />
                      
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4.5 h-4.5 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Pricing */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-bakery-bg/60 bg-bakery-bg/20 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500 font-semibold">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-gray-500 font-semibold">
                  <span>Phí giao hàng</span>
                  <span className="text-emerald-600 font-bold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-base text-bakery-dark font-black pt-2 border-t border-bakery-bg/40">
                  <span>Tổng thanh toán</span>
                  <span className="text-lg text-bakery-primary">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-bakery-primary hover:bg-bakery-dark text-white rounded-2xl text-base font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
                >
                  <span>Thanh toán ngay</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
