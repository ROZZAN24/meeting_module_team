/**
 * axios setup to use mock service
 */

import axios from 'axios';

const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:3010/';
const axiosServices = axios.create({ baseURL: apiUrl });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Deep Fix: Ensure absolute URLs are not accidentally truncated or mis-prefixed
    if (!config.url.startsWith('http') && !config.url.startsWith('/') && config.baseURL) {
      if (config.baseURL.endsWith('/')) {
        config.url = config.url; // axios will concatenate them correctly
      } else {
        config.url = '/' + config.url;
      }
    } else if (config.url.startsWith('/') && config.baseURL && config.baseURL.endsWith('/')) {
      // Prevent double slash if both baseURL ends with / and url starts with /
      config.url = config.url.substring(1);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    // Deep Fix: If QMS endpoints fail with 403/404, we provide a more helpful log
    if (error.config && error.config.url.includes('/api/qms')) {
      console.warn('QMS API Call failed. Checking backend availability...', error.config.url);
    }

    if (error.response && error.response.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }
    return Promise.reject((error.response && error.response.data) || 'Service connection failed. Please try again later.');
  }
);

export default axiosServices;

export async function fetcher(args) {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
}
