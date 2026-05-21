import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import { getProductsApi } from "../util/api";
import { SlidersHorizontal, AlertCircle, X, Check } from "lucide-react";

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchWord = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlFilter = searchParams.get("filter") || "";

  // Products and Pagination state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "Tất Cả");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState(0);
  const [filters, setFilters] = useState({
    isNew: urlFilter === "isNew",
    isBestSeller: urlFilter === "isBestSeller",
    hasDiscount: false,
    inStock: false,
  });
  const [sortOption, setSortOption] = useState("default");
  
  // UI states
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState(false);

  const categories = ["Tất Cả", "Bánh Ngọt", "Bánh Mì", "Croissant", "Bánh Kem", "Combo", "Khuyến Mãi"];
  
  const priceRanges = [
    { label: "Tất cả mức giá", value: "all" },
    { label: "Dưới 50,000đ", value: "under-50" },
    { label: "50,000đ - 100,000đ", value: "50-100" },
    { label: "100,000đ - 200,000đ", value: "100-200" },
    { label: "Trên 200,000đ", value: "over-200" },
  ];

  // Ref for infinite scroll observer
  const observerRef = useRef(null);

  // Reset page and reload products whenever main filters change
  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchInitialProducts();
  }, [searchWord, selectedCategory, selectedPriceRange, selectedRating, filters, sortOption]);

  // Sync category from URL search params
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  // Sync filter flags from URL search params
  useEffect(() => {
    if (urlFilter === "isNew") {
      setFilters((prev) => ({ ...prev, isNew: true, isBestSeller: false }));
    } else if (urlFilter === "isBestSeller") {
      setFilters((prev) => ({ ...prev, isNew: false, isBestSeller: true }));
    }
  }, [urlFilter]);

  // Fetch initial page (page = 1)
  const fetchInitialProducts = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory === "Tất Cả" ? "" : selectedCategory;
      const activeFilter = Object.keys(filters).find((key) => filters[key] === true) || "";

      const res = await getProductsApi({
        page: 1,
        limit: 12,
        category: categoryParam,
        search: searchWord,
        filter: activeFilter,
        priceRange: selectedPriceRange,
        rating: selectedRating,
        sort: sortOption,
      });

      if (res && res.success) {
        setProducts(res.products || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      } else if (Array.isArray(res)) {
        // Fallback for non-paginated legacy array return
        setProducts(res);
        setTotalPages(1);
        setTotalCount(res.length);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách sản phẩm ban đầu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subsequent pages for Infinite Scroll
  const fetchMoreProducts = async (nextPage) => {
    if (loadingMore || nextPage > totalPages) return;
    setLoadingMore(true);
    try {
      const categoryParam = selectedCategory === "Tất Cả" ? "" : selectedCategory;
      const activeFilter = Object.keys(filters).find((key) => filters[key] === true) || "";

      const res = await getProductsApi({
        page: nextPage,
        limit: 12,
        category: categoryParam,
        search: searchWord,
        filter: activeFilter,
        priceRange: selectedPriceRange,
        rating: selectedRating,
        sort: sortOption,
      });

      if (res && res.success) {
        setProducts((prev) => {
          // Avoid duplicate keys
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = (res.products || []).filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Lỗi tải thêm sản phẩm (infinite scroll):", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && !loadingMore && page < totalPages) {
        fetchMoreProducts(page + 1);
      }
    },
    [loading, loadingMore, page, totalPages]
  );

  // Set up observer
  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleObserver]);

  const handleCheckboxChange = (field) => {
    setFilters((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleResetFilters = () => {
    setSelectedCategory("Tất Cả");
    setSelectedPriceRange("all");
    setSelectedRating(0);
    setFilters({
      isNew: false,
      isBestSeller: false,
      hasDiscount: false,
      inStock: false,
    });
    setSortOption("default");
    setSearchParams({});
    setIsFilterTrayOpen(false);
  };

  return (
    <div className="space-y-12 animate-slide-in text-left">
      {/* 1. Header Area - Whitespace, elegant typography, no heavy boxes */}
      <div className="space-y-2 border-b border-stone-100 pb-8 pt-4">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
          Aura Patisserie Menu
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-stone-900 leading-tight">
          {searchWord ? `Tìm kiếm: "${searchWord}"` : "Danh mục bánh ngọt"}
        </h1>
        <p className="text-xs text-stone-500 max-w-xl leading-relaxed">
          Tận hưởng những chiếc bánh mì nướng giòn rụm và bánh ngọt cao cấp được làm từ 100% nguyên liệu thượng hạng.
        </p>
      </div>

      {/* 2. Horizontal Category Tabs - Ultra Clean Sliding Tab Menu */}
      <div className="w-full overflow-x-auto scrollbar-none pb-2 -mx-6 px-6">
        <div className="flex space-x-6 min-w-max border-b border-stone-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all duration-200 relative ${
                selectedCategory === cat
                  ? "text-bakery-primary font-extrabold"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              {cat}
              {selectedCategory === cat && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-bakery-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Utility Toolbar - Filters toggle and Sorter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        {/* Results Counter & Expandable Filter Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsFilterTrayOpen(!isFilterTrayOpen)}
            className={`px-4 py-2 border rounded-sm text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center space-x-2 ${
              isFilterTrayOpen
                ? "border-bakery-primary bg-bakery-primary/5 text-bakery-primary"
                : "border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Bộ lọc</span>
          </button>

          <span className="text-xs text-stone-500 font-medium">
            Hiển thị {products.length} trong số {totalCount} món bánh
          </span>
        </div>

        {/* Muted Premium Sort dropdown */}
        <div className="flex items-center space-x-3 justify-end">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sắp xếp:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-sm text-xs font-semibold focus:outline-none focus:border-bakery-primary cursor-pointer transition-colors"
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating">Được đánh giá cao</option>
            <option value="sold">Được mua nhiều nhất</option>
          </select>
        </div>
      </div>

      {/* 4. Retractable Expandable Filter Tray */}
      {isFilterTrayOpen && (
        <div className="bg-stone-50 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-4 gap-8 animate-slide-in">
          {/* Price Range Radios */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Khoảng giá</h4>
            <div className="space-y-2.5">
              {priceRanges.map((range) => (
                <label
                  key={range.value}
                  className="flex items-center space-x-2.5 text-xs font-semibold text-stone-600 cursor-pointer hover:text-stone-900"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRange === range.value}
                    onChange={() => setSelectedPriceRange(range.value)}
                    className="w-4 h-4 border-stone-300 text-bakery-primary focus:ring-bakery-primary accent-bakery-primary"
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Checks */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Trạng thái bánh</h4>
            <div className="space-y-2.5">
              {[
                { label: "Món mới ra lò", key: "isNew" },
                { label: "Bán chạy nhất (Best)", key: "isBestSeller" },
                { label: "Giảm giá đặc biệt", key: "hasDiscount" },
                { label: "Còn hàng tại lò", key: "inStock" },
              ].map((flag) => (
                <label
                  key={flag.key}
                  className="flex items-center space-x-2.5 text-xs font-semibold text-stone-600 cursor-pointer hover:text-stone-900"
                >
                  <input
                    type="checkbox"
                    checked={filters[flag.key]}
                    onChange={() => handleCheckboxChange(flag.key)}
                    className="w-4 h-4 border-stone-300 text-bakery-primary focus:ring-bakery-primary accent-bakery-primary rounded-sm"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating filter stars */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Đánh giá khách hàng</h4>
            <div className="space-y-2">
              {[5, 4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                  className={`w-full flex items-center space-x-2 text-xs font-semibold py-1 transition-colors ${
                    selectedRating === stars ? "text-bakery-primary font-bold" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < stars ? "text-amber-400" : "text-stone-200"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span>{stars === 5 ? "Tuyệt hảo (5★)" : `Từ ${stars}★ trở lên`}</span>
                  {selectedRating === stars && <Check className="w-3.5 h-3.5 stroke-[2.5] ml-auto text-bakery-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Filters Button */}
          <div className="flex flex-col justify-end space-y-3">
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-stone-900 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
            >
              Thiết lập lại bộ lọc
            </button>
            <button
              onClick={() => setIsFilterTrayOpen(false)}
              className="w-full py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* 5. Product Grid & Skeleton Cards */}
      <div className="space-y-12">
        {loading && products.length === 0 ? (
          // Grid layout skeletons on load
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="bg-stone-100 aspect-square rounded-2xl w-full" />
                <div className="space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-1/4" />
                  <div className="h-4.5 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // No results visual blocks
          <div className="bg-stone-50 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
            <div className="p-4 bg-stone-100 rounded-full text-stone-400">
              <AlertCircle className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">Không tìm thấy món bánh nào</h3>
              <p className="text-xs text-stone-400 max-w-xs leading-relaxed font-semibold">
                Rất tiếc, Aura không có món bánh nào khớp với bộ lọc của bạn. Hãy thử thiết lập lại bộ lọc nhé!
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-stone-900 text-white font-bold rounded-sm text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          // Active Products Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <div key={product.id} className="animate-slide-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* 6. Infinite Scroll / Loading More Skeletons */}
        {page < totalPages && (
          <div ref={observerRef} className="pt-8">
            {loadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 border-t border-stone-50 pt-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4 animate-pulse">
                    <div className="bg-stone-100 aspect-square rounded-2xl w-full" />
                    <div className="space-y-2">
                      <div className="h-3 bg-stone-100 rounded w-1/4" />
                      <div className="h-4.5 bg-stone-100 rounded w-3/4" />
                      <div className="h-3 bg-stone-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
