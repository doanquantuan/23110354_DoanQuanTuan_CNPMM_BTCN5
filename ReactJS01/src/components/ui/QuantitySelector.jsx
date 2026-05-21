import React from "react";
import { Plus, Minus } from "lucide-react";

const QuantitySelector = ({ quantity, onChange, max = 10 }) => {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="inline-flex items-center bg-bakery-bg/50 border border-bakery-beige rounded-2xl p-1 shadow-sm">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-bakery-dark hover:bg-bakery-beige transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4 stroke-[2.5]" />
      </button>

      <span className="w-12 text-center text-sm font-extrabold text-bakery-dark">
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-bakery-dark hover:bg-bakery-beige transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};

export default QuantitySelector;
