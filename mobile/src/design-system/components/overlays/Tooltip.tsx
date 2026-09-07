import type { ReactNode } from "react";
import { useRef, useState } from "react";

import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";

interface TooltipProps {
  text: string;
  children: ReactNode;
}

const TOOLTIP_WIDTH = 220;
const SCREEN_PADDING = 16;

export function Tooltip({ text, children }: TooltipProps) {
  const triggerRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handlePress = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const screenWidth = Dimensions.get("window").width;
      const left = Math.min(
        Math.max(x + width / 2 - TOOLTIP_WIDTH / 2, SCREEN_PADDING),
        screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING
      );
      setPosition({ top: y + height + 8, left });
      setVisible(true);
    });
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("small")}>
          {children}
        </TouchableOpacity>
      </View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View
            style={[styles.bubble, { top: position.top, left: position.left }]}
          >
            <Text type="caption" color={colors.white} style={styles.bubbleText}>
              {text}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1
  },
  bubble: {
    ...shadows.mediumShadow,
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 12,
    position: "absolute",
    width: TOOLTIP_WIDTH
  },
  bubbleText: {
    letterSpacing: 0,
    lineHeight: 15,
    textTransform: "none"
  }
});
