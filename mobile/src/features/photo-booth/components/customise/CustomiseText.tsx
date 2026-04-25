import { useCallback, useState } from "react";

import { StyleSheet, TextStyle, View } from "react-native";

import { Dropdown } from "@/components/buttons/Dropdown";
import { fontStyles } from "@/styles/fonts";

import { usePhotoBoothSettings } from "../../provider/PhotoBoothSettingsProvider";
import { CustomiseTextRow } from "./CustomiseTextRow";

export function CustomiseText() {
  const fonts = {
    Anton: { style: fontStyles.anton, font: "Anton-Regular" },
    "Bebas Neue": { style: fontStyles.bebasNeue, font: "BebasNeue-Regular" },
    Lobster: { style: fontStyles.lobster, font: "Lobster" },
    "Great Vibes": {
      style: fontStyles.greatVibes,
      font: "GreatVibes-Regular"
    },
    "Gotham Bold": { style: fontStyles.gotham, font: "Gotham-Bold" },
    Poppins: {
      style: fontStyles.poppinsRegular,
      font: "Poppins-Regular"
    },
    "Poppins Bold": {
      style: fontStyles.poppinsMedium,
      font: "Poppins-Medium"
    },
    "Poppins Bold Italic": {
      style: fontStyles.poppinsMediumItalic,
      font: "Poppins-Medium-Italic"
    }
  };

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

  const fontSizes = [
    10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46,
    48, 50
  ];

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
        fonts={fonts}
        customTitleFont={customTitleFont}
        customTitleFontSize={customTitleFontSize}
      />

      <CustomiseTextRow
        title={subTitle}
        setTitle={setSubTitle}
        placeholder="Subtitle"
        handleTitleFontPress={handleSubTitleFontPress}
        handleTitleSizePress={handleSubTitleSizePress}
        fonts={fonts}
        customTitleFont={customSubTitleFont}
        customTitleFontSize={customSubTitleFontSize}
      />

      <Dropdown
        data={Object.keys(fonts)}
        textStyles={Object.values(fonts).map(
          (font: { style: TextStyle }) => font.style
        )}
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
