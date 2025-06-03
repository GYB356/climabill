"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loadingState: LoadingState;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  anyLoading: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({});
  
  const startLoading = useCallback((key: string) => {
    setLoadingState(prev => ({ ...prev, [key]: true }));
  }, []);
  
  const stopLoading = useCallback((key: string) => {
    setLoadingState(prev => ({ ...prev, [key]: false }));
  }, []);
  
  const isLoading = useCallback((key: string) => {
    return !!loadingState[key];
  }, [loadingState]);
  
  const anyLoading = useCallback(() => {
    return Object.values(loadingState).some(Boolean);
  }, [loadingState]);
  
  const value = {
    loadingState,
    startLoading,
    stopLoading,
    isLoading,
    anyLoading
  };
  
  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Custom hook for handling loading state for async operations
 * @param key Unique identifier for this loading state
 * @returns Object with loading state and function to run async operation with loading indicators
 */
export function useLoadingOperation(key: string) {
  const { isLoading, startLoading, stopLoading } = useLoading();
  
  const withLoading = async <T,>(operation: () => Promise<T>): Promise<T> => {
    try {
      startLoading(key);
      return await operation();
    } finally {
      stopLoading(key);
    }
  };
  
  return {
    isLoading: isLoading(key),
    withLoading
  };
}
