import React, { useState, useEffect } from "react";
import HeroBanner from "../components/ui/HeroBanner";
import ProductCard from "../components/ui/ProductCard";
import PaginatedHorizontalSlider from "../components/ui/PaginatedHorizontalSlider";
import { getProductsApi, getBestSellersApi, getMostViewedApi } from "../util/api";
import { Sparkles, Clock, Award, Coffee, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const ProductSkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
    {[...Array(4)].map((_, i) => (
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

const HomePage = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [promoProducts, setPromoProducts] = useState([]);

  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingPromo, setLoadingPromo] = useState(true);

  // 1. Fetch Bánh mới ra lò (Top 4)
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const res = await getProductsApi({ page: 1, limit: 4, filter: "isNew" });
        if (res && res.success) {
          setNewProducts(res.products || []);
        } else if (Array.isArray(res)) {
          setNewProducts(res.filter(p => p.isNew).slice(0, 4));
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm mới:", err);
      } finally {
        setLoadingNew(false);
      }
    };
    fetchNewProducts();
  }, []);

  // 4. Fetch Khuyến mãi (Top 4)
  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        const res = await getProductsApi({ page: 1, limit: 4, filter: "hasDiscount" });
        if (res && res.success) {
          setPromoProducts(res.products || []);
        } else if (Array.isArray(res)) {
          setPromoProducts(res.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4));
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm khuyến mãi:", err);
      } finally {
        setLoadingPromo(false);
      }
    };
    fetchPromoProducts();
  }, []);

  // Countdown Sale state: 2 hours 14 minutes 45 seconds initial timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 14,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        let s = prev.seconds - 1;
        let m = prev.minutes;
        let h = prev.hours;

        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }

        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, "0");

  return (
    <div className="space-y-20 animate-slide-in">
      {/* 1. Hero Banner Slider */}
      <HeroBanner />

      {/* 2. Brand Value Highlights - Ultra Clean, Minimal spacing, whitespace-first */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4 py-4 border-b border-stone-100">
        {[
          {
            icon: <Clock className="w-5 h-5 text-bakery-primary stroke-[1.5]" />,
            title: "Nướng Mới Mỗi Sáng",
            desc: "Bánh được nướng tươi nóng tại lò vào 5:00 sáng mỗi ngày.",
          },
          {
            icon: <Award className="w-5 h-5 text-bakery-primary stroke-[1.5]" />,
            title: "Nguyên Liệu Chuẩn Âu",
            desc: "100% bơ lạt Isigny Normandy, bột Pháp và sô-cô-la Bỉ nguyên chất.",
          },
          {
            icon: <Coffee className="w-5 h-5 text-bakery-primary stroke-[1.5]" />,
            title: "Trà Chiều Tinh Tế",
            desc: "Các combo trà hoa quả mật ong ăn kèm bánh macarons thanh tao.",
          },
          {
            icon: <Heart className="w-5 h-5 text-bakery-primary stroke-[1.5]" />,
            title: "Chăm Sóc Tận Tâm",
            desc: "Dịch vụ giao bánh tận nơi nhanh chóng, bảo quản kem chuyên nghiệp.",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-3 p-2 group"
          >
            <div className="p-3 bg-stone-50 rounded-full group-hover:bg-bakery-primary/5 transition-colors duration-300">
              {item.icon}
            </div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest">
              {item.title}
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed max-w-[220px] font-semibold">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Section: Bánh mới ra lò */}
      <section className="space-y-8 text-left max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Freshly Baked Today
            </span>
            <h2 className="text-2xl font-serif font-extrabold text-stone-900 leading-none">
              Món mới ra lò
            </h2>
          </div>
          <Link
            to="/shop?filter=isNew"
            className="text-[10px] font-bold text-bakery-primary hover:text-stone-900 transition-colors uppercase tracking-widest flex items-center space-x-1.5"
          >
            <span>Khám phá trọn bộ</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {loadingNew ? (
          <ProductSkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Artisanal Process Banner - Elegant Contrast Panel */}
      <section className="max-w-6xl mx-auto px-4">
        {/* Thay bg-stone-950 bằng bg-bakery-beige (hoặc bg-amber-50), thay text-white bằng text-bakery-dark */}
        <div className="relative rounded-3xl overflow-hidden bg-bakery-beige text-bakery-dark p-8 md:p-16 border border-bakery-primary/10">
          {/* Subtle warm lighting effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-bakery-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-bakery-primary/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 text-left">
            <div className="space-y-6 max-w-xl">
              {/* Điều chỉnh lại badge cho nổi bật trên nền sáng: thay bg-white/5 bằng bg-bakery-primary/10, text-stone-300 bằng text-bakery-primary */}
              <span className="inline-flex items-center space-x-2 px-3 py-1 bg-bakery-primary/10 backdrop-blur-md rounded-full text-[9px] font-extrabold tracking-widest uppercase border border-bakery-primary/20 text-bakery-primary">
                <Sparkles className="w-3 h-3 text-bakery-primary fill-bakery-primary" />
                <span>Nghệ thuật làm bánh tinh tế</span>
              </span>

              {/* Thay text-white bằng text-bakery-dark */}
              <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight text-bakery-dark">
                Ủ men tự nhiên 18 giờ <br />
                và nướng đá núi lửa cổ điển
              </h2>

              {/* Thay text-stone-400 bằng text-stone-600 để chữ dễ đọc hơn trên nền sáng */}
              <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-semibold">
                Tại Aura Bakery, mỗi chiếc bánh sừng bò, bánh mì men tự nhiên sourdough hay bánh ngọt cao cấp đều được nướng chín thủ công trên phiến đá lửa để giữ nguyên độ xốp ẩm tuyệt đối bên trong cùng lớp vỏ ngàn lớp giòn rụm bên ngoài.
              </p>

              <div className="pt-2">
                {/* Điều chỉnh hiệu ứng hover cho nút bấm: khi hover sẽ chuyển sang màu nâu đậm hơn thay vì màu trắng */}
                <Link
                  to="/shop"
                  className="px-6 py-3 bg-bakery-primary hover:bg-bakery-dark text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-all duration-300 inline-block active:scale-95 shadow-[0_4px_14px_rgba(139,94,60,0.15)]"
                >
                  Khám phá thực đơn
                </Link>
              </div>
            </div>

            <div className="w-full md:w-[340px] aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-bakery-bg border border-bakery-primary/10 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop"
                alt="Artisanal process"
                className="w-full h-full object-cover hover:scale-105 transition-all duration-700 ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Top 10 Bán chạy nhất */}
      <section className="space-y-8 text-left max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Aura's Best Sellers
            </span>
            <h2 className="text-2xl font-serif font-extrabold text-stone-900 leading-none">
              Bánh ngọt bán chạy nhất
            </h2>
          </div>
          <Link
            to="/shop?filter=isBestSeller"
            className="text-[10px] font-bold text-bakery-primary hover:text-stone-900 transition-colors uppercase tracking-widest flex items-center space-x-1.5"
          >
            <span>Xem tất cả</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <PaginatedHorizontalSlider fetchDataApi={getBestSellersApi} />
      </section>

      {/* 6. Section: Top 10 Xem nhiều nhất */}
      <section className="space-y-8 text-left max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Most Viewed Masterpieces
            </span>
            <h2 className="text-2xl font-serif font-extrabold text-stone-900 leading-none">
              Sản phẩm xem nhiều nhất
            </h2>
          </div>
        </div>

        <PaginatedHorizontalSlider fetchDataApi={getMostViewedApi} />
      </section>

      {/* 7. Section: Khuyến mãi giới hạn thời gian (Countdown Sale) */}
      <section className="space-y-8 text-left max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-100 pb-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
              Limited Sweetness Offers
            </span>
            <h2 className="text-2xl font-serif font-extrabold text-stone-900 leading-none">
              Khuyến mãi ngọt ngào
            </h2>
          </div>

          {/* Minimalist Countdown Timer */}
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest animate-pulse">
              Kết thúc sau:
            </span>
            <div className="flex items-center space-x-1.5 font-mono text-xs">
              <div className="px-2 py-1 bg-stone-900 text-white font-bold rounded-sm">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="font-extrabold text-stone-900">:</span>
              <div className="px-2 py-1 bg-stone-900 text-white font-bold rounded-sm">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="font-extrabold text-stone-900">:</span>
              <div className="px-2 py-1 bg-stone-900 text-white font-bold rounded-sm">
                {formatNumber(timeLeft.seconds)}
              </div>
            </div>
          </div>
        </div>

        {loadingPromo ? (
          <ProductSkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
