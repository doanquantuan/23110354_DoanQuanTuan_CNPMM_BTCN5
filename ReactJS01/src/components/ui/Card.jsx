import React from "react";

const Card = ({ children, title, legendColor = "text-primary-600", className = "", icon: Icon, footer }) => {
  return (
    <div className={`w-full bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden ${className}`}>
      <div className="p-6 md:p-8">
        {(title || Icon) && (
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
            {Icon && <div className="text-primary-500 flex-shrink-0">{Icon}</div>}
            {title && (
              <h2 className={`text-xl font-bold tracking-tight text-gray-800 ${legendColor}`}>
                {title}
              </h2>
            )}
          </div>
        )}
        <div className="space-y-4">{children}</div>
      </div>
      {footer && <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">{footer}</div>}
    </div>
  );
};

export default Card;
