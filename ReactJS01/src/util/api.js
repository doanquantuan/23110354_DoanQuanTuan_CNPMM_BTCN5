import axios from "./axios.customize";

const createUserApi = (name, email, password) => {
  const URL_API = "/v1/api/register";
  const data = {
    name,
    email,
    password,
  };

  return axios.post(URL_API, data);
};

const loginApi = (email, password) => {
  const URL_API = "/v1/api/login";
  const data = {
    email,
    password,
  };

  return axios.post(URL_API, data);
};

const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get(URL_API);
};

const forgotPasswordApi = (email) => {
  const URL_API = "/v1/api/forgot-password";
  const data = {
    email,
    primaryKey: email,
  };

  return axios.post(URL_API, data);
};

const verifyOtpApi = (email, otp) => {
  const URL_API = "/v1/api/verify-otp";
  const data = {
    email,
    otp,
  };

  return axios.post(URL_API, data);
};

const resetPasswordApi = (email, token, password) => {
  const URL_API = "/v1/api/reset-password";
  const data = {
    email,
    token,
    password,
  };

  return axios.post(URL_API, data);
};

const verifyRegisterOtpApi = (email, otp) => {
  const URL_API = "/v1/api/verify-register-otp";
  const data = {
    email,
    otp,
  };

  return axios.post(URL_API, data);
};

const getProductsApi = (params = {}) => {
  const URL_API = "/v1/api/products";
  return axios.get(URL_API, { params });
};

const getProductByIdApi = (id) => {
  const URL_API = `/v1/api/products/${id}`;
  return axios.get(URL_API);
};

const getBestSellersApi = (params = {}) => {
  const URL_API = "/v1/api/products/best-seller";
  return axios.get(URL_API, { params });
};

const getMostViewedApi = (params = {}) => {
  const URL_API = "/v1/api/products/most-viewed";
  return axios.get(URL_API, { params });
};

export {
  createUserApi,
  loginApi,
  getUserApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
  verifyRegisterOtpApi,
  getProductsApi,
  getProductByIdApi,
  getBestSellersApi,
  getMostViewedApi,
};
