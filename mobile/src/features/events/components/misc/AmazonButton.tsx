import {
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome6 } from "@expo/vector-icons";

import { AppStackParamList } from "@/app/navigation";
import { Tooltip } from "@/design-system/components/overlays/Tooltip";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { trackEventAmazonLinkOpened } from "@/services/analytics/events";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";

interface AmazonButtonProps {
  type: "Food" | "Drink" | "Decor";
}

export function AmazonButton({ type }: AmazonButtonProps) {
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;
  const links = {
    Food: "https://link.amazon/B0ddzQA5w",
    Drink: "https://link.amazon/B0iDgnO20",
    Decor: "https://link.amazon/B0dyaL5oD"
  };

  const handlePress = async () => {
    haptics.soft();
    trackEventAmazonLinkOpened();
    const link = links[type];
    try {
      await Linking.openURL(link);
    } catch (error) {
      log(`Error opening Amazon link: ${error}`, "error");
      navigation.navigate("WebView", { title: "Amazon", uri: link });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={getHitSlop("large")}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContainer}>
        <Image
          source={require("@/assets/logos/amazon-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              type="subHeader"
              color={colors.black}
              style={styles.title}
              numberOfLines={1}
            >
              Shop {type}
            </Text>
          </View>
          <Text type="caption" color={colors.gray} style={styles.subtitle}>
            Search Amazon for party {type.toLowerCase()}
          </Text>
        </View>
        <Tooltip text="We receive a small commission from Amazon for each purchase made through this link.">
          <FontAwesome6 name="circle-info" size={14} color={colors.gray} />
        </Tooltip>
        <FontAwesome6 name="chevron-right" size={16} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    ...card.medium,
    ...padding.mediumWidget,
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  logo: {
    height: 24,
    width: 24
  },
  subtitle: {
    letterSpacing: 0
  },
  textContainer: {
    flex: 1
  },
  title: {
    flexShrink: 1,
    textAlign: "left"
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  }
});
