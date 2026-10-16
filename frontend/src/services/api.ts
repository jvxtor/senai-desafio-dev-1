import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.message;
    const message = Array.isArray(msg) ? msg.join(', ') : msg ?? error.message;
    return Promise.reject(new Error(message));
  }
);