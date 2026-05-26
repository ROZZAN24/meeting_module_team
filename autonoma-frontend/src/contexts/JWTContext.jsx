import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useState } from 'react';

// third party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import { store } from 'store';
import { clearPermissions } from 'store/slices/permissions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'utils/axios';
import useConfig from 'hooks/useConfig';
import { useColorScheme } from '@mui/material/styles';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

function setSessionContext(tenantId, divisionId, companyName, divisionName) {
  if (tenantId) sessionStorage.setItem('tenantId', tenantId); else sessionStorage.removeItem('tenantId');
  if (divisionId) sessionStorage.setItem('divisionId', String(divisionId)); else sessionStorage.removeItem('divisionId');
  if (companyName) sessionStorage.setItem('companyName', companyName); else sessionStorage.removeItem('companyName');
  if (divisionName) sessionStorage.setItem('divisionName', divisionName); else sessionStorage.removeItem('divisionName');
}

function verifyToken(serviceToken) {
  if (!serviceToken) {
    return false;
  }

  const decoded = jwtDecode(serviceToken);

  // Ensure 'exp' exists and compare it to the current timestamp
  if (!decoded.exp) {
    throw new Error("Token does not contain 'exp' property.");
  }

  return decoded.exp > Date.now() / 1000;
}

function setSession(serviceToken) {
  if (serviceToken) {
    sessionStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    sessionStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
    setSessionContext(null, null, null, null);
  }
}

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export function JWTProvider({ children }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [logoutCountdown, setLogoutCountdown] = useState(null);
  const { setState: setConfigState } = useConfig();
  const { setMode } = useColorScheme();

  const loadUserThemeSettings = async (token) => {
    try {
      const response = await axios.get('/api/theme-settings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data) {
        const dbSettings = response.data;
        if (dbSettings.themeMode) {
          localStorage.setItem('theme-mode', dbSettings.themeMode);
          if (setMode) {
            setMode(dbSettings.themeMode);
          }
        }

        // For i18n: prefer the value already in localStorage (set by the user
        // just before a language-change reload) over the DB value. The DB value
        // lags behind because the save-to-DB effect runs after the reload fires.
        const STORAGE_KEY = 'berry-config-vite-js';
        let localI18n = null;
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) localI18n = JSON.parse(stored)?.i18n || null;
        } catch (_) {}

        const mappedSettings = {
          menuOrientation: dbSettings.menuOrientation,
          miniDrawer: dbSettings.miniDrawer,
          fontFamily: dbSettings.fontFamily,
          borderRadius: dbSettings.borderRadius,
          outlinedFilled: dbSettings.outlinedFilled,
          presetColor: dbSettings.presetColor,
          // Use localStorage i18n if present; fall back to DB value
          i18n: localI18n || dbSettings.i18n,
          themeDirection: dbSettings.themeDirection,
          container: dbSettings.container,
          dashboardLayout: dbSettings.dashboardLayout || 'glass'
        };
        
        setConfigState((prev) => ({
          ...prev,
          ...mappedSettings
        }));
      }
    } catch (err) {
      console.error('Failed to load user theme settings from DB:', err);
    }
  };

  const logout = async () => {
    try {
      if (state.user?.id) {
        await axios.post('/api/account/logout', { userId: state.user.id });
      }
    } catch (err) {
      console.error('Logout audit failed:', err);
    }
    setSession(null);
    dispatch({ type: LOGOUT });
    store.dispatch(clearPermissions());
    setLogoutCountdown(null);
  };

  useEffect(() => {
    let timer;
    if (logoutCountdown !== null && logoutCountdown > 0) {
      timer = setTimeout(() => setLogoutCountdown(logoutCountdown - 1), 1000);
    } else if (logoutCountdown === 0) {
      logout();
    }
    return () => clearTimeout(timer);
  }, [logoutCountdown]);

  useEffect(() => {
    const checkLicense = async () => {
      try {
        const response = await axios.get('/api/account/license-status');
        setLicenseStatus(response.data);

        console.log('License check:', response.data, 'User Admin:', state.user?.isBosAdmin);

        if (response.data.isExpired && state.isLoggedIn && state.user && state.user.isBosAdmin !== 1) {
          if (logoutCountdown === null) {
            console.log('LICENSE EXPIRED: Starting 45s countdown...');
            setLogoutCountdown(45);
          }
        } else {
          setLogoutCountdown(null); // Reset if license is renewed or admin logs in
        }
      } catch (err) {
        console.error('License verification failed:', err);
      }
    };

    checkLicense();
    const interval = setInterval(checkLicense, 60000); // check every 1 min
    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.user?.isBosAdmin, logoutCountdown === null]);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.sessionStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          loadUserThemeSettings(serviceToken);
          const response = await axios.get('/api/account/me');
          const { user } = response.data;
          // Keep sessionStorage in sync so SessionInfoBadge reads correctly
          setSessionContext(user.tenantId, user.divisionId, user.companyName, user.divisionName);
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          setSession(null);
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        setSession(null);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email, password, context = {}) => {
    const { tenantId, divisionId } = context;
    const response = await axios.post('/api/account/login', {
      email,
      password,
      tenantId: tenantId || null,
      divisionId: divisionId || null
    });
    const { serviceToken, user } = response.data;
    setSession(serviceToken);
    loadUserThemeSettings(serviceToken);
    // Persist company/division so they survive page refresh
    setSessionContext(
      user.tenantId,
      user.divisionId,
      user.companyName,
      user.divisionName
    );
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };

  const faceLogin = async (email, faceImage, context = {}, faceDescriptor = null) => {
    const { tenantId, divisionId } = context;
    const response = await axios.post('/api/account/face-login', {
      email,
      faceImage,
      faceDescriptor,
      tenantId: tenantId || null,
      divisionId: divisionId || null
    });
    const { serviceToken, user } = response.data;
    setSession(serviceToken);
    loadUserThemeSettings(serviceToken);
    setSessionContext(
      user.tenantId,
      user.divisionId,
      user.companyName,
      user.divisionName
    );
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };

  const switchContext = async (tenantId, divisionId) => {
    try {
      if (tenantId) sessionStorage.setItem('tenantId', tenantId);
      if (divisionId) sessionStorage.setItem('divisionId', String(divisionId));

      const response = await axios.get('/api/account/me', {
        headers: {
          'X-Tenant-ID': tenantId,
          'X-Division-ID': String(divisionId)
        }
      });
      const { user } = response.data;
      setSessionContext(user.tenantId, user.divisionId, user.companyName, user.divisionName);
      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user
        }
      });
      // Force refresh to ensure all components/hooks pick up the new context
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch context:', err);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    const response = await axios.post('/api/account/register', {
      id,
      email,
      password,
      firstName,
      lastName
    });
    let users = response.data;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      const localUsers = window.localStorage.getItem('users');
      users = [
        ...JSON.parse(localUsers),
        {
          id,
          email,
          password,
          name: `${firstName} ${lastName}`
        }
      ];
    }

    window.localStorage.setItem('users', JSON.stringify(users));
  };

  const resetPassword = async (email) => { };

  const updateProfile = (userData) => {
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: { ...state.user, ...userData }
      }
    });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, licenseStatus, logoutCountdown, login, logout, register, resetPassword, updateProfile, switchContext, faceLogin }}>{children}</JWTContext.Provider>;
}

export default JWTContext;

JWTProvider.propTypes = { children: PropTypes.node };
