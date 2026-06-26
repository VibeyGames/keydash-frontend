import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://keydash-backend-production.up.railway.app'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('keydash_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('keydash_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (username, password) => API.post('/api/auth/login', { username, password });
export const getMe = () => API.get('/api/auth/me');
export const getStats = () => API.get('/api/kinguin/stats');
export const getOffers = (page = 1) => API.get(`/api/kinguin/offers?page=${page}&limit=20`);
export const updatePrice = (offerId, price) => API.patch(`/api/kinguin/offers/${offerId}/price`, { price });
export const addKeys = (offerId, keys) => API.post(`/api/kinguin/offers/${offerId}/keys`, { keys });
export const createOffer = (data) => API.post('/api/kinguin/offers', data);
export const getOrders = (page = 1) => API.get(`/api/orders?page=${page}&limit=20`);

export default API;
