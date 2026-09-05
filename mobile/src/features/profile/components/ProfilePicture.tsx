import { useEffect, useState } from "react";

import { Image, StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { syncUserPicture } from "@/services/local/cache";
import { User } from "@/types/User";
import { log } from "@/utils/logging";
import { getInitials } from "@/utils/validation";

interface ProfilePictureProps {
  user: User;
  size: number;
  borderColor?: string;
  borderWidth?: number;
}

export function ProfilePicture({
  user,
  size,
  borderColor = colors.black,
  borderWidth = 0
}: ProfilePictureProps) {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function syncPicture() {
    try {
      setImage(null);
      if (!user) return;

      if (user.name) {
        setName(
          getInitials(user.firstName || "", user.lastName || "", user.name)
        );
      }

      const imageUri = await syncUserPicture(user, false);
      setImage(imageUri || null);
      setLoading(false);
    } catch {
      log("Error Syncing Picture: ", "error");
    }
  }

  useEffect(() => {
    syncPicture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: borderColor,
          borderWidth: borderWidth,
          borderRadius: size
        }
      ]}
    >
      {image && !loading ? (
        <Image
          source={{ uri: image }}
          style={[styles.image, { height: size, width: size }]}
        />
      ) : (
        <View
          style={[
            styles.placeholderContainer,
            {
              backgroundColor: size >= 50 ? colors.primaryTint : colors.primary,
              borderRadius: size / 2,
              height: size,
              width: size
            }
          ]}
        >
          <Text
            type={size > 50 ? "header" : "body"}
            color={colors.white}
            center
          >
            {name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  image: {
    borderRadius: 120
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center"
  }
});
