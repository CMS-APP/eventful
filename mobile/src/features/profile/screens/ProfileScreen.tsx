import { View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Screen } from "@/components/views/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { globalStyles } from "@/design-system/tokens/globalStyles";
import {
  AllStackParamList,
  ProfileStackParamList
} from "@/features/app/navigationTypes";

import { ProfileInvites } from "../components/ProfileInvites";
import { ProfileTop } from "../components/ProfileTop";

interface ProfileScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<ProfileStackParamList, "ProfileView">;
}

export function ProfileScreen({ route }: ProfileScreenProps) {
  const user = route.params?.user;

  if (!user) {
    return <View />;
  }

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Profile",
          dark: true,
          backAction: true
        },
        backgroundColor: colors.primary
      }}
      contentConfig={{
        tabBarPresent: false
      }}
    >
      <View style={globalStyles.containerPrimary}>
        <ProfileTop user={user} />
        <ProfileInvites user={user} />
      </View>
    </Screen>
  );
}
