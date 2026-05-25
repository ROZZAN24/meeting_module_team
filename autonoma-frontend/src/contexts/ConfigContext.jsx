import PropTypes from 'prop-types';
import { createContext, useMemo, useState, useEffect } from 'react';

// project imports
import config from 'config';
import { useLocalStorage } from 'hooks/useLocalStorage';
import axios from 'utils/axios';

// ==============================|| CONFIG CONTEXT ||============================== //

export const ConfigContext = createContext(undefined);

// ==============================|| CONFIG PROVIDER ||============================== //

export function ConfigProvider({ children }) {
  const { state, setState, setField, resetState } = useLocalStorage('berry-config-vite-js', config);
  const [customizationOpen, setCustomizationOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('serviceToken');
    if (!token) return;

    const saveToDb = async () => {
      try {
        await axios.post('/api/theme-settings', {
          themeMode: localStorage.getItem('theme-mode') || 'system',
          menuOrientation: state.menuOrientation,
          miniDrawer: state.miniDrawer,
          fontFamily: state.fontFamily,
          borderRadius: state.borderRadius,
          outlinedFilled: state.outlinedFilled,
          presetColor: state.presetColor,
          i18n: state.i18n,
          themeDirection: state.themeDirection,
          container: state.container,
          dashboardLayout: state.dashboardLayout || 'glass'
        });
      } catch (err) {
        console.error('Failed to save theme settings to DB:', err);
      }
    };

    const timer = setTimeout(saveToDb, 1000);
    return () => clearTimeout(timer);
  }, [state]);

  const memoizedValue = useMemo(
    () => ({ state, setState, setField, resetState, customizationOpen, setCustomizationOpen }),
    [state, setField, setState, resetState, customizationOpen]
  );

  return <ConfigContext.Provider value={memoizedValue}>{children}</ConfigContext.Provider>;
}

ConfigProvider.propTypes = { children: PropTypes.node };

