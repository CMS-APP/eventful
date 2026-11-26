import Slider from "@react-native-community/slider";

import { useState } from "react";

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
  onFontSizeChange: (size: number) => void;
  fontStyles: Record<string, TextStyle>;
  customTitleFont: string;
  customTitleFontSize: number;
}

export function CustomiseTextRow({
  title,
  setTitle,
  placeholder,
  handleTitleFontPress,
  onFontSizeChange,
  fontStyles,
  customTitleFont,
  customTitleFontSize
}: CustomiseTextRowProps) {
  const [draggingFontSize, setDraggingFontSize] = useState<number | null>(null);

  function handleSlidingComplete(size: number) {
    onFontSizeChange(size);
    setDraggingFontSize(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
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
      </View>

      <View style={styles.sizeRow}>
        <Text type="body" color={colors.black}>
          Size
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_FONT_SIZE}
          maximumValue={MAX_FONT_SIZE}
          step={1}
          value={customTitleFontSize}
          onValueChange={setDraggingFontSize}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.lightGray}
          thumbTintColor={colors.primaryTint}
        />
        <Text type="body" color={colors.black} style={styles.sizeValue}>
          {draggingFontSize ?? customTitleFontSize}
        </Text>
      </View>
    </View>
  );
}

const CONTROL_WIDTH = 48;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    gap: 8
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
  sizeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  sizeValue: {
    textAlign: "right",
    width: 24
  },
  slider: {
    flex: 1
  },
  topRow: {
    flexDirection: "row",
    gap: 12
  }
});
