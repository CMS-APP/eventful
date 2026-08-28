import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/screen/Screen";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { Input } from "@/design-system/components/inputs/Input";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

export function PhotoBoothSettings() {
  const {
    autoSave,
    setAutoSave,
    saveIndividualPhotos,
    setSaveIndividualPhotos,
    flipPhotosHorizontally,
    setFlipPhotosHorizontally,
    removeWatermark,
    setRemoveWatermark,
    flash,
    setFlash,
    timerDuration,
    setTimerDuration
  } = usePhotoBoothSettings();

  const [timerDurationLocal, setTimerDurationLocal] = useState<string>(
    timerDuration.toString()
  );

  function handleAutoSaveChange() {
    setAutoSave(!autoSave);
  }

  function handleSaveIndividualPhotosChange() {
    setSaveIndividualPhotos(!saveIndividualPhotos);
  }

  function handleFlipPhotosHorizontallyChange() {
    setFlipPhotosHorizontally(!flipPhotosHorizontally);
  }

  function handleRemoveWatermarkChange() {
    setRemoveWatermark(!removeWatermark);
  }

  function handleFlashChange() {
    setFlash(!flash);
  }

  useEffect(() => {
    const newDuration = parseInt(timerDurationLocal);
    if (
      timerDurationLocal !== timerDuration.toString() &&
      !isNaN(newDuration) &&
      newDuration >= 1
    ) {
      setTimerDuration(newDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerDurationLocal]);

  return (
    <Screen
      contentConfig={{ tabBarPresent: false }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Settings",
          icon: "cog",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <SwitchButton
          title="Auto Save"
          isChecked={autoSave}
          onChange={handleAutoSaveChange}
        />

        <SwitchButton
          title="Save Individual Photos"
          isChecked={saveIndividualPhotos}
          onChange={handleSaveIndividualPhotosChange}
        />

        <SwitchButton
          title="Flip Photos Horizontally"
          isChecked={flipPhotosHorizontally}
          onChange={handleFlipPhotosHorizontallyChange}
        />

        <SwitchButton
          title="Remove Watermark"
          isChecked={removeWatermark}
          onChange={handleRemoveWatermarkChange}
        />

        <SwitchButton
          title="Flash"
          isChecked={flash}
          onChange={handleFlashChange}
        />

        <Input
          placeholder="Photo Timer Duration (seconds)"
          value={timerDurationLocal.toString()}
          onChangeText={(text) => setTimerDurationLocal(text)}
          keyboardType="number-pad"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginTop: 52,
    paddingHorizontal: 24
  }
});
