import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { Toast } from "@/app/context/toast/Toast";
import { ToastContext } from "@/app/context/toast/ToastContext";
import type { ToastType } from "@/app/context/toast/const";
import { setGlobalToastFunction } from "@/utils/appNotifications";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (nextMessage: string, nextType: ToastType = "success") => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(nextMessage);
      setType(nextType);
      setVisible(true);

      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 1500);
    },
    []
  );

  useEffect(() => {
    setGlobalToastFunction(showToast);
  }, [showToast]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} type={type} visible={visible} />
    </ToastContext.Provider>
  );
}
