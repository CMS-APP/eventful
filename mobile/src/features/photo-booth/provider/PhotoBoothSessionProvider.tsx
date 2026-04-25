import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

import { PhotoResult } from "expo-camera";

import type { PhotoBoothSessionContextValue } from "./photoBoothProviderSlices";

const PhotoBoothSessionContext =
  createContext<PhotoBoothSessionContextValue | null>(null);

export const usePhotoBoothSession = () => {
  const ctx = useContext(PhotoBoothSessionContext);
  if (ctx === null) {
    throw new Error(
      "usePhotoBoothSession must be used within PhotoBoothSessionProvider"
    );
  }
  return ctx;
};

export function PhotoBoothSessionProvider({
  children
}: {
  children: ReactNode;
}) {
  const [photos, setPhotos] = useState<PhotoResult[]>([]);
  const [photoBoothPage, setPhotoBoothPage] = useState("home");
  const [locked, setLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [isBoothRunning, setIsBoothRunningState] = useState(false);

  const setIsBoothRunning = useCallback((running: boolean) => {
    setIsBoothRunningState(running);
  }, []);

  const value = useMemo<PhotoBoothSessionContextValue>(
    () => ({
      photos,
      photoBoothPage,
      locked,
      lockPin,
      setPhotos,
      setPhotoBoothPage,
      setLocked,
      setLockPin,
      isBoothRunning,
      setIsBoothRunning
    }),
    [photos, photoBoothPage, locked, lockPin, isBoothRunning, setIsBoothRunning]
  );

  return (
    <PhotoBoothSessionContext.Provider value={value}>
      {children}
    </PhotoBoothSessionContext.Provider>
  );
}
