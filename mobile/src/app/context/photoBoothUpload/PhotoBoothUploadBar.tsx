import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEffect, useMemo, useRef } from "react";

import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle
} from "react-native";

import { FontAwesome6 } from "@expo/vector-icons";

import { toastColors, toastIcons } from "@/app/context/toast/const";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { TAB_BAR_HEIGHT } from "@/features/main/components/TabBar";
import { UploadQueueItem } from "@/types/PhotoBoothUpload";

interface PhotoBoothUploadBarProps {
  items: UploadQueueItem[];
  visible: boolean;
  onDismiss: () => void;
}

export function PhotoBoothUploadBar({
  items,
  visible,
  onDismiss
}: PhotoBoothUploadBarProps) {
  const animation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true
    }).start();
  }, [animation, visible]);

  const containerStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0]
          })
        }
      ],
      opacity: animation
    }),
    [animation]
  );

  const { total, uploadingCount, errorCount } = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc.total += 1;
          if (item.status === "uploading") acc.uploadingCount += 1;
          if (item.status === "error") acc.errorCount += 1;
          return acc;
        },
        { total: 0, uploadingCount: 0, errorCount: 0 }
      ),
    [items]
  );

  const isUploading = uploadingCount > 0;
  const settledCount = total - uploadingCount;
  const toastType = errorCount > 0 ? "error" : "success";

  const icon = isUploading ? "arrow-up" : toastIcons[toastType];
  const color = isUploading ? colors.primary : toastColors[toastType];

  const message = isUploading
    ? `Uploading ${settledCount} of ${total} photo${total === 1 ? "" : "s"}`
    : errorCount > 0
      ? `${errorCount} of ${total} photo${total === 1 ? "" : "s"} failed to upload`
      : `${total} photo${total === 1 ? "" : "s"} uploaded`;

  const bottom = TAB_BAR_HEIGHT + insets.bottom + 24;

  return (
    <Animated.View
      style={[styles.overlay, { bottom }, containerStyle]}
      pointerEvents={visible ? "box-none" : "none"}
    >
      <View style={styles.bar}>
        <View style={[styles.icon, { backgroundColor: color }]}>
          <FontAwesome6 name={icon} size={12} color={colors.white} />
        </View>

        <View style={styles.messageWrapper}>
          <Text type="body" color={colors.black} numberOfLines={1}>
            {message}
          </Text>
        </View>

        <TouchableOpacity onPress={onDismiss} hitSlop={getHitSlop("medium")}>
          <FontAwesome6 name="xmark" size={16} color={colors.gray} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    maxWidth: "90%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  icon: {
    alignItems: "center",
    borderRadius: 10,
    flexShrink: 0,
    height: 20,
    justifyContent: "center",
    width: 20
  },
  messageWrapper: {
    flexShrink: 1
  },
  overlay: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 1000
  }
});
