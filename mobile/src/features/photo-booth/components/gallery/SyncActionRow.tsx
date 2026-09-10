import { useCallback, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { BlurView } from "expo-blur";

import { PhotoBoothUploadRing } from "@/app/context/photoBoothUpload/PhotoBoothUploadRing";
import { Button } from "@/design-system/components/buttons/Button";
import { IconButton } from "@/design-system/components/buttons/IconButton";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

interface SyncActionRowProps {
  icon: keyof typeof FontAwesome5.glyphMap;
  progress: number;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionIcon: keyof typeof FontAwesome5.glyphMap;
  caption: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  premium: boolean;
  onPaywallPress: () => void;
  secondaryIcon?: keyof typeof FontAwesome5.glyphMap;
  onSecondaryPress?: () => void;
}

export function SyncActionRow({
  icon,
  progress,
  title,
  subtitle,
  actionLabel,
  actionIcon,
  caption,
  onPress,
  loading,
  disabled,
  premium,
  onPaywallPress,
  secondaryIcon,
  onSecondaryPress
}: SyncActionRowProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    haptics.soft();
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleExpanded}
        style={styles.headerRow}
        hitSlop={getHitSlop("small")}
      >
        <PhotoBoothUploadRing percentage={progress} color={colors.primary}>
          <FontAwesome5 name={icon} size={16} color={colors.primary} />
        </PhotoBoothUploadRing>

        <View style={styles.headerTextContainer}>
          <Text type="subHeader" color={colors.black}>
            {title}
          </Text>
          <Text type="caption" color={colors.gray}>
            {subtitle}
          </Text>
        </View>

        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={colors.primary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContainer}>
          <View style={styles.actionRow}>
            <Button
              text={actionLabel}
              onPress={premium ? onPress : onPaywallPress}
              leadingIcon={actionIcon}
              color={colors.primary}
              textColor={colors.white}
              loading={premium && loading}
              disabled={premium && disabled}
              flex={1}
            />

            {secondaryIcon && (
              <IconButton
                iconName={secondaryIcon}
                onPress={
                  premium ? (onSecondaryPress ?? (() => {})) : onPaywallPress
                }
                size="medium"
                marginTop={0}
                marginBottom={0}
              />
            )}

            {!premium && (
              <>
                <BlurView
                  intensity={20}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <TouchableOpacity
                  style={StyleSheet.absoluteFill}
                  onPress={onPaywallPress}
                  activeOpacity={1}
                />
              </>
            )}
          </View>

          <Text type="caption" color={colors.gray} center>
            {caption}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    overflow: "hidden"
  },
  container: {
    gap: 12
  },
  expandedContainer: {
    gap: 8
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  headerTextContainer: {
    flex: 1,
    gap: 2
  }
});
