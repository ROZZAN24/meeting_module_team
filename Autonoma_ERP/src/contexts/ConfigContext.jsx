import PropTypes from 'prop-types';
import { createContext, useMemo, useState } from 'react';

// project imports
import config from 'config';
import { useLocalStorage } from 'hooks/useLocalStorage';

// ==============================|| CONFIG CONTEXT ||============================== //

export const ConfigContext = createContext(undefined);

// ==============================|| CONFIG PROVIDER ||============================== //

export function ConfigProvider({ children }) {
  const { state, setState, setField, resetState } = useLocalStorage('berry-config-vite-js', config);
  const [customizationOpen, setCustomizationOpen] = useState(false);

  const memoizedValue = useMemo(
    () => ({ state, setState, setField, resetState, customizationOpen, setCustomizationOpen }),
    [state, setField, setState, resetState, customizationOpen]
  );

  return <ConfigContext.Provider value={memoizedValue}>{children}</ConfigContext.Provider>;
}

ConfigProvider.propTypes = { children: PropTypes.node };
