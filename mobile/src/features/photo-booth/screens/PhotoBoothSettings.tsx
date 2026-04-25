import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { SwitchButton } from "@/components/buttons/SwitchButton";
import { Input } from "@/components/inputs/Input";
import { Screen } from "@/components/views/screen/Screen";
import { colors } from "@/styles/colors";

import { usePhotoBoothSettings } from "../provider/PhotoBoothSettingsProvider";

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
