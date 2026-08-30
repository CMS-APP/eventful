import React, { useState } from "react";

import { BootContext } from "@/app/context/loading/BootContext";

const steps = [
  "Initialising app...",
  "Checking authentication...",
  "Checking required updates...",
  "Checking onboarding status...",
  "Checking paywall status...",
  "Updating your information...",
  "Checking notifications...",
  "Finishing up..."
];

const TOTAL_STEPS = steps.length - 1;

const initialState = {
  progress: 0,
  currentStep: steps[0],
  totalSteps: TOTAL_STEPS
};

export const BootProvider = ({ children }: { children: React.ReactNode }) => {
  const [loadingState, setLoadingState] = useState(initialState);

  const startLoading = () => {
    setLoadingState({
      progress: 0,
      currentStep: steps[0],
      totalSteps: TOTAL_STEPS
    });
  };

  const nextStep = () => {
    setLoadingState((prev) => ({
      ...prev,
      progress: prev.progress + 1,
      currentStep: steps[prev.progress + 1] || prev.currentStep
    }));
  };

  const stopLoading = () => {
    setLoadingState(initialState);
  };

  const value = {
    ...loadingState,
    startLoading,
    nextStep,
    stopLoading
  };

  return <BootContext.Provider value={value}>{children}</BootContext.Provider>;
};
