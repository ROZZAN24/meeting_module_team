import { createContext, useContext, useState } from 'react';

const RibbonContext = createContext({ ribbonOpen: false, setRibbonOpen: () => {} });

export function RibbonProvider({ children }) {
  const [ribbonOpen, setRibbonOpen] = useState(false);
  return <RibbonContext.Provider value={{ ribbonOpen, setRibbonOpen }}>{children}</RibbonContext.Provider>;
}

export function useRibbon() {
  return useContext(RibbonContext);
}
