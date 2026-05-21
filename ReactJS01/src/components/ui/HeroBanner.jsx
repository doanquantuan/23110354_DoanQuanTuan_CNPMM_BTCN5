import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const HeroBanner = () => {
  const slides = [
    {
      id: 1,
      slogan: "Nghệ thuật bánh kem Pháp",
      title: "Bánh Kem Dâu Tây Aura Signature",
      description: "Cốt chiffon mềm nhẹ như mây, phủ lớp kem hữu cơ tươi thanh khiết và những trái dâu tây Đà Lạt ngọt mọng chín cành.",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1000&auto=format&fit=crop",
      badge: "Aura Signature Collection",
      link: "/product/strawberry-shortcake",
    },
    {
      id: 2,
      slogan: "Tinh hoa Sô-cô-la Bỉ",
      title: "Bánh Truffle Sô-cô-la Bỉ 70% Đắng",
      description: "Hương vị đam mê dành cho những tín đồ cacao đích thực. Sự hòa quyện béo ngậy giữa cacao nguyên chất và kem bơ Pháp mịn màng.",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop",
      badge: "Chocoholic Favorites",
      link: "/product/chocolate-truffle",
    },
    {
      id: 3,
      slogan: "Nướng mới lúc 5:00 sáng",
      title: "Bánh Croissant Bơ Pháp Cổ Điển",
      description: "Lớp vỏ ngàn lớp vàng óng giòn tan, lan tỏa hương bơ Isigny nhập khẩu béo ngậy nồng nàn đặc trưng.",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&auto=format&fit=crop",
      badge: "Freshly Baked Every Morning",
      link: "/product/classic-croissant",
    },
  ];

  return (
    <div className="w-full relative rounded-3xl overflow-hidden bg-stone-50">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="w-full h-[360px] md:h-[540px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Background Image with elegant light overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Ultra elegant gradient: Dark overlay fading to transparent for premium text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent" />
            </div>

            {/* Slide Content */}
            <div className="relative z-10 h-full max-w-6xl mx-auto px-8 md:px-16 flex flex-col justify-center items-start text-left text-white space-y-4 md:space-y-6">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-300">
                — {slide.badge}
              </span>

              <div className="space-y-2 md:space-y-4 max-w-xl">
                <p className="text-bakery-primary text-xs md:text-sm font-bold uppercase tracking-widest">
                  {slide.slogan}
                </p>
                <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-[1.1] text-white">
                  {slide.title}
                </h1>
                <p className="text-stone-300 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
                  {slide.description}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/shop"
                  className="px-6 py-3 border border-white hover:bg-white hover:text-stone-900 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center space-x-2 rounded-sm"
                >
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroBanner;
