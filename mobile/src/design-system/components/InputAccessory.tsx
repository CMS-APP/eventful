import {
  InputAccessoryView,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/utils/hitSlop";

export function InputAccessory({
  value,
  placeholder,
  nativeID,
  password
}: {
  value: string;
  placeholder: string;
  nativeID?: string;
  password?: boolean;
}) {
  const handleKeyboardDismiss = () => {
    Keyboard.dismiss();
  };

  if (Platform.OS === "ios") {
    return (
      <InputAccessoryView nativeID={nativeID ?? placeholder}>
        <View style={styles.accessoryInner}>
          <Text
            type="body"
            italic
            numberOfLines={1}
            style={styles.valueText}
            ellipsizeMode="head"
          >
            {password ? "•".repeat(value.length) : value}
          </Text>
          <TouchableOpacity
            onPress={handleKeyboardDismiss}
            hitSlop={getHitSlop("small")}
          >
            <Text type="subHeader" color={colors.primary}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  accessoryInner: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 12,
    marginHorizontal: 12,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 12
  },
  valueText: {
    color: colors.black,
    flex: 1,
    textAlign: "left",
    textTransform: "none"
  }
});
