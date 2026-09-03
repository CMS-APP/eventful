import {
  BottomTabBarProps,
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";

import { MainStackParamList } from "@/app/navigation";
import { PhotoBoothWithProvider } from "@/features/photo-booth/PhotoBoothWithProvider";

import { CalendarNavigator } from "../calendar/CalendarNavigator";
import { ContactsNavigator } from "../contacts/navigators/ContactsNavigator";
import { EventsNavigator } from "../events/EventsNavigator";
import { HomeNavigator } from "../home/HomeNavigator";
import { TabBar } from "./components/TabBar";

const Tab = createBottomTabNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
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
        name="PhotoBooth"
        component={PhotoBoothWithProvider}
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
