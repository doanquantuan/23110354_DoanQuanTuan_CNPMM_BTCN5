const Product = require("../models/product");
const Review = require("../models/review");
const OrderItem = require("../models/orderItem");
const ProductImage = require("../models/productImage");

// Helper function to format a single product to match schema
const formatProduct = (p) => {
  const plainProduct = p.get({ plain: true });
  console.log(">>> Debug formatProduct:", plainProduct.id, "loaded views:", plainProduct.views);

  // 1. Calculate average rating from reviews
  const reviewsList = plainProduct.reviews || [];
  const ratingSum = reviewsList.reduce((sum, r) => sum + r.rating, 0);
  const rating = reviewsList.length > 0
    ? parseFloat((ratingSum / reviewsList.length).toFixed(1))
    : 5.0;

  // 2. Calculate soldCount from orderItems
  const orderItemsList = plainProduct.orderItems || [];
  const soldCount = orderItemsList.reduce((sum, item) => sum + item.quantity, 0);

  // 3. Calculate isNew (within last 30 days)
  const createdAtDate = new Date(plainProduct.createdAt);
  const diffDays = (new Date() - createdAtDate) / (1000 * 60 * 60 * 24);
  const isNew = diffDays <= 30;

  // 4. Calculate isBestSeller (soldCount >= 100)
  const isBestSeller = soldCount >= 100;

  // 5. Calculate originalPrice dynamically
  const discountPercentage = plainProduct.discountPercentage || 0;
  const originalPrice = discountPercentage > 0
    ? Math.round(plainProduct.price / (1 - discountPercentage / 100))
    : null;

  // Strip relations to match the original clean JSON schema
  delete plainProduct.reviews;
  delete plainProduct.orderItems;

  return {
    ...plainProduct,
    originalPrice,
    rating,
    soldCount,
    isNew,
    isBestSeller,
    images: plainProduct.images || [],
  };
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Review, as: "reviews" },
        { model: OrderItem, as: "orderItems" },
        { model: ProductImage, as: "images" },
      ],
    });

    let formattedProducts = products.map(formatProduct);

    // 1. Apply Search
    const { search } = req.query;
    if (search && search.trim()) {
      const query = search.toLowerCase().trim();
      formattedProducts = formattedProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // 2. Apply Category Filtering (supports category string or categoryId numeric)
    const categoryQuery = req.query.category || req.query.categoryId;
    if (categoryQuery) {
      let categoryName = String(categoryQuery).trim();
      
      const categoryMap = {
        "1": "Bánh Ngọt",
        "2": "Bánh Mì",
        "3": "Croissant",
        "4": "Bánh Kem",
        "5": "Combo",
        "6": "Khuyến Mãi",
      };
      
      if (categoryMap[categoryName]) {
        categoryName = categoryMap[categoryName];
      }

      if (categoryName === "Khuyến Mãi") {
        formattedProducts = formattedProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
      } else {
        formattedProducts = formattedProducts.filter(
          (p) => p.category.toLowerCase() === categoryName.toLowerCase()
        );
      }
    }

    // 3. Apply Filters
    const { filter } = req.query;
    if (filter) {
      if (filter === "isNew") {
        formattedProducts = formattedProducts.filter((p) => p.isNew);
      } else if (filter === "isBestSeller") {
        formattedProducts = formattedProducts.filter((p) => p.isBestSeller);
      } else if (filter === "hasDiscount") {
        formattedProducts = formattedProducts.filter((p) => p.originalPrice && p.originalPrice > p.price);
      } else if (filter === "inStock") {
        formattedProducts = formattedProducts.filter((p) => p.stock > 0);
      }
    }

    // 4. Apply Price Ranges
    const { priceRange } = req.query;
    if (priceRange && priceRange !== "all") {
      if (priceRange === "under-50") {
        formattedProducts = formattedProducts.filter((p) => p.price < 50000);
      } else if (priceRange === "50-100") {
        formattedProducts = formattedProducts.filter((p) => p.price >= 50000 && p.price <= 100000);
      } else if (priceRange === "100-200") {
        formattedProducts = formattedProducts.filter((p) => p.price >= 100000 && p.price <= 200000);
      } else if (priceRange === "over-200") {
        formattedProducts = formattedProducts.filter((p) => p.price > 200000);
      }
    }

    // 5. Apply Rating Filter
    const minRating = parseFloat(req.query.rating);
    if (!isNaN(minRating) && minRating > 0) {
      formattedProducts = formattedProducts.filter((p) => p.rating >= minRating);
    }

    // 6. Apply Sorting
    const sort = req.query.sort || req.query.sortOption;
    if (sort) {
      if (sort === "price-asc") {
        formattedProducts.sort((a, b) => a.price - b.price);
      } else if (sort === "price-desc") {
        formattedProducts.sort((a, b) => b.price - a.price);
      } else if (sort === "rating") {
        formattedProducts.sort((a, b) => b.rating - a.rating);
      } else if (sort === "sold") {
        formattedProducts.sort((a, b) => b.soldCount - a.soldCount);
      }
    }

    // 7. Apply Pagination (page, limit)
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (!isNaN(page) && !isNaN(limit)) {
      const offset = (page - 1) * limit;
      const paginatedProducts = formattedProducts.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        products: paginatedProducts,
        page,
        limit,
        total: formattedProducts.length,
        totalPages: Math.ceil(formattedProducts.length / limit),
      });
    }

    return res.status(200).json(formattedProducts);
  } catch (error) {
    console.error(">>> Error in getProducts:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi từ server khi lấy danh sách sản phẩm",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        { model: Review, as: "reviews" },
        { model: OrderItem, as: "orderItems" },
        { model: ProductImage, as: "images" },
      ],
    });

    if (!product) {
      return res.status(444).json({
        EC: 1,
        EM: "Không tìm thấy sản phẩm",
      });
    }

    // Proactively increment views on details fetch
    try {
      product.views = (product.views || 0) + 1;
      await product.save();
    } catch (dbErr) {
      console.error(">>> Failed to increment product view count:", dbErr);
    }

    const plainProduct = product.get({ plain: true });

    // 1. Calculate average rating
    const reviewsList = plainProduct.reviews || [];
    const ratingSum = reviewsList.reduce((sum, r) => sum + r.rating, 0);
    const rating = reviewsList.length > 0
      ? parseFloat((ratingSum / reviewsList.length).toFixed(1))
      : 5.0;

    // 2. Calculate soldCount
    const orderItemsList = plainProduct.orderItems || [];
    const soldCount = orderItemsList.reduce((sum, item) => sum + item.quantity, 0);

    // 3. Calculate isNew (within last 30 days)
    const createdAtDate = new Date(plainProduct.createdAt);
    const diffDays = (new Date() - createdAtDate) / (1000 * 60 * 60 * 24);
    const isNew = diffDays <= 30;

    // 4. Calculate isBestSeller (soldCount >= 100)
    const isBestSeller = soldCount >= 100;

    // 5. Calculate originalPrice dynamically
    const discountPercentage = plainProduct.discountPercentage || 0;
    const originalPrice = discountPercentage > 0
      ? Math.round(plainProduct.price / (1 - discountPercentage / 100))
      : null;

    // Strip relations to match the original clean JSON schema
    delete plainProduct.reviews;
    delete plainProduct.orderItems;

    const formattedProduct = {
      ...plainProduct,
      originalPrice,
      rating,
      soldCount,
      isNew,
      isBestSeller,
      images: plainProduct.images || [],
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error(">>> Error in getProductById:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi từ server khi lấy chi tiết sản phẩm",
    });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Review, as: "reviews" },
        { model: OrderItem, as: "orderItems" },
        { model: ProductImage, as: "images" },
      ],
    });

    const formattedProducts = products.map(formatProduct);
    const bestSellers = formattedProducts
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 10);

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (!isNaN(page) && !isNaN(limit)) {
      const offset = (page - 1) * limit;
      const paginatedProducts = bestSellers.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        products: paginatedProducts,
        page,
        limit,
        total: bestSellers.length,
        totalPages: Math.ceil(bestSellers.length / limit),
      });
    }

    return res.status(200).json(bestSellers);
  } catch (error) {
    console.error(">>> Error in getBestSellers:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi từ server khi lấy sản phẩm bán chạy",
    });
  }
};

const getMostViewed = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Review, as: "reviews" },
        { model: OrderItem, as: "orderItems" },
        { model: ProductImage, as: "images" },
      ],
    });

    const formattedProducts = products.map(formatProduct);
    const mostViewed = formattedProducts
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    if (!isNaN(page) && !isNaN(limit)) {
      const offset = (page - 1) * limit;
      const paginatedProducts = mostViewed.slice(offset, offset + limit);

      return res.status(200).json({
        success: true,
        products: paginatedProducts,
        page,
        limit,
        total: mostViewed.length,
        totalPages: Math.ceil(mostViewed.length / limit),
      });
    }

    return res.status(200).json(mostViewed);
  } catch (error) {
    console.error(">>> Error in getMostViewed:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi từ server khi lấy sản phẩm xem nhiều nhất",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getBestSellers,
  getMostViewed,
};
