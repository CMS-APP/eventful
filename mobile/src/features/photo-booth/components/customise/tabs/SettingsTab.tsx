import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { SwitchButtonGroup } from "@/design-system/components/buttons/SwitchButtonGroup";
import { Input } from "@/design-system/components/inputs/Input";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import { trackPhotoBoothCustomised } from "@/services/analytics/events";

export function SettingsTab() {
  const {
    autoSave,
    setAutoSave,
    saveIndividualPhotos,
    setSaveIndividualPhotos,
    flipPhotosHorizontally,
    setFlipPhotosHorizontally,
    flash,
    setFlash,
    timerDuration,
    setTimerDuration,
    photoPromptsEnabled,
    canChangeCollage,
    setCanChangeCollage,
    setPhotoPromptsEnabled
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

  function handleFlashChange() {
    setFlash(!flash);
  }

  function handleCanChangeCollageChange() {
    setCanChangeCollage(!canChangeCollage);
    trackPhotoBoothCustomised("collage");
  }

  function handlePhotoPromptsEnabledChange() {
    setPhotoPromptsEnabled(!photoPromptsEnabled);
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
    <View style={styles.container}>
      <Text type="subHeader">Settings</Text>

      <Input
        placeholder="Photo Timer Duration (seconds)"
        value={timerDurationLocal.toString()}
        onChangeText={(text) => setTimerDurationLocal(text)}
        keyboardType="number-pad"
        backgroundColor={colors.white}
        textColor={colors.black}
      />

      <SwitchButtonGroup>
        <SwitchButton
          icon="save"
          title="Auto Save"
          subtitle="Saves each collage to the camera roll"
          value={autoSave}
          onChange={handleAutoSaveChange}
        />
        <SwitchButton
          icon="images"
          title="Save Individual Photos"
          subtitle="Also saves every photo on its own"
          value={saveIndividualPhotos}
          onChange={handleSaveIndividualPhotosChange}
        />
        <SwitchButton
          icon="arrows-alt-h"
          title="Flip Photos Horizontally"
          subtitle="Mirrors photos like a selfie"
          value={flipPhotosHorizontally}
          onChange={handleFlipPhotosHorizontallyChange}
        />
        <SwitchButton
          icon="bolt"
          title="Flash"
          subtitle="Uses the camera flash for each photo"
          value={flash}
          onChange={handleFlashChange}
        />
        <SwitchButton
          icon="comment-dots"
          title="Photo Prompts"
          subtitle={'Shows ideas like "Strike your best pose!"'}
          value={photoPromptsEnabled}
          onChange={handlePhotoPromptsEnabledChange}
        />
        <SwitchButton
          icon="th-large"
          title="Layout Change"
          subtitle="Guests can pick a different layout for their collage"
          value={canChangeCollage}
          onChange={handleCanChangeCollageChange}
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
