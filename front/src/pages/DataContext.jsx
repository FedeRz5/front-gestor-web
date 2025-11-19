import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = () => {
    setDataVersion(prevVersion => prevVersion + 1);
  };

  return <DataContext.Provider value={{ dataVersion, refreshData }}>{children}</DataContext.Provider>;
};