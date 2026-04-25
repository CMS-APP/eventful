import React, { useContext } from "react";

interface IConfig {
  contextName: string;
  providerName: string;
}

const useContextWrapper = <T>(
  context: React.Context<T>,
  config: IConfig
): T => {
  const contextValue = useContext(context);
  const { contextName, providerName } = config;

  if (!contextValue) {
    throw new Error(`${contextName} must be used within a ${providerName}`);
  }

  return contextValue;
};

export { useContextWrapper };
