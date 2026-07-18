import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type LoadingContextType = {
  showSplash: boolean;
  setShowSplash: (val: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  // Always default to true on mount (which happens on every hard refresh)
  const [showSplash, setShowSplash] = useState(true);

  return (
    <LoadingContext.Provider value={{ showSplash, setShowSplash }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}
