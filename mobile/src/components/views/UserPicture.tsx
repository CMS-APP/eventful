import { useCallback, useEffect, useState } from "react";

import { Image, StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { syncUserPicture } from "@/services/cache";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { AppError } from "@/utils/error";
import { log } from "@/utils/logging";

interface UserPictureProps {
  uid: string;
  size?: number;
}

export function UserPicture({ uid, size = 50 }: UserPictureProps) {
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncPicture = useCallback(async () => {
    setImage(null);

    log("Syncing user picture 2", "info");
    if (!uid) {
      setLoading(false);
      return;
    }

    const user = await getUserInfo(uid);

    if (!user) {
      setLoading(false);
      return;
    }

    if (user.firstName && user.lastName) {
      setName(
        `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`
      );
    } else if (user.name) {
      setName(user.name.charAt(0).toUpperCase());
    } else {
      setName("?");
    }

    const imageUri = await syncUserPicture(user, false);
    setImage(imageUri ?? null);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    syncPicture();
  }, [syncPicture]);

  const height = size;
  const width = size;

  if (!name) {
    return null;
  }

  return (
    <View style={styles.button}>
      {image && !loading ? (
        <Image
          source={{ uri: image }}
          style={[styles.image, { height, width }]}
          onError={(error) => new AppError(error, "User Picture load error")}
        />
      ) : (
        <View style={[styles.textBackground, { height, width }]}>
          <Text type="body" style={{ color: colors.white }}>
            {name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: colors.white,
    borderRadius: 25,
    borderWidth: 0.5,
    overflow: "hidden"
  },
  image: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: 25,
    justifyContent: "center"
  },
  textBackground: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 25,
    justifyContent: "center"
  }
});
