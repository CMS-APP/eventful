import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Dropdown } from "@/design-system/components/inputs/Dropdown";
import { CUSTOM_FONTS, getCustomFontStyle } from "@/design-system/tokens/fonts";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { CustomiseTextRow } from "./CustomiseTextRow";

const fontNames = Object.values(CUSTOM_FONTS);
const fontStyles = Object.fromEntries(
  fontNames.map((name) => [name, getCustomFontStyle(name)])
);

export function CustomiseText() {
  const {
    title,
    setTitle,
    subTitle,
    setSubTitle,
    customTitleFont,
    customTitleFontSize,
    customSubTitleFont,
    customSubTitleFontSize,
    setCustomTitleFont,
    setCustomTitleFontSize,
    setCustomSubTitleFont,
    setCustomSubTitleFontSize
  } = usePhotoBoothSettings();

  const fontSizes = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48];

  const [isFontPickerVisible, setIsFontPickerVisible] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [isFontSizePickerVisible, setIsFontSizePickerVisible] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState<string | null>(null);
  const [pickerType, setPickerType] = useState("title");

  const handleTitleFontPress = useCallback(() => {
    setIsFontPickerVisible(true);
    setPickerType("title");
    setSelectedFont(customTitleFont);
  }, [customTitleFont]);

  const handleTitleSizePress = useCallback(() => {
    setIsFontSizePickerVisible(true);
    setPickerType("title");
    setSelectedFontSize(customTitleFontSize + "pt");
  }, [customTitleFontSize]);

  const handleSubTitleFontPress = useCallback(() => {
    setIsFontPickerVisible(true);
    setPickerType("subTitle");
    setSelectedFont(customSubTitleFont as string);
  }, [customSubTitleFont]);

  const handleSubTitleSizePress = useCallback(() => {
    setIsFontSizePickerVisible(true);
    setPickerType("subTitle");
    setSelectedFontSize(customSubTitleFontSize + "pt");
  }, [customSubTitleFontSize]);

  const handleFontSelect = useCallback(
    (item: string) => {
      setSelectedFont(item);
      if (pickerType === "title") {
        setCustomTitleFont(item);
      } else {
        setCustomSubTitleFont(item);
      }
    },
    [pickerType, setCustomTitleFont, setCustomSubTitleFont]
  );

  const handleFontSizeSelect = useCallback(
    (item: string) => {
      setSelectedFontSize(item);
      if (pickerType === "title") {
        setCustomTitleFontSize(Number(item.split("pt")[0]));
      } else {
        setCustomSubTitleFontSize(Number(item.split("pt")[0]));
      }
    },
    [pickerType, setCustomTitleFontSize, setCustomSubTitleFontSize]
  );

  return (
    <View style={styles.container}>
      <CustomiseTextRow
        title={title}
        setTitle={setTitle}
        placeholder="Title"
        handleTitleFontPress={handleTitleFontPress}
        handleTitleSizePress={handleTitleSizePress}
        fontStyles={fontStyles}
        customTitleFont={customTitleFont}
        customTitleFontSize={customTitleFontSize}
      />

      <CustomiseTextRow
        title={subTitle}
        setTitle={setSubTitle}
        placeholder="Subtitle"
        handleTitleFontPress={handleSubTitleFontPress}
        handleTitleSizePress={handleSubTitleSizePress}
        fontStyles={fontStyles}
        customTitleFont={customSubTitleFont}
        customTitleFontSize={customSubTitleFontSize}
      />

      <Dropdown
        data={fontNames}
        textStyles={Object.values(fontStyles)}
        isVisible={isFontPickerVisible}
        setIsVisible={setIsFontPickerVisible}
        placeholder="Select Font"
        selectedItem={selectedFont as string}
        onSelect={handleFontSelect}
      />

      <Dropdown
        data={fontSizes.map((size) => `${size}pt`)}
        isVisible={isFontSizePickerVisible}
        setIsVisible={setIsFontSizePickerVisible}
        placeholder="Select Font Size"
        selectedItem={selectedFontSize as string}
        onSelect={handleFontSizeSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  }
});
