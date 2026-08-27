import React, { useState } from "react";

import { LoadingModal } from "@/app/context/loading/LoadingModal";
import { LoadingModalContext } from "@/app/context/loading/LoadingModalContext";

export const LoadingModalProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingModalContext.Provider value={{ setLoading }}>
      {children}
      <LoadingModal visible={loading} />
    </LoadingModalContext.Provider>
  );
};
