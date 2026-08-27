import {
  BottomTabBarProps,
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";

import { MainStackParamList } from "@/app/navigationTypes";

import { CalendarNavigator } from "../calendar/CalendarNavigator";
import { ContactsNavigator } from "../contacts/navigators/ContactsNavigator";
import { EventsNavigator } from "../events/EventsNavigator";
import { HomeNavigator } from "../home/HomeNavigator";
import { InspirationNavigator } from "../inspiration/InspirationNavigator";
import { MainTabBar } from "./components/MainTabBar";

const Tab = createBottomTabNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => <MainTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{ lazy: true }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsNavigator}
        options={{ lazy: true }}
      />
      <Tab.Screen
        name="Inspiration"
        component={InspirationNavigator}
        options={{ lazy: false }}
      />
      <Tab.Screen
        name="Events"
        component={EventsNavigator}
        options={{ lazy: false }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarNavigator}
        options={{ lazy: false }}
      />
    </Tab.Navigator>
  );
}
