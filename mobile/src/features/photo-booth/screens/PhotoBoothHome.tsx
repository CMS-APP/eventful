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
import { PhotoBoothOpenCard } from "@/features/photo-booth/components/home/PhotoBoothOpenCard";
import { PhotoBoothPaywallFeatures } from "@/features/photo-booth/components/home/PhotoBoothPaywallFeatures";
import { PhotoBoothStatsRow } from "@/features/photo-booth/components/home/PhotoBoothStatsRow";
import { usePhotoBoothCamera } from "@/features/photo-booth/context/camera/PhotoBoothCameraContext";
import { usePhotoBoothPermissions } from "@/features/photo-booth/context/permissions/PhotoBoothPermissionsContext";
import { usePhotoBoothSession } from "@/features/photo-booth/context/session/PhotoBoothSessionContext";
import { usePhotoBoothStats } from "@/features/photo-booth/hooks/usePhotoBoothStats";
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

  const userId = useSelector((state: UserState) => state.uid);
  const premium = useSelector((state: UserState) => state.premium);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);
  const hasAccess = premium || photoBooth;
  const stats = usePhotoBoothStats(userId);

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
            backgroundColor: colors.primary,
            iconRight: locked ? "unlock" : "lock",
            iconRightAction: () => {
              if (locked) {
                setPresentUnlockModal(true);
              } else {
                setPresentLockModal(true);
              }
            }
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
            style={styles.content}
            pointerEvents={hasAccess ? "auto" : "none"}
          >
            <PhotoBoothOpenCard
              title="Open Photo Booth"
              subtitle={
                stats.lastSessionLabel
                  ? `Last session ${stats.lastSessionLabel}`
                  : "No sessions yet"
              }
              icon="camera"
              onPress={async () => {
                const hasPermissions = await ensurePermissions();
                if (!hasPermissions) {
                  return;
                }
                navigation.navigate("PhotoBoothCamera");
              }}
              color={!hasAccess ? colors.gray : colors.primary}
              accentColor={!hasAccess ? colors.lightGray : colors.secondary}
              disabled={!hasAccess}
            />

            <View style={styles.section}>
              <Text type="body" color={colors.gray}>
                Overview
              </Text>
              <PhotoBoothStatsRow
                photosTaken={stats.photosTaken}
                inTheCloud={stats.inTheCloud}
                events={stats.events}
              />
            </View>

            <View style={styles.section}>
              <Text type="body" color={colors.gray}>
                Manage
              </Text>

              <View style={styles.grid}>
                <View style={styles.gridRow}>
                  <Button
                    leadingIcon="cog"
                    text="Customise"
                    color={
                      locked || !hasAccess ? colors.gray : colors.lightGray
                    }
                    textColor={colors.primary}
                    onPress={() => {
                      navigation.navigate("PhotoBoothCustomise");
                    }}
                    disabled={locked}
                    flex={1}
                    align="left"
                  />

                  <Button
                    leadingIcon="cloud"
                    text="Gallery"
                    color={
                      locked || !hasAccess ? colors.gray : colors.lightGray
                    }
                    textColor={colors.primary}
                    onPress={async () => {
                      const hasPermissions = await ensurePermissions();
                      if (!hasPermissions) {
                        return;
                      }
                      navigation.navigate("PhotoBoothGallery");
                    }}
                    disabled={locked}
                    flex={1}
                    align="left"
                  />
                </View>

                <View style={styles.gridRow}>
                  <Button
                    leadingIcon={locked ? "unlock" : "lock"}
                    text={`${locked ? "Un" : ""}Lock`}
                    color={!hasAccess ? colors.gray : colors.lightGray}
                    textColor={colors.primary}
                    disabled={!hasAccess}
                    onPress={() => {
                      if (locked) {
                        setPresentUnlockModal(true);
                      } else {
                        setPresentLockModal(true);
                      }
                    }}
                    flex={1}
                    align="left"
                  />

                  {Platform.OS === "ios" && (
                    <Button
                      leadingIcon="apple"
                      text="Access"
                      color={
                        locked || !hasAccess ? colors.gray : colors.lightGray
                      }
                      textColor={colors.primary}
                      onPress={() => {
                        navigation.navigate("PhotoBoothGuidedAccessInfo");
                      }}
                      disabled={locked}
                      flex={1}
                      align="left"
                    />
                  )}
                </View>

                {/* <Text type="subHeader" color={colors.gray}>
                  Inspiration
                </Text>

                <HomePageButton
                  icon="star"
                  text="Inspiration"
                  color={colors.primary}
                  textColor={colors.white}
                  buttonAction={() => {
                    navigation.navigate("PhotoBoothInspiration");
                  }}
                  disabled={locked || !hasAccess}
                /> */}
              </View>
            </View>
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 52,
    paddingHorizontal: 24,
    position: "relative"
  },
  content: {
    gap: 16
  },
  grid: {
    gap: 8
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8
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
  },
  section: {
    gap: 12
  }
});
