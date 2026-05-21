import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingBag, Truck, ShieldCheck, RefreshCcw, ArrowLeft, Eye, Award, X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, EffectFade } from "swiper/modules";
import QuantitySelector from "../components/ui/QuantitySelector";
import RelatedProducts from "../components/ui/RelatedProducts";
import { getProductByIdApi, getProductsApi } from "../util/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { showToast } from "../store/slices/toastSlice";

// Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Fetch product from backend
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top on load or ID change
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setLoading(true);

    const fetchProductDetails = async () => {
      try {
        const [detailRes, allRes] = await Promise.all([
          getProductByIdApi(id),
          getProductsApi(),
        ]);

        if (detailRes) {
          setProduct(detailRes.data || detailRes);
        }
        if (allRes) {
          const list = Array.isArray(allRes) ? allRes : (allRes.data || []);
          setAllProducts(list);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-12 max-w-6xl mx-auto px-4 py-8 animate-pulse text-left">
        <div className="h-6 bg-gray-100 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="bg-gray-100 rounded-[2.5rem] aspect-square w-full" />
          <div className="space-y-6">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-10 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/4" />
            <div className="h-20 bg-gray-100 rounded w-full" />
            <div className="h-12 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 animate-slide-in">
        <div className="max-w-md w-full bg-white p-8 rounded-xl text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-bakery-dark">Không tìm thấy sản phẩm</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Món bánh bạn đang tìm kiếm không tồn tại hoặc đã tạm dừng bán tại Aura Bakery.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-1 text-sm font-black text-bakery-primary hover:text-bakery-dark"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Quay lại cửa hàng Aura</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    name,
    price,
    originalPrice,
    image,
    rating = 5,
    soldCount = 0,
    stock = 10,
    category,
    description,
    ingredients = "Nguyên liệu hữu cơ nhập khẩu cao cấp.",
  } = product;

  // Render different thumbnail images (main image + auxiliary images from DB)
  const galleryImages = [
    image,
    ...(product.images || [])
      .map((img) => img.imageUrl)
      .filter((url) => url !== image)
  ];

  const handleAddToCart = () => {
    if (stock <= 0) {
      dispatch(
        showToast({
          type: "error",
          title: "HẾT HÀNG",
          description: `Sản phẩm ${name} hiện đang tạm hết hàng!`,
        })
      );
      return;
    }

    dispatch(addToCart({ id: product.id, name, price, image, quantity, stock }));
    dispatch(
      showToast({
        type: "success",
        title: "ĐÃ THÊM GIỎ HÀNG",
        description: `Đã thêm ${quantity} chiếc ${name} vào giỏ hàng thành công!`,
      })
    );
  };

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <div className="space-y-16 animate-slide-in text-left">
      {/* Back button link */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 text-sm font-black text-bakery-primary hover:text-bakery-dark transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Quay lại cửa hàng Aura</span>
        </Link>
      </div>

      {/* Main product view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Column: Swiper Gallery */}
        <div className="space-y-4">
          {/* Main Slide Carousel with Fade Effect */}
          <div className="relative rounded-xl overflow-hidden bg-gray-50 aspect-square">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded">
                GIẢM {discountPercent}%
              </span>
            )}
            
            <Swiper
              modules={[EffectFade, Thumbs, Navigation]}
              effect="fade"
              thumbs={{ swiper: thumbsSwiper }}
              navigation={true}
              className="w-full h-full"
            >
              {galleryImages.map((imgUrl, index) => (
                <SwiperSlide key={index} className="overflow-hidden w-full h-full">
                  {/* Interactive Zoom Image container */}
                  <div className="w-full h-full overflow-hidden flex items-center justify-center bg-white">
                    <img
                      src={imgUrl}
                      alt={`${name} slide ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-150 cursor-zoom-in"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Thumbnail Slides */}
          <div className="w-full">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={3}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="thumbs-swiper"
            >
              {galleryImages.map((imgUrl, index) => (
                <SwiperSlide
                  key={index}
                  className="rounded-lg overflow-hidden cursor-pointer aspect-square bg-white hover:opacity-85 transition-opacity"
                >
                  <img
                    src={imgUrl}
                    alt={`${name} thumb ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            {/* Category and VIP tag */}
            <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-wider">
              <span className="text-bakery-primary">
                {category}
              </span>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center text-amber-700">
                <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                <span>Signature</span>
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-bakery-dark tracking-tight leading-tight">
              {name}
            </h1>

            {/* Ratings & Sold items count */}
            <div className="flex items-center space-x-4 text-sm font-semibold pt-1">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
                <span className="font-extrabold text-gray-800 ml-1.5">{rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Đã bán: <strong className="text-bakery-dark font-extrabold">{soldCount} chiếc</strong></span>
            </div>
          </div>

          {/* Price Container */}
          <div className="py-2 flex items-baseline space-x-4">
            <span className="text-3xl font-black text-bakery-primary">
              {price.toLocaleString("vi-VN")}đ
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-sm text-gray-400 line-through font-medium">
                  {originalPrice.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-xs text-red-500 font-bold">
                  (Tiết kiệm { (originalPrice - price).toLocaleString("vi-VN") }đ)
                </span>
              </>
            )}
          </div>

          {/* Core summary description */}
          <p className="text-sm text-gray-600 leading-relaxed font-semibold">
            {description}
          </p>

          {/* Stock Info */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="text-gray-400 uppercase">Trạng thái:</span>
            {stock <= 0 ? (
              <span className="text-red-600">
                Tạm hết hàng
              </span>
            ) : stock <= 3 ? (
              <span className="text-amber-600">
                Sắp hết hàng (Chỉ còn {stock} chiếc)
              </span>
            ) : (
              <span className="text-emerald-600">
                Còn hàng tại tiệm ({stock} chiếc)
              </span>
            )}
          </div>

          {/* Add to Cart Actions Block */}
          {stock > 0 && (
            <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex flex-col items-start gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1">Số lượng mua</span>
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  max={stock}
                />
              </div>
 
              <div className="w-full sm:flex-1">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-bakery-primary hover:bg-bakery-dark text-white rounded-lg text-base font-black transition-all flex items-center justify-center space-x-2.5 active:scale-[0.99]"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                  <span>Thêm bánh vào giỏ hàng</span>
                </button>
              </div>
            </div>
          )}

          {/* Value Propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-xs font-semibold text-gray-400 leading-relaxed">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-bakery-primary shrink-0" />
              <span>Giao hàng cực tốc 30 phút</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-bakery-primary shrink-0" />
              <span>Chuẩn sạch Organic 100%</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCcw className="w-4 h-4 text-bakery-primary shrink-0" />
              <span>Hoàn tiền nếu không hài lòng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs area */}
      <div className="pt-12 pb-6 space-y-6">
        <div className="flex border-b border-gray-100 space-x-6">
          {[
            { id: "description", label: "Mô tả hương vị" },
            { id: "ingredients", label: "Thành phần nguyên liệu" },
            { id: "reviews", label: "Đánh giá thực khách" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-bakery-primary text-bakery-primary font-black"
                  : "border-transparent text-gray-400 hover:text-bakery-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 leading-relaxed font-semibold py-2">
          {activeTab === "description" && (
            <div className="space-y-4">
              <p>
                Món bánh ngọt {name} là đại diện tiêu biểu cho sự tỉ mỉ và tận tụy của những nghệ nhân làm bánh Aura. Trải qua quy trình đánh bột và nướng chín chuẩn nhiệt độ Pháp, bánh giữ trọn sự béo mượt thanh nhã đặc trưng.
              </p>
              <p>
                Hương thơm lôi cuốn lan tỏa ngay khi bánh vừa được cắt ra, sự đan xen giữa độ xốp mịn của tinh bột hữu cơ và độ ẩm dịu mát của bơ sữa Normandy tạo ra cảm giác lãng mạn lôi cuốn bậc nhất.
              </p>
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="space-y-4">
              <p className="font-extrabold text-bakery-dark">
                Các thành phần chính được Aura kiểm duyệt nguồn gốc chặt chẽ:
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {ingredients}
              </p>
              <p className="text-[11px] text-red-500 font-bold">
                * Cảnh báo dị ứng: Bánh có chứa các sản phẩm từ sữa bò hữu cơ, trứng hữu cơ và các loại quả hạch hạnh nhân.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {[
                { name: "Phan Văn Hùng", rating: 5, comment: "Bánh dâu tây ngon tuyệt đỉnh! Kem thơm béo ngậy mà không hề bị ngấy, dâu tây mọng nước cực kỳ chất lượng. Vợ con mình đều mê tít Aura." },
                { name: "Nguyễn Thị Mai", rating: 5, comment: "Croissant hạnh nhân và tiramisu đều siêu ngon. Giao hàng đến Đà Nẵng cực nhanh, đóng hộp rất chỉn chu sang trọng, phù hợp làm quà tặng." },
              ].map((rev, index) => (
                <div key={index} className="space-y-2 pb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-bakery-dark">{rev.name}</span>
                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3 h-3 ${
                            idx < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      <RelatedProducts currentProduct={product} allProducts={allProducts} />
    </div>
  );
};

export default ProductDetailPage;
