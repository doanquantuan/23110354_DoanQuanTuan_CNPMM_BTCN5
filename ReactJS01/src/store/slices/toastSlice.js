import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (state, action) => {
      state.toasts.push(action.payload);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;

export const showToast = ({ type = "success", title = "", description = "", duration = 4000 }) => {
  return (dispatch) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    dispatch(addToast({ id, type, title, description }));

    setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);
  };
};

export default toastSlice.reducer;
