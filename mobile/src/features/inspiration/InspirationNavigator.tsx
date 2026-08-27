import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { InspirationStackParamList } from "@/app/navigationTypes";
import { accountNavigatorGestureOptions } from "@/features/account/accountNavigatorScreenOptions";

import { AccountNavigator } from "../account/AccountNavigator";
import { CreatePollScreen } from "./screens/CreatePollScreen";
import { CreatePostScreen } from "./screens/CreatePostScreen";
import { InspirationScreen } from "./screens/InspirationScreen";

export function InspirationNavigator() {
  const Stack = createNativeStackNavigator<InspirationStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InspirationHome" component={InspirationScreen} />

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
        name="Account"
        component={AccountNavigator}
        options={accountNavigatorGestureOptions}
      />
    </Stack.Navigator>
  );
}
