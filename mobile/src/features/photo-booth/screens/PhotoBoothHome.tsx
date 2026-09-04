import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Platform, StyleSheet, View } from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { AppStackParamList, PhotoBoothStackNavigation } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { PhotoBoothPaywallFeatures } from "@/features/photo-booth/components/home/PhotoBoothPaywallFeatures";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothPermissions } from "@/features/photo-booth/context/permissions/PhotoBoothPermissionsContext";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { PhotoBoothLockModal } from "@/features/photo-booth/modals/PhotoBoothLockModal";
import { PhotoBoothUnlockModal } from "@/features/photo-booth/modals/PhotoBoothUnlockModal";
import { UserState } from "@/store/UserSlice";

export function PhotoBoothHome() {
  const navigation = useNavigation<PhotoBoothStackNavigation>();
  const paywallNavigation =
    useNavigation<StackNavigationProp<AppStackParamList>>();
  const { setPhotos } = usePhotoBoothCamera();
  const { locked, setLocked, lockPin, setLockPin } = usePhotoBoothSession();
  const { ensurePermissions } = usePhotoBoothPermissions();

  const premium = useSelector((state: UserState) => state.premium);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);
  const hasAccess = premium || photoBooth;

  const [presentLockModal, setPresentLockModal] = useState(false);
  const [presentUnlockModal, setPresentUnlockModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPhotos([]);
      };
    }, [setPhotos])
  );

  return (
    <>
      <PhotoBoothLockModal
        locked={locked}
        setLocked={setLocked}
        presentModal={presentLockModal}
        setPresentModal={setPresentLockModal}
        lockPin={lockPin}
        setLockPin={setLockPin}
      />

      <PhotoBoothUnlockModal
        locked={locked}
        setLocked={setLocked}
        presentModal={presentUnlockModal}
        setPresentModal={setPresentUnlockModal}
        lockPin={lockPin}
        setLockPin={setLockPin}
      />

      <Screen
        headerConfig={{
          type: "curvy",
          curvyHeaderProps: {
            title: "Photo Booth",
            subTitle: "Home",
            icon: "camera",
            color: colors.white,
            accountButton: false,
            backgroundColor: colors.primary
          }
        }}
        contentConfig={{
          tabBarPresent: !locked
        }}
        blurOverlay={{
          visible: !hasAccess,
          children: (
            <>
              <View style={styles.lockedIconCircle}>
                <FontAwesome5 name="crown" size={26} color={colors.white} />
              </View>

              <Text type="subHeader" color={colors.black} center>
                The Photo Booth requires a subscription
              </Text>

              <PhotoBoothPaywallFeatures />

              <Button
                text="Subscribe"
                leadingIcon="credit-card"
                onPress={() => {
                  paywallNavigation.navigate("Paywall", {
                    type: "photoBooth"
                  });
                }}
                color={colors.secondary}
                textColor={colors.white}
              />
            </>
          )
        }}
      >
        <View style={styles.container}>
          <View
            style={styles.buttonsList}
            pointerEvents={hasAccess ? "auto" : "none"}
          >
            <Button
              text="Open Photo Booth"
              leadingIcon="camera"
              onPress={async () => {
                const hasPermissions = await ensurePermissions();
                if (!hasPermissions) {
                  return;
                }
                navigation.navigate("PhotoBoothCamera");
              }}
              color={!hasAccess ? colors.gray : colors.primary}
              textColor={colors.white}
              disabled={!hasAccess}
            />

            <Button
              text="Customise"
              leadingIcon="cog"
              onPress={() => {
                navigation.navigate("PhotoBoothCustomise");
              }}
              color={locked || !hasAccess ? colors.gray : colors.primary}
              textColor={colors.white}
              disabled={locked || !hasAccess}
            />

            <Button
              text="Photo Gallery"
              leadingIcon="cloud"
              onPress={async () => {
                const hasPermissions = await ensurePermissions();
                if (!hasPermissions) {
                  return;
                }
                navigation.navigate("PhotoBoothGallery");
              }}
              color={locked || !hasAccess ? colors.gray : colors.primary}
              textColor={colors.white}
              disabled={locked || !hasAccess}
            />

            <Button
              text={`${locked ? "Un" : ""}Lock Photo Booth `}
              leadingIcon={locked ? "unlock" : "lock"}
              onPress={() => {
                if (locked) {
                  setPresentUnlockModal(true);
                } else {
                  setPresentLockModal(true);
                }
              }}
              color={!hasAccess ? colors.gray : colors.primary}
              textColor={colors.white}
              disabled={!hasAccess}
            />

            {Platform.OS === "ios" && !locked && (
              <Button
                text="Guided Access Info"
                leadingIcon="apple"
                onPress={() => {
                  navigation.navigate("PhotoBoothGuidedAccessInfo");
                }}
                color={!hasAccess ? colors.gray : colors.primary}
                textColor={colors.white}
                disabled={!hasAccess}
              />
            )}
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  buttonsList: {
    gap: 16
  },
  container: {
    marginTop: 52,
    paddingHorizontal: 24,
    position: "relative"
  },
  lockedIconCircle: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: 64
  }
});
