import type { ReactNode } from "react";

import { PhotoBoothCameraProvider } from "@/features/photo-booth/context/camera/PhotoBoothCameraProvider";
import { PhotoBoothPermissionsProvider } from "@/features/photo-booth/context/permissions/PhotoBoothPermissionsProvider";
import { PhotoBoothSessionProvider } from "@/features/photo-booth/context/session/PhotoBoothSessionProvider";
import { PhotoBoothSettingsProvider } from "@/features/photo-booth/context/settings/PhotoBoothSettingsProvider";

export type { PhotoBoothCameraContextValue } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
export type { PhotoBoothPermissionsContextValue } from "@/features/photo-booth/context/permissions/PhotoBoothPermissionsContext";
export type { PhotoBoothSessionContextValue } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
export type { PhotoBoothSettingsValue } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

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
