import React from "react";
import ProductCard from "./ProductCard";

const RelatedProducts = ({ currentProduct, allProducts }) => {
  if (!currentProduct || !allProducts) return null;

  // Filter products in the same category, excluding the current product
  const related = allProducts
    .filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  // If not enough related products, fill in with any other products
  if (related.length < 4) {
    const filler = allProducts
      .filter((p) => p.id !== currentProduct.id && !related.find((r) => r.id === p.id))
      .slice(0, 4 - related.length);
    related.push(...filler);
  }

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-bakery-beige/50 pb-4">
        <h2 className="text-2xl font-black text-bakery-dark">
          Có thể bạn sẽ thích
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Những món bánh ngọt ngào được thiết kế cùng khẩu vị phù hợp dành cho bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
