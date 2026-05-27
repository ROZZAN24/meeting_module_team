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
    const accessToken = sessionStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const tenantId = sessionStorage.getItem('tenantId');
    if (tenantId && !config.headers['X-Tenant-ID']) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    const divisionId = sessionStorage.getItem('divisionId');
    if (divisionId && !config.headers['X-Division-ID']) {
      config.headers['X-Division-ID'] = divisionId;
    }

    // Fix: If URL is absolute, clear baseURL to prevent double-origin prefixing
    if (config.url && config.url.startsWith('http')) {
      config.baseURL = '';
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

    // Extract exact error message
    let errMsg = 'Service connection failed. Please try again later.';
    if (!error.response) {
      errMsg = 'Backend server is unreachable. Please ensure the backend is running.';
    } else if (error.response.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errMsg = data;
      } else {
        errMsg = data.message || data.details || data.error || JSON.stringify(data);
      }
    } else if (error.message) {
      errMsg = error.message;
    }

    // Log the error details to the console always
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} | Status: ${error.response?.status || 'Network Error'} | Error: ${errMsg}`, error);

    // Only alert for non-auth errors
    if (error.response?.status !== 401) {
      // Trigger a blocking browser alert with details
      if (window.showAlert) {
        window.showAlert(`Server / Database Error:\n${errMsg}`);
      } else {
        alert(`Server / Database Error:\n${errMsg}`);
      }

      // Dynamically load store to dispatch openSnackbar and avoid circular dependencies
      import('../store').then(({ dispatch }) => {
        import('../store/slices/snackbar').then(({ openSnackbar }) => {
          try {
            dispatch(
              openSnackbar({
                open: true,
                message: errMsg,
                variant: 'alert',
                severity: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' }
              })
            );
          } catch (e) {
            console.warn('Failed to dispatch snackbar action:', e);
          }
        }).catch(err => console.warn('Failed to load snackbar slice:', err));
      }).catch(err => console.warn('Failed to load store dynamically:', err));
    }

    if (!error.response) {
      console.error(`[Axios Error] Backend unreachable: ${error.config?.url}`, error);
      return Promise.reject('Backend server is unreachable. Please ensure the backend is running.');
    }

    console.error(`[Axios Error] API Call Failed: ${error.config?.url} | Status: ${error.response.status}`, error.response.data);
    return Promise.reject((error.response && error.response.data) || 'Service connection failed. Please try again later.');
  }
);

export default axiosServices;

export async function fetcher(args) {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
}
