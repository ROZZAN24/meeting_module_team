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
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!error.response) {
      errMsg = isLocalhost
        ? 'Backend server is unreachable. Please ensure the Spring Boot backend is running on port 8081.'
        : 'Backend server is unreachable. Please check your network connection.';
    } else {
      const data = error.response.data;
      const status = error.response.status;

      let serverMsg = '';
      if (data) {
        if (typeof data === 'string') {
          serverMsg = data;
        } else {
          serverMsg = data.message || data.details || data.error || JSON.stringify(data);
        }
      }

      // Check if it's a proxy error from Vite dev server when backend is down
      const isProxyError = (status === 500 || status === 502 || status === 503 || status === 504) && (
        !serverMsg || 
        serverMsg.includes('ECONNREFUSED') || 
        serverMsg.includes('proxy error') || 
        serverMsg.includes('Gateway') ||
        serverMsg.includes('Bad Gateway')
      );

      if (isProxyError && isLocalhost) {
        errMsg = 'Backend server is unreachable (Connection Refused on port 8081). Please ensure the Spring Boot backend is running.';
      } else if (serverMsg) {
        errMsg = serverMsg;
      } else if (error.message) {
        errMsg = error.message;
      } else {
        errMsg = `Request failed with status code ${status}`;
      }
    }

    // Log the error details to the console always
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} | Status: ${error.response?.status || 'Network Error'} | Error: ${errMsg}`, error);

    // Only alert for non-auth errors, and skip auth-related endpoints where
    // 403/400 are expected validation responses handled locally by the login form.
    const isAuthEndpoint = error.config?.url && (
      error.config.url.includes('/check-credentials') ||
      error.config.url.includes('/account/login') ||
      error.config.url.includes('/account/face-login')
    );
    const isExpectedAuthError = isAuthEndpoint && [400, 403, 405].includes(error.response?.status);

    if (error.response?.status !== 401 && !isExpectedAuthError) {
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

    return Promise.reject(errMsg);
  }
);

export default axiosServices;

export async function fetcher(args) {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
}
