import { useEffect } from "react";

import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useDisableBackButton } from "@/app/hooks/useDisableBackButton";
import type { PhotoBoothStackParamList } from "@/app/navigation";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";

import { PhotoBoothCamera } from "./screens/PhotoBoothCamera";
import { PhotoBoothColorPicker } from "./screens/PhotoBoothColorPicker";
import { PhotoBoothCustomise } from "./screens/PhotoBoothCustomise";
import { PhotoBoothEventGallery } from "./screens/PhotoBoothEventGallery";
import { PhotoBoothGallery } from "./screens/PhotoBoothGallery";
import { PhotoBoothGuidedAccessInfo } from "./screens/PhotoBoothGuidedAccessInfo";
import { PhotoBoothHome } from "./screens/PhotoBoothHome";
import { PhotoBoothInspiration } from "./screens/PhotoBoothInspiration";
import { PhotoBoothPhoto } from "./screens/PhotoBoothPhoto";
import { PhotoBoothRedoPhoto } from "./screens/PhotoBoothRedoPhoto";
import { PhotoBoothResult } from "./screens/PhotoBoothResult";

const Stack = createNativeStackNavigator<PhotoBoothStackParamList>();

export function PhotoBoothNavigator() {
  const { isBoothRunning, locked } = usePhotoBoothSession();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !locked });
  }, [navigation, locked]);

  useDisableBackButton(locked);

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
      <Stack.Screen
        name="PhotoBoothColorPicker"
        component={PhotoBoothColorPicker}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="PhotoBoothGallery" component={PhotoBoothGallery} />
      <Stack.Screen
        name="PhotoBoothEventGallery"
        component={PhotoBoothEventGallery}
      />
      <Stack.Screen name="PhotoBoothPhoto" component={PhotoBoothPhoto} />
      <Stack.Screen
        name="PhotoBoothGuidedAccessInfo"
        component={PhotoBoothGuidedAccessInfo}
      />
      <Stack.Screen
        name="PhotoBoothInspiration"
        component={PhotoBoothInspiration}
      />
    </Stack.Navigator>
  );
}
