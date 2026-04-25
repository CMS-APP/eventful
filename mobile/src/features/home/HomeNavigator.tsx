import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeStackParamList } from "@/features/app/navigationTypes";
import { accountNavigatorGestureOptions } from "@/features/account/accountNavigatorScreenOptions";
import { profileNavigatorGestureOptions } from "@/features/profile/profileNavigatorScreenOptions";

import { AccountNavigator } from "../account/AccountNavigator";
import { PhotoBoothNavigator } from "../photo-booth/PhotoBoothNavigator";
import { PhotoBoothProvider } from "../photo-booth/provider/PhotoBoothProvider";
import { ProfileNavigator } from "../profile/ProfileNavigator";
import { HomeFollowsScreen } from "./screens/HomeFollowsScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { HomeUpdatesScreen } from "./screens/HomeUpdatesScreen";

function PhotoBoothWithProvider() {
  return (
    <PhotoBoothProvider>
      <PhotoBoothNavigator />
    </PhotoBoothProvider>
  );
}

export function HomeNavigator() {
  const Stack = createNativeStackNavigator<HomeStackParamList>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="HomeView" component={HomeScreen} />
      <Stack.Screen name="HomeUpdates" component={HomeUpdatesScreen} />
      <Stack.Screen name="HomeFollows" component={HomeFollowsScreen} />

      <Stack.Screen
        name="PhotoBooth"
        component={PhotoBoothWithProvider}
        options={{ gestureEnabled: true, presentation: "transparentModal" }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileNavigator}
        options={profileNavigatorGestureOptions}
      />
      <Stack.Screen
        name="Account"
        component={AccountNavigator}
        options={accountNavigatorGestureOptions}
      />
    </Stack.Navigator>
  );
}
