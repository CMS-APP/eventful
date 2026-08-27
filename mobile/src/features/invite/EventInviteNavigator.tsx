import { RouteProp, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  AppStackParamList,
  EventInviteStackParamList
} from "../../app/navigation";
import { EventInviteFoodDrinkScreen } from "./screens/EventInviteFoodDrinkScreen";
import { EventInviteGuestsScreen } from "./screens/EventInviteGuestsScreen";
import { EventInviteHomeScreen } from "./screens/EventInviteHomeScreen";
import { EventInviteItineraryScreen } from "./screens/EventInviteItineraryScreen";
import { EventInviteMusicScreen } from "./screens/EventInviteMusicScreen";

export function EventInviteNavigator() {
  const Stack = createNativeStackNavigator<EventInviteStackParamList>();
  const route = useRoute<RouteProp<AppStackParamList, "EventInvite">>();
  const initialParams = route.params;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="EventInviteHome"
        component={EventInviteHomeScreen}
        initialParams={initialParams}
      />
      <Stack.Screen
        name="EventInviteGuests"
        component={EventInviteGuestsScreen}
        initialParams={initialParams}
      />
      <Stack.Screen
        name="EventInviteItinerary"
        component={EventInviteItineraryScreen}
        initialParams={initialParams}
      />
      <Stack.Screen
        name="EventInviteMusic"
        component={EventInviteMusicScreen}
        initialParams={initialParams}
      />
      <Stack.Screen
        name="EventInviteDietary"
        component={EventInviteFoodDrinkScreen}
        initialParams={initialParams}
      />
    </Stack.Navigator>
  );
}
