import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: {
    email: "",
    name: "",
  },
  appLoading: true,
  actionLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user || { email: "", name: "" };
    },
    setAppLoading: (state, action) => {
      state.appLoading = action.payload;
    },
    setActionLoading: (state, action) => {
      state.actionLoading = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = { email: "", name: "" };
      localStorage.removeItem("access_token");
    },
  },
});

export const { setAuth, setAppLoading, setActionLoading, logout } = authSlice.actions;
export default authSlice.reducer;
