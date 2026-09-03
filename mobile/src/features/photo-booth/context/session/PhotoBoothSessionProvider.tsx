import { useDispatch } from "react-redux";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PhotoResult } from "expo-camera";

import { PhotoBoothSessionContext } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import type { PhotoBoothSessionContextValue } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { setPhotoBoothLocked } from "@/store/UserSlice";

export function PhotoBoothSessionProvider({
  children
}: {
  children: ReactNode;
}) {
  const dispatch = useDispatch();
  const [photos, setPhotos] = useState<PhotoResult[]>([]);
  const [photoBoothPage, setPhotoBoothPage] = useState("home");
  const [locked, setLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [isBoothRunning, setIsBoothRunningState] = useState(false);

  useEffect(() => {
    dispatch(setPhotoBoothLocked(locked));
  }, [locked, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setPhotoBoothLocked(false));
    };
  }, [dispatch]);

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
