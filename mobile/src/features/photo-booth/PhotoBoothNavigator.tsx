import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { PhotoBoothStackParamList } from "./photoBoothStackParams";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { PhotoBoothCamera } from "./screens/PhotoBoothCamera";
import { PhotoBoothColorPicker } from "./screens/PhotoBoothColorPicker";
import { PhotoBoothCustomise } from "./screens/PhotoBoothCustomise";
import { PhotoBoothEventGallery } from "./screens/PhotoBoothEventGallery";
import { PhotoBoothGallery } from "./screens/PhotoBoothGallery";
import { PhotoBoothHome } from "./screens/PhotoBoothHome";
import { PhotoBoothLayout } from "./screens/PhotoBoothLayout";
import { PhotoBoothPhoto } from "./screens/PhotoBoothPhoto";
import { PhotoBoothPreview } from "./screens/PhotoBoothPreview";
import { PhotoBoothRedoPhoto } from "./screens/PhotoBoothRedoPhoto";
import { PhotoBoothResult } from "./screens/PhotoBoothResult";
import { PhotoBoothSettings } from "./screens/PhotoBoothSettings";
import { PhotoBoothTextColors } from "./screens/PhotoBoothTextColors";

const Stack = createNativeStackNavigator<PhotoBoothStackParamList>();

export function PhotoBoothNavigator() {
  const { isBoothRunning } = usePhotoBoothSession();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: !isBoothRunning
      }}
    >
      <Stack.Screen name="PhotoBoothHome" component={PhotoBoothHome} />
      <Stack.Screen name="PhotoBoothCamera" component={PhotoBoothCamera} />
      <Stack.Screen
        name="PhotoBoothResult"
        component={PhotoBoothResult}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="PhotoBoothRedoPhoto"
        component={PhotoBoothRedoPhoto}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="PhotoBoothCustomise"
        component={PhotoBoothCustomise}
      />

      <Stack.Screen name="PhotoBoothLayout" component={PhotoBoothLayout} />
      <Stack.Screen name="PhotoBoothPreview" component={PhotoBoothPreview} />
      <Stack.Screen
        name="PhotoBoothTextColors"
        component={PhotoBoothTextColors}
      />
      <Stack.Screen name="PhotoBoothSettings" component={PhotoBoothSettings} />
      <Stack.Screen
        name="PhotoBoothColorPicker"
        component={PhotoBoothColorPicker}
      />

      <Stack.Screen name="PhotoBoothGallery" component={PhotoBoothGallery} />

      <Stack.Screen
        name="PhotoBoothEventGallery"
        component={PhotoBoothEventGallery}
      />

      <Stack.Screen name="PhotoBoothPhoto" component={PhotoBoothPhoto} />

      {/* <Stack.Screen
        name="PhotoBoothGuidedAccessInfo"
        component={PhotoBoothGuidedAccessInfo}
      /> */}
    </Stack.Navigator>
  );
}
