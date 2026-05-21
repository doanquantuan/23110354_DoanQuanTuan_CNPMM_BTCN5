import React from "react";
import { Star, RotateCcw, Check, Sparkles } from "lucide-react";

const FilterSidebar = ({
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  filters,
  setFilters,
  selectedRating,
  setSelectedRating,
  onReset,
}) => {
  const categories = ["Tất Cả", "Bánh Ngọt", "Bánh Mì", "Croissant", "Bánh Kem", "Combo", "Khuyến Mãi"];
  
  const priceRanges = [
    { label: "Tất cả mức giá", value: "all" },
    { label: "Dưới 50,000đ", value: "under-50" },
    { label: "50,000đ - 100,000đ", value: "50-100" },
    { label: "100,000đ - 200,000đ", value: "100-200" },
    { label: "Trên 200,000đ", value: "over-200" },
  ];

  const handleCheckboxChange = (field) => {
    setFilters((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="bg-white border border-bakery-beige/50 rounded-[2rem] p-6 space-y-6 text-left shadow-sm sticky top-24">
      {/* Title & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-bakery-bg/60">
        <h3 className="text-lg font-black text-bakery-dark flex items-center space-x-1.5">
          <Sparkles className="w-4.5 h-4.5 text-bakery-primary fill-bakery-primary" />
          <span>Bộ lọc tìm kiếm</span>
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-extrabold text-bakery-primary hover:text-bakery-dark transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Xóa bộ lọc</span>
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
          Danh mục bánh
        </h4>
        <div className="flex flex-col space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-extrabold transition-all duration-150 flex items-center justify-between ${
                (cat === "Tất Cả" && selectedCategory === "") || selectedCategory === cat
                  ? "bg-bakery-primary text-white"
                  : "text-gray-600 hover:bg-bakery-bg/50 hover:text-bakery-dark"
              }`}
            >
              <span>{cat}</span>
              {((cat === "Tất Cả" && selectedCategory === "") || selectedCategory === cat) && (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
          Khoảng giá
        </h4>
        <div className="space-y-1.5">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center space-x-2.5 text-sm font-semibold text-gray-600 cursor-pointer hover:text-bakery-dark py-1"
            >
              <input
                type="radio"
                name="priceRange"
                checked={selectedPriceRange === range.value}
                onChange={() => setSelectedPriceRange(range.value)}
                className="w-4 h-4 text-bakery-primary border-bakery-beige focus:ring-bakery-primary focus:ring-offset-0 accent-bakery-primary"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Special Badges */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
          Trạng thái bánh
        </h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2.5 text-sm font-semibold text-gray-600 cursor-pointer hover:text-bakery-dark py-0.5">
            <input
              type="checkbox"
              checked={filters.isNew}
              onChange={() => handleCheckboxChange("isNew")}
              className="w-4.5 h-4.5 rounded-lg border-bakery-beige text-bakery-primary focus:ring-bakery-primary accent-bakery-primary"
            />
            <span>Món bánh mới ra lò</span>
          </label>

          <label className="flex items-center space-x-2.5 text-sm font-semibold text-gray-600 cursor-pointer hover:text-bakery-dark py-0.5">
            <input
              type="checkbox"
              checked={filters.isBestSeller}
              onChange={() => handleCheckboxChange("isBestSeller")}
              className="w-4.5 h-4.5 rounded-lg border-bakery-beige text-bakery-primary focus:ring-bakery-primary accent-bakery-primary"
            />
            <span>Bán chạy nhất (Best Seller)</span>
          </label>

          <label className="flex items-center space-x-2.5 text-sm font-semibold text-gray-600 cursor-pointer hover:text-bakery-dark py-0.5">
            <input
              type="checkbox"
              checked={filters.hasDiscount}
              onChange={() => handleCheckboxChange("hasDiscount")}
              className="w-4.5 h-4.5 rounded-lg border-bakery-beige text-bakery-primary focus:ring-bakery-primary accent-bakery-primary"
            />
            <span>Đang giảm giá đặc biệt</span>
          </label>

          <label className="flex items-center space-x-2.5 text-sm font-semibold text-gray-600 cursor-pointer hover:text-bakery-dark py-0.5">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={() => handleCheckboxChange("inStock")}
              className="w-4.5 h-4.5 rounded-lg border-bakery-beige text-bakery-primary focus:ring-bakery-primary accent-bakery-primary"
            />
            <span>Còn hàng tại tiệm</span>
          </label>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
          Đánh giá từ khách hàng
        </h4>
        <div className="flex flex-col space-y-1">
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                selectedRating === stars
                  ? "bg-bakery-bg text-bakery-primary font-black"
                  : "text-gray-500 hover:bg-bakery-bg/30 hover:text-bakery-dark"
              }`}
            >
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < stars
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-xs text-gray-500 font-extrabold">
                  {stars === 5 ? "Tuyệt đối (5 sao)" : `Từ ${stars} sao trở lên`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
