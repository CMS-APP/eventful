import { PhotoBoothProvider } from "@/features/photo-booth/context/PhotoBoothProvider";

import { PhotoBoothNavigator } from "./PhotoBoothNavigator";

export function PhotoBoothWithProvider() {
  return (
    <PhotoBoothProvider>
      <PhotoBoothNavigator />
    </PhotoBoothProvider>
  );
}
