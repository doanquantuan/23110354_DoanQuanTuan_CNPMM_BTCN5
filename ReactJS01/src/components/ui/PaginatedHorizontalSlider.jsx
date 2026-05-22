import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductSkeletonGrid = ({ count }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="space-y-4 animate-pulse text-left">
        <div className="bg-stone-100 aspect-square rounded-2xl w-full" />
        <div className="space-y-2">
          <div className="h-3 bg-stone-100 rounded w-1/4" />
          <div className="h-4.5 bg-stone-100 rounded w-3/4" />
          <div className="h-3 bg-stone-100 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const PaginatedHorizontalSlider = ({ fetchDataApi }) => {
  const [limit, setLimit] = useState(4);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState("next");

  // Determine limit based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newLimit = 4;
      if (width < 640) {
        newLimit = 1;
      } else if (width < 1024) {
        newLimit = 2;
      } else {
        newLimit = 4;
      }

      setLimit((prev) => {
        if (prev !== newLimit) {
          setPage(1);
          return newLimit;
        }
        return prev;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch products from API on page/limit change
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetchDataApi({ page, limit });
        if (isMounted) {
          if (res && res.success) {
            setProducts(res.products || []);
            setTotalPages(res.totalPages || 1);
          } else if (Array.isArray(res)) {
            // Fallback for non-paginated legacy array return
            const offset = (page - 1) * limit;
            setProducts(res.slice(offset, offset + limit));
            setTotalPages(Math.ceil(res.length / limit));
          }
        }
      } catch (err) {
        console.error("Lỗi tải slider phân trang:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [page, limit, fetchDataApi]);

  const handlePageChange = (newPage, direction) => {
    if (newPage === page || newPage < 1 || newPage > totalPages || animating) return;
    setSlideDirection(direction);
    setAnimating(true);
    setTimeout(() => {
      setPage(newPage);
      setAnimating(false);
    }, 250); // match duration class
  };

  return (
    <div className="w-full relative py-4 px-1">
      {/* Next/Prev Navigation Buttons */}
      <button
        onClick={() => handlePageChange(page - 1, "prev")}
        disabled={page === 1 || loading}
        className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/95 border border-stone-100 shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-stone-700 hover:text-bakery-primary hover:scale-105 disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 cursor-pointer active:scale-95"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        onClick={() => handlePageChange(page + 1, "next")}
        disabled={page === totalPages || loading}
        className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-white/95 border border-stone-100 shadow-[0_4px_12px_rgba(0,0,0,0.06)] text-stone-700 hover:text-bakery-primary hover:scale-105 disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 cursor-pointer active:scale-95"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Main Slider Area */}
      <div className="overflow-hidden min-h-[360px] flex flex-col justify-center">
        {loading ? (
          <ProductSkeletonGrid count={limit} />
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-300 ease-out transform ${
              animating
                ? slideDirection === "next"
                  ? "-translate-x-6 opacity-0"
                  : "translate-x-6 opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {products.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dots Indicator Track */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1, i + 1 > page ? "next" : "prev")}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                page === i + 1
                  ? "bg-bakery-primary w-5"
                  : "bg-stone-200 hover:bg-stone-300 w-1.5"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PaginatedHorizontalSlider;
