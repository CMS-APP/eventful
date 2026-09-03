import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeStackParamList } from "@/app/navigation";
import { accountNavigatorGestureOptions } from "@/features/account/accountNavigatorScreenOptions";
import { profileNavigatorGestureOptions } from "@/features/profile/profileNavigatorScreenOptions";

import { AccountNavigator } from "../account/AccountNavigator";
import { CreatePollScreen } from "../inspiration/screens/CreatePollScreen";
import { CreatePostScreen } from "../inspiration/screens/CreatePostScreen";
import { ProfileNavigator } from "../profile/ProfileNavigator";
import { HomeFollowsScreen } from "./screens/HomeFollowsScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { HomeUpdatesScreen } from "./screens/HomeUpdatesScreen";

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
        name="CreatePoll"
        component={CreatePollScreen}
        options={{ presentation: "modal", gestureEnabled: false }}
      />

      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ presentation: "modal", gestureEnabled: false }}
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
