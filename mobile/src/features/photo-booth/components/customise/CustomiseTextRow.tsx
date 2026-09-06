import { StyleSheet, TextStyle, TouchableOpacity, View } from "react-native";

import { Input } from "@/design-system/components/inputs/Input";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

interface CustomiseTextRowProps {
  title: string;
  setTitle: (title: string) => void;
  placeholder: string;
  handleTitleFontPress: () => void;
  handleTitleSizePress: () => void;
  fontStyles: Record<string, TextStyle>;
  customTitleFont: string;
  customTitleFontSize: number;
}

export function CustomiseTextRow({
  title,
  setTitle,
  placeholder,
  handleTitleFontPress,
  handleTitleSizePress,
  fontStyles,
  customTitleFont,
  customTitleFontSize
}: CustomiseTextRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Input
          placeholder={placeholder}
          value={title}
          onChangeText={setTitle}
          backgroundColor={colors.white}
          textColor={colors.black}
        />
      </View>
      <View style={styles.fontContainer}>
        <Text type="body" color={colors.black}>
          Font
        </Text>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleTitleFontPress}
          hitSlop={getHitSlop("small")}
        >
          <Text
            style={[
              fontStyles[customTitleFont] ?? fontStyles["Poppins"],
              styles.fontButtonText
            ]}
          >
            Aa
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sizeContainer}>
        <Text type="body" color={colors.black}>
          Size
        </Text>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleTitleSizePress}
          hitSlop={getHitSlop("small")}
        >
          <Text type="body" color={colors.black}>
            {customTitleFontSize}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CONTROL_WIDTH = 48;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12
  },
  controlButton: {
    ...card.small,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: CONTROL_WIDTH
  },
  fontButtonText: {
    fontSize: 12,
    textAlign: "center",
    textTransform: "none"
  },
  fontContainer: {
    gap: 6
  },
  inputContainer: {
    flex: 1
  },
  sizeContainer: {
    gap: 6
  }
});
