import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";

import { useEffect, useState } from "react";

import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { useAccountProfilePicture } from "@/features/account/useAccountProfilePicture";
import { UserState } from "@/store/UserSlice";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { getInitials } from "@/utils/validation";

interface AccountButtonProps {
  textColor?: string;
}

export function AccountButton({
  textColor = colors.secondary
}: AccountButtonProps) {
  const navigation = useNavigation();

  const name = useSelector((state: UserState) => state.name);
  const firstName = useSelector((state: UserState) => state.firstName);
  const lastName = useSelector((state: UserState) => state.lastName);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);
  const premium = useSelector((state: UserState) => state.premium);
  const [accountType, setAccountType] = useState<string | null>(null);

  const { image, loading } = useAccountProfilePicture();

  function handlePress() {
    navigation.navigate("Account" as never);
    haptics.soft();
  }

  useEffect(() => {
    if (photoBooth) setAccountType("Booth");
    else if (premium) setAccountType("Premium");
    else setAccountType("Free");
  }, [photoBooth, premium]);

  const getPulseColor = () => {
    if (photoBooth) {
      return textColor === colors.white ? colors.primary : colors.white;
    } else if (premium) {
      return textColor === colors.white ? colors.primary : colors.secondary;
    }
    return "transparent";
  };

  const pulseColor = getPulseColor();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <>
                {image && !loading ? (
                  <Image
                    source={{ uri: image }}
                    style={styles.image}
                    onError={() => {
                      log("Error Loading Photo", "error");
                      showErrorToast("Error Loading Photo");
                    }}
                  />
                ) : (
                  <View style={styles.textBackground}>
                    <Text type="subHeader" color={colors.primary}>
                      {getInitials(firstName, lastName, name)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
      {accountType !== "Free" && (
        <Text type="caption" color={pulseColor} style={styles.accountTypeText}>
          {accountType}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  accountTypeText: {
    marginTop: 4,
    textAlign: "center"
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
    width: 50
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center"
  },
  container: {
    position: "absolute",
    right: 20,
    top: 12,
    zIndex: 1
  },
  image: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.white,
    borderColor: colors.white,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  textBackground: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    width: 50
  }
});
