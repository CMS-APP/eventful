import ColorPicker from "react-native-wheel-color-picker";

import { useCallback, useState } from "react";

import { ActivityIndicator, StyleSheet, View } from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/Button";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import {
  PhotoBoothStackNavigation,
  PhotoBoothStackParamList
} from "../photoBoothStackParams";

export function PhotoBoothColorPicker() {
  const route =
    useRoute<RouteProp<PhotoBoothStackParamList, "PhotoBoothColorPicker">>();
  const navigation = useNavigation<PhotoBoothStackNavigation>();

  const type = route.params?.type;
  const color = route.params?.color;

  const { setFrameColor, setTextColor } = usePhotoBoothSettings();

  const [currentColor, setCurrentColor] = useState(color || "#ffffff");

  const onColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const saveColor = useCallback(() => {
    if (type === "frame") {
      setFrameColor(currentColor);
    } else if (type === "text") {
      setTextColor(currentColor);
    }
    navigation.goBack();
  }, [type, currentColor, setFrameColor, setTextColor, navigation]);

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Color Picker - " + type,
          icon: "camera",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
      contentConfig={{ tabBarPresent: false }}
      nonScrollChildren={
        <View style={styles.container}>
          <View style={styles.colorPickerWrapper}>
            <ColorPicker
              color={currentColor}
              onColorChange={onColorChange}
              thumbSize={40}
              sliderSize={40}
              noSnap={false}
              wheelLoadingIndicator={<ActivityIndicator size={40} />}
              sliderHidden={false}
              discrete={false}
              useNativeDriver={false}
              useNativeLayout={false}
              gapSize={15}
              wheelHidden={false}
              palette={["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff"]}
            />
          </View>

          <View style={styles.selectedColorContainer}>
            <Text type="subHeader">Selected Color</Text>

            <View
              style={[
                styles.selectedColorBox,
                {
                  backgroundColor: currentColor
                }
              ]}
            />

            <Button
              text="Save Color"
              onPress={saveColor}
              color={colors.secondary}
              textColor={colors.white}
            />
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  colorPickerWrapper: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    height: 350,
    justifyContent: "center",
    marginHorizontal: 12,
    marginTop: 50,
    padding: 12
  },
  container: {
    gap: 16,
    marginTop: 52,
    paddingHorizontal: 24
  },
  selectedColorBox: {
    borderColor: colors.black,
    borderRadius: 12,
    borderWidth: 2,
    height: 50
  },
  selectedColorContainer: {
    gap: 12,
    margin: 12,
    zIndex: 1000
  }
});
