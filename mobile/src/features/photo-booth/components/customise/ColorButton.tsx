import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

import { PhotoBoothStackNavigation } from "../../photoBoothStackParams";

interface ColorButtonProps {
  color: string;
  type: string;
}

export function ColorButton({ color, type }: ColorButtonProps) {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const handlePress = useCallback(() => {
    navigation.navigate("PhotoBoothColorPicker", {
      type: type,
      color: color
    });
  }, [navigation, type, color]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.flexContainer}
      hitSlop={getHitSlop("small")}
    >
      <View style={styles.container}>
        <Text type="body" style={styles.text}>
          {type === "text" ? "Text Color" : "Frame Color"}
        </Text>
        <View style={[styles.colorBox, { backgroundColor: color }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  colorBox: {
    borderColor: colors.lightGray,
    borderRadius: 12,
    borderWidth: 2,
    height: 40,
    width: "100%"
  },
  container: {
    flexDirection: "column",
    gap: 6
  },
  flexContainer: {
    flex: 1
  },
  text: {
    marginLeft: 6,
    textAlign: "left"
  }
});
