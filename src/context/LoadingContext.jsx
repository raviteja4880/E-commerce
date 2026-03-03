import React, { createContext, useState, useCallback } from "react";

export const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const setProductsLoading = useCallback((loading) => {
    setIsProductsLoading(loading);
  }, []);

  return (
    <LoadingContext.Provider value={{ isProductsLoading, setProductsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
