import { useSelector } from "react-redux";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppStackParamList } from "@/app/navigation";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { SwitchButtonGroup } from "@/design-system/components/buttons/SwitchButtonGroup";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import { UserState } from "@/store/UserSlice";

import { CustomiseText } from "../CustomiseText";
import { LivePreview } from "../LivePreview";

export function TextColorsTab() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const premium = useSelector((state: UserState) => state.premium);
  const { removeWatermark, setRemoveWatermark } = usePhotoBoothSettings();

  function handleRemoveWatermarkChange() {
    if (!premium) {
      navigation.navigate("Paywall", { type: "Premium" });
      return;
    }
    setRemoveWatermark(!removeWatermark);
  }

  return (
    <View style={styles.container}>
      <LivePreview />

      <Text type="subHeader">Text</Text>
      <CustomiseText />

      <SwitchButtonGroup>
        <SwitchButton
          icon="crown"
          iconColor={colors.secondary}
          title="Remove Watermark"
          subtitle="Premium"
          value={premium && removeWatermark}
          onChange={handleRemoveWatermarkChange}
        />
      </SwitchButtonGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 24
  }
});
