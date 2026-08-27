import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { EventsStackParamList } from "@/app/navigationTypes";
import { accountNavigatorGestureOptions } from "@/features/account/accountNavigatorScreenOptions";
import { profileNavigatorGestureOptions } from "@/features/profile/profileNavigatorScreenOptions";

import { AccountNavigator } from "../account/AccountNavigator";
import { EventInviteGuestLinkScreen } from "../invite/screens/EventInviteGuestLinkScreen";
import { EventInviteGuestManualScreen } from "../invite/screens/EventInviteGuestManualScreen";
import { ProfileNavigator } from "../profile/ProfileNavigator";
import { EventInviteGuest } from "./components/guest-list/EventInviteGuest";
import { EventDecorScreenEdit } from "./screens/EventDecorScreenEdit";
import { EventDrinkScreenEdit } from "./screens/EventDrinkScreenEdit";
import { EventEditScreen } from "./screens/EventEditScreen";
import { EventFoodScreenEdit } from "./screens/EventFoodScreenEdit";
import { EventNotesScreenEdit } from "./screens/EventNotesScreenEdit";
import { EventOutfitScreenEdit } from "./screens/EventOutfitScreenEdit";
import { EventSectionScreen } from "./screens/EventSectionScreen";
import { EventsScreen } from "./screens/EventsScreen";

export function EventsNavigator() {
  const Stack = createNativeStackNavigator<EventsStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="EventEdit" component={EventEditScreen} />
      <Stack.Screen name="EventEditSection" component={EventSectionScreen} />
      <Stack.Screen name="EventEditFood" component={EventFoodScreenEdit} />
      <Stack.Screen name="EventEditDrink" component={EventDrinkScreenEdit} />
      <Stack.Screen name="EventEditDecor" component={EventDecorScreenEdit} />
      <Stack.Screen name="EventEditOutfit" component={EventOutfitScreenEdit} />
      <Stack.Screen name="EventEditNotes" component={EventNotesScreenEdit} />
      <Stack.Screen name="EventInviteGuest" component={EventInviteGuest} />
      <Stack.Screen
        name="EventInviteGuestLink"
        component={EventInviteGuestLinkScreen}
      />
      <Stack.Screen
        name="EventInviteGuestManual"
        component={EventInviteGuestManualScreen}
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
