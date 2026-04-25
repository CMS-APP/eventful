import React, { createContext, useContext, useState } from "react";

import { AppError } from "@/utils/error";

const LoadingContext = createContext<{
  isLoading: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  startLoading: (totalSteps: number, initialStep?: string) => void;
  updateProgress: (progress: number, step?: string) => void;
  nextStep: (step: string) => void;
  stopLoading: () => void;
}>({
  isLoading: false,
  progress: 0,
  currentStep: "",
  totalSteps: 0,
  startLoading: () => {},
  updateProgress: () => {},
  nextStep: () => {},
  stopLoading: () => {}
});

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    new AppError(
      "useLoading must be used within a LoadingProvider",
      "LoadingProvider: Error using loading"
    );
  }
  return context;
};

export const LoadingProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    progress: 0,
    currentStep: "",
    totalSteps: 0
  });

  const startLoading = (totalSteps: number, initialStep = "") => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      currentStep: initialStep,
      totalSteps
    });
  };

  const updateProgress = (progress: number, step = "") => {
    setLoadingState((prev) => ({
      ...prev,
      progress,
      currentStep: step || prev.currentStep
    }));
  };

  const nextStep = (step: string) => {
    setLoadingState((prev) => ({
      ...prev,
      progress: prev.progress + 1,
      currentStep: step
    }));
  };

  const stopLoading = () => {
    setLoadingState({
      isLoading: false,
      progress: 0,
      currentStep: "",
      totalSteps: 0
    });
  };

  const value = {
    ...loadingState,
    startLoading,
    updateProgress,
    nextStep,
    stopLoading
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};
