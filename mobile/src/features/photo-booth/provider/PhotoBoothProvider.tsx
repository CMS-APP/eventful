import type { ReactNode } from "react";

import { PhotoBoothCameraProvider } from "./PhotoBoothCameraProvider";
import { PhotoBoothPermissionsProvider } from "./PhotoBoothPermissionsProvider";
import { PhotoBoothSessionProvider } from "./PhotoBoothSessionProvider";
import { PhotoBoothSettingsProvider } from "./PhotoBoothSettingsProvider";

export type {
  PhotoBoothCameraContextValue,
  PhotoBoothPermissionsContextValue,
  PhotoBoothSessionContextValue,
  PhotoBoothSettingsValue
} from "./photoBoothProviderSlices";

export function PhotoBoothProvider({
  children
}: {
  children: ReactNode;
}) {
  return (
    <PhotoBoothPermissionsProvider>
      <PhotoBoothSettingsProvider>
        <PhotoBoothCameraProvider>
          <PhotoBoothSessionProvider>{children}</PhotoBoothSessionProvider>
        </PhotoBoothCameraProvider>
      </PhotoBoothSettingsProvider>
    </PhotoBoothPermissionsProvider>
  );
}
