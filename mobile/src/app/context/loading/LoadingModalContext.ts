import { createContext, useContext } from "react";

export interface ILoadingModalContext {
  setLoading: (loading: boolean) => void;
}

export const LoadingModalContext =
  createContext<ILoadingModalContext | null>(null);

export function useLoadingModal(): ILoadingModalContext {
  const context = useContext(LoadingModalContext);
  if (!context) {
    throw new Error(
      "LoadingModalContext must be used within a LoadingModalProvider"
    );
  }
  return context;
}
