import React from "react";
import Spinner from "./Spinner";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  block = false,
  type = "button",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400 shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-400 shadow-sm",
    link: "text-primary-600 hover:text-primary-700 hover:underline !shadow-none !ring-0 focus:outline-none focus:ring-0 active:scale-100 p-0",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const blockStyles = block ? "w-full flex" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${blockStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <Spinner size="sm" color={variant === "primary" || variant === "danger" ? "white" : "primary"} />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
