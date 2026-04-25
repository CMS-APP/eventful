import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState
} from "react";

import { ErrorNotification } from "@/components/views/ErrorNotification";
import { setGlobalNotificationFunctions } from "@/utils/appNotifications";

// Interface for the NotificationContextType
interface NotificationContextType {
  showError: (message: string, duration?: number) => void;
  hideError: () => void;
}

// Context for the NotificationProvider
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Interface for the NotificationProviderProps
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages global error notifications throughout the app.
 * Handles showing/hiding error messages and registers global notification functions.
 * @param children - Props containing child components
 * @returns NotificationProvider component with error notification functionality
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorVisible, setErrorVisible] = useState<boolean>(false);
  const [errorDuration, setErrorDuration] = useState<number>(4000);

  const showError = useCallback((message: string, duration: number = 4000) => {
    setErrorMessage(message);
    setErrorDuration(duration);
    setErrorVisible(true);
  }, []);

  const hideError = useCallback(() => {
    setErrorVisible(false);
    setTimeout(() => {
      setErrorMessage("");
    }, 300);
  }, []);

  // Register global notification functions
  useEffect(() => {
    setGlobalNotificationFunctions(showError);
  }, [showError]);

  return (
    <NotificationContext.Provider value={{ showError, hideError }}>
      {children}
      <ErrorNotification
        message={errorMessage}
        visible={errorVisible}
        onDismiss={hideError}
        duration={errorDuration}
      />
    </NotificationContext.Provider>
  );
}
