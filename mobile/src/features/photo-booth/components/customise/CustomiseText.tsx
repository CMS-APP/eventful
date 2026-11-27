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

  const [isFontPickerVisible, setIsFontPickerVisible] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [pickerType, setPickerType] = useState("title");

  const handleTitleFontPress = useCallback(() => {
    setIsFontPickerVisible(true);
    setPickerType("title");
    setSelectedFont(customTitleFont);
  }, [customTitleFont]);

  const handleSubTitleFontPress = useCallback(() => {
    setIsFontPickerVisible(true);
    setPickerType("subTitle");
    setSelectedFont(customSubTitleFont as string);
  }, [customSubTitleFont]);

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

  return (
    <View style={styles.container}>
      <CustomiseTextRow
        title={title}
        setTitle={setTitle}
        placeholder="Title"
        handleTitleFontPress={handleTitleFontPress}
        onFontSizeChange={setCustomTitleFontSize}
        fontStyles={fontStyles}
        customTitleFont={customTitleFont}
        customTitleFontSize={customTitleFontSize}
      />

      <CustomiseTextRow
        title={subTitle}
        setTitle={setSubTitle}
        placeholder="Subtitle"
        handleTitleFontPress={handleSubTitleFontPress}
        onFontSizeChange={setCustomSubTitleFontSize}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  }
});
