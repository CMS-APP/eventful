import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { User } from "@/types/User";

import { UserPicture } from "../../../components/views/UserPicture";

interface ContactIconProps {
  user: User;
  size?: number;
  type?: string;
}

export function ContactIcon({
  user,
  size = 40,
  type = "app"
}: ContactIconProps) {
  if (user.uid && type === "app") {
    return <UserPicture uid={user.uid} size={size} />;
  }

  const name = user.name;
  const nameString = name ? name.charAt(0).toUpperCase() : "E";

  return (
    <View
      style={[
        styles.textBackground,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    >
      <Text type="body" color={colors.white}>
        {nameString}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  textBackground: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderColor: colors.white,
    borderWidth: 0.5,
    justifyContent: "center"
  }
});
