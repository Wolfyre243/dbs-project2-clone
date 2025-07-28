import axios from 'axios';

const ENV = import.meta.env.VITE_ENV;
const url =
  ENV === 'production'
    ? import.meta.env.VITE_PROD_PROXY_URL
    : import.meta.env.VITE_PROXY_URL;

function axiosInstance() {
  return axios.create({
    baseURL: url,
    timeout: 50000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function axiosPrivateInstance() {
  return axios.create({
    baseURL: url,
    timeout: 50000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const api = axiosInstance();
export default api;
export const apiPrivate = axiosPrivateInstance();
