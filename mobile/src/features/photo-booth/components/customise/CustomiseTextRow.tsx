import { StyleSheet, TextStyle, TouchableOpacity, View } from "react-native";

import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/utils/hitSlop";

interface CustomiseTextRowProps {
  title: string;
  setTitle: (title: string) => void;
  placeholder: string;
  handleTitleFontPress: () => void;
  handleTitleSizePress: () => void;
  fonts: { [key: string]: { style: TextStyle; font: string } };
  customTitleFont: string;
  customTitleFontSize: number;
}

export function CustomiseTextRow({
  title,
  setTitle,
  placeholder,
  handleTitleFontPress,
  handleTitleSizePress,
  fonts,
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
          backgroundColor={colors.lightGray}
          textColor={colors.black}
        />
      </View>
      <View style={styles.fontContainer}>
        <Text type="body" color={colors.black}>
          Font
        </Text>
        <TouchableOpacity
          onPress={handleTitleFontPress}
          hitSlop={getHitSlop("small")}
        >
          <View style={styles.fontButton}>
            <View style={styles.fontButtonInner}>
              <Text
                style={[
                  (fonts[customTitleFont] ?? fonts["Poppins"]).style,
                  styles.fontButtonText
                ]}
              >
                Aa
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sizeContainer}>
        <Text type="body" color={colors.black}>
          Size
        </Text>
        <TouchableOpacity
          onPress={handleTitleSizePress}
          hitSlop={getHitSlop("small")}
        >
          <View style={styles.sizeButton}>
            <Text type="body" color={colors.black}>
              {customTitleFontSize}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12
  },
  fontButton: {
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    justifyContent: "center",
    padding: 13
  },
  fontButtonInner: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 24
  },
  fontButtonText: {
    fontSize: 12,
    justifyContent: "center",
    textAlign: "center"
  },
  fontContainer: {
    gap: 12
  },
  inputContainer: {
    flex: 1
  },
  sizeButton: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 12
  },
  sizeContainer: {
    gap: 12
  }
});
