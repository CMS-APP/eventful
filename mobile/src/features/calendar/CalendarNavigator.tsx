import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CalendarStackParamList } from "@/app/navigationTypes";
import { accountNavigatorGestureOptions } from "@/features/account/accountNavigatorScreenOptions";

import { AccountNavigator } from "../account/AccountNavigator";
import { CalendarScreen } from "./screens/CalendarScreen";

export function CalendarNavigator() {
  const Stack = createNativeStackNavigator<CalendarStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarView" component={CalendarScreen} />
      <Stack.Screen
        name="Account"
        component={AccountNavigator}
        options={accountNavigatorGestureOptions}
      />
    </Stack.Navigator>
  );
}
