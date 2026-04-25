import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AccountNavigator } from "@/features/account/AccountNavigator";
import { accountNavigatorGestureOptions } from "@/features/account/accountNavigatorScreenOptions";
import { ContactsStackParamList } from "@/features/app/navigationTypes";
import { ProfileNavigator } from "@/features/profile/ProfileNavigator";
import { profileNavigatorGestureOptions } from "@/features/profile/profileNavigatorScreenOptions";

import { ContactsInvitationScreen } from "../screens/ContactsInvitationScreen";
import { ContactsScreen } from "../screens/ContactsScreen";
import { ContactsSearchScreen } from "../screens/ContactsSearchScreen";

export function ContactsNavigator() {
  const Stack = createNativeStackNavigator<ContactsStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContactsHome" component={ContactsScreen} />
      <Stack.Screen
        name="ContactsInvitations"
        component={ContactsInvitationScreen}
      />
      <Stack.Screen name="ContactSearch" component={ContactsSearchScreen} />
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
