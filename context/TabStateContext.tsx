import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TabState {
  [key: string]: any;
}

interface TabStateContextProps {
  state: TabState;
  setState: React.Dispatch<React.SetStateAction<TabState>>;
}

const TabStateContext = createContext<TabStateContextProps | undefined>(undefined);

export const TabStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TabState>({});

  return (
    <TabStateContext.Provider value={{ state, setState }}>
      {children}
    </TabStateContext.Provider>
  );
};

export const useTabState = () => {
  const context = useContext(TabStateContext);
  if (!context) {
    throw new Error('useTabState must be used within a TabStateProvider');
  }
  return context;
};