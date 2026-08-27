import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AccountStackParamList } from "@/app/navigationTypes";

import { ProfileNavigator } from "../profile/ProfileNavigator";
import { SettingsScreen } from "../settings/screens/SettingsScreen";
import { AccountPictureCameraScreen } from "./screens/AccountPictureCameraScreen";
import { AccountScreen } from "./screens/AccountScreen";

export function AccountNavigator() {
  const Stack = createNativeStackNavigator<AccountStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountView" component={AccountScreen} />
      <Stack.Screen
        name="AccountPictureCamera"
        component={AccountPictureCameraScreen}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ gestureEnabled: true }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
}
