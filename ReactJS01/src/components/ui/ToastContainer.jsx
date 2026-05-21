import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../../store/slices/toastSlice";

const ToastContainer = () => {
  const toasts = useSelector((state) => state.toast.toasts);
  const dispatch = useDispatch();

  const icons = {
    success: (
      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const borderColors = {
    success: "border-green-500",
    error: "border-red-500",
    warning: "border-yellow-500",
    info: "border-blue-500",
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-l-4 ${
            borderColors[toast.type]
          } transition-all duration-300 transform translate-x-0 animate-slide-in`}
        >
          <div className="flex-shrink-0 mr-3">{icons[toast.type]}</div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-gray-900">{toast.title}</h4>
            {toast.description && <p className="text-xs text-gray-500 mt-0.5">{toast.description}</p>}
          </div>
          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
