import { ReactNode, useCallback, useEffect, useState } from "react";

import { AlertModal } from "@/design-system/components/overlays/AlertModal";
import { AlertOptions } from "@/types/AlertOptions";
import { setGlobalAlertModalFunction } from "@/utils/alertModal";

export function AlertModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [buttons, setButtons] = useState<AlertOptions[]>([]);

  const showAlertModal = useCallback(
    (
      nextTitle: string,
      nextMessage: string | undefined,
      nextButtons: AlertOptions[]
    ) => {
      setTitle(nextTitle);
      setMessage(nextMessage);
      setButtons(nextButtons);
      setVisible(true);
    },
    []
  );

  useEffect(() => {
    setGlobalAlertModalFunction(showAlertModal);
  }, [showAlertModal]);

  return (
    <>
      {children}
      <AlertModal
        visible={visible}
        title={title}
        message={message}
        buttons={buttons}
        onDismiss={() => setVisible(false)}
      />
    </>
  );
}
