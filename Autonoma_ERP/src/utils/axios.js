/**
 * axios setup to use mock service
 */

import axios from 'axios';

const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin
});
// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      config.headers['X-Tenant-ID'] = companyId;
    }
    const divisionId = localStorage.getItem('divisionId');
    if (divisionId) {
      config.headers['X-Division-ID'] = divisionId;
    }

    // Add X-Page-Name for auditing
    const pageName = document.title || window.location.pathname;
    config.headers['X-Page-Name'] = pageName;

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

    console.debug(`[Axios Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
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

    if (error.response?.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }

    if (!error.response) {
      return Promise.reject('Backend server is unreachable. Please ensure the backend is running.');
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
