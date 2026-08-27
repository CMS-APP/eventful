import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProfileStackParamList } from "@/app/navigationTypes";

import { ProfileFollowersScreen } from "./screens/ProfileFollowersScreen";
import { ProfileInviteScreen } from "./screens/ProfileInviteScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

export function ProfileNavigator() {
  const Stack = createNativeStackNavigator<ProfileStackParamList>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="ProfileView" component={ProfileScreen} />
      <Stack.Screen name="ProfileInvite" component={ProfileInviteScreen} />
      <Stack.Screen
        name="ProfileFollowers"
        component={ProfileFollowersScreen}
      />
    </Stack.Navigator>
  );
}
