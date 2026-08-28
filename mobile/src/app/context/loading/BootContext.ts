import { createContext, useContext } from "react";

export type BootContextType = {
  progress: number;
  currentStep: string;
  totalSteps: number;
  startLoading: (initialStep?: string) => void;
  nextStep: () => void;
  stopLoading: () => void;
};

export const BootContext = createContext<BootContextType | null>(null);

export function useBoot(): BootContextType {
  const context = useContext(BootContext);
  if (!context) {
    throw new Error("useBoot must be used within a BootProvider");
  }
  return context;
}
