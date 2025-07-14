import axios from "axios";

function axiosInstance() {
  return axios.create({
    baseURL: import.meta.env.VITE_PROXY_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function axiosPrivateInstance() {
  return axios.create({
    baseURL: import.meta.env.VITE_PROXY_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const api = axiosInstance();
export default api;
export const apiPrivate = axiosPrivateInstance();
