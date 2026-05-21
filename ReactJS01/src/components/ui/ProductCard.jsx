import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingBag } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import { showToast } from "../../store/slices/toastSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const {
    id,
    name,
    price,
    originalPrice,
    image,
    rating = 5,
    isNew = false,
    isBestSeller = false,
    soldCount = 0,
    stock = 10,
    category = "Bánh Ngọt",
    views = 0,
  } = product;

  // Calculate discount percentage
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock <= 0) {
      dispatch(
        showToast({
          type: "error",
          title: "HẾT HÀNG",
          description: `Sản phẩm ${name} hiện đã tạm hết hàng!`,
        })
      );
      return;
    }

    dispatch(addToCart({ id, name, price, image, quantity: 1, stock }));
    dispatch(
      showToast({
        type: "success",
        title: "ĐÃ THÊM GIỎ HÀNG",
        description: `Đã thêm 1 chiếc ${name} vào giỏ hàng thành công!`,
      })
    );
  };

  return (
    <div className="group relative bg-white flex flex-col h-full text-left transition-all duration-300">
      {/* Image Area - Curved, clean, no shadow */}
      <Link to={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-stone-50 rounded-2xl">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
          loading="lazy"
        />
        
        {/* Very gentle overlay on hover */}
        <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Minimalist premium badges layered over image */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isNew && (
            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-stone-100 text-stone-900 text-[8px] font-bold uppercase tracking-widest rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              Mới ra lò
            </span>
          )}
          {isBestSeller && (
            <span className="px-2 py-0.5 bg-stone-900/90 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-widest rounded-sm">
              Bán chạy
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 bg-bakery-primary/95 text-white text-[8px] font-bold uppercase tracking-widest rounded-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
      </Link>

      {/* Details Area - Spaced out, clean typography */}
      <div className="pt-4 pb-2 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] tracking-widest text-stone-400 font-extrabold uppercase">
            <span>{category}</span>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 stroke-[1.5]" />
              <span className="text-stone-700">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/product/${id}`} className="block">
            <h3 className="text-sm font-bold text-stone-900 hover:text-bakery-primary transition-colors duration-200 line-clamp-1">
              {name}
            </h3>
          </Link>

          {/* Sold and View statistics in elegant tiny font */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium">
            <span>Đã bán: <strong className="font-semibold text-stone-700">{soldCount}</strong></span>
            {views > 0 && (
              <span>Lượt xem: <strong className="font-semibold text-stone-700">{views}</strong></span>
            )}
          </div>
        </div>

        {/* Pricing & Subtle CTA */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-extrabold text-bakery-primary">
              {price.toLocaleString("vi-VN")}đ
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-[10px] text-stone-400 line-through font-semibold">
                {originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          {/* Minimalist Cart Icon */}
          <button
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`p-2 transition-all duration-200 active:scale-95 ${
              stock <= 0
                ? "text-stone-300 cursor-not-allowed"
                : "text-stone-700 hover:text-bakery-primary"
            }`}
            title="Thêm vào giỏ hàng"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
