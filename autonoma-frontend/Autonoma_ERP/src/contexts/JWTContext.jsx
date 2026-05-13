import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useState } from 'react';

// third party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'utils/axios';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

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
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
}

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export function JWTProvider({ children }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [logoutCountdown, setLogoutCountdown] = useState(null);

  const logout = async () => {
    try {
      if (state.user?.id) {
        await axios.post('/api/account/logout', { userId: state.user.id });
      }
    } catch (err) {
      console.error('Logout audit failed:', err);
    }
    // Clear session-based alert acknowledgments so they reappear after re-login
    sessionStorage.removeItem('license_alert_acknowledged');
    setSession(null);
    dispatch({ type: LOGOUT });
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
    const interval = setInterval(checkLicense, 600000); // check every 1 min
    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.user?.isBosAdmin, logoutCountdown === null]);

  // ==============================|| IDLE TRACKING ||============================== //

  const IDLE_THRESHOLD = 120000; // 2 minutes of inactivity
  const [lastActive, setLastActive] = useState(Date.now());
  const [isIdle, setIsIdle] = useState(false);
  const [idleStartTime, setIdleStartTime] = useState(null);

  useEffect(() => {
    if (!state.isLoggedIn) return;

    const handleActivity = () => {
      const now = Date.now();

      if (isIdle) {
        // User was idle and just came back
        const idleDuration = now - idleStartTime;
        if (idleDuration > 1000) {
          logIdleActivity(idleDuration);
        }
        setIsIdle(false);
        setIdleStartTime(null);
      }

      setLastActive(now);
    };

    const logIdleActivity = async (duration) => {
      try {
        await axios.post('/api/analytics/sessions/log', {
          userId: state.user?.id,
          pageName: 'SYSTEM_IDLE',
          pageUrl: window.location.pathname,
          entryTime: new Date(idleStartTime).toISOString(),
          exitTime: new Date().toISOString(),
          durationMs: duration,
          isIdle: true,
          idleTimeMs: duration
        });
        console.log(`[Analytics] Logged idle duration: ${Math.round(duration / 1000)}s`);
      } catch (err) {
        console.error('[Analytics] Failed to log idle activity:', err);
      }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, handleActivity));

    const checkIdle = setInterval(() => {
      const now = Date.now();
      if (!isIdle && (now - lastActive > IDLE_THRESHOLD)) {
        setIsIdle(true);
        setIdleStartTime(now);
        console.log('[Analytics] User is now IDLE');
      }
    }, 10000); // check every 10 seconds

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
      clearInterval(checkIdle);
    };
  }, [state.isLoggedIn, lastActive, isIdle, idleStartTime]);

  useEffect(() => {
    const checkSessionStatus = async () => {
      if (state.isLoggedIn && state.user?.id) {
        try {
          const response = await axios.get(`/api/analytics/sessions/check-status/${state.user.id}`);
          if (response.data === false) {
            console.warn('Session has been terminated by administrator.');
            logout();
          }
        } catch (err) {
          console.error('Session status check failed:', err);
        }
      }
    };

    const interval = setInterval(checkSessionStatus, 30000); // check every 30 seconds
    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.user?.id]);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/api/account/me');
          const { user } = response.data;
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/api/account/login', { email, password });
    const { serviceToken, user } = response.data;
    setSession(serviceToken);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
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

  return <JWTContext.Provider value={{ ...state, licenseStatus, logoutCountdown, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
}

export default JWTContext;

JWTProvider.propTypes = { children: PropTypes.node };
