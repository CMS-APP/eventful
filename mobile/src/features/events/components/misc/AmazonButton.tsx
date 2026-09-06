import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { trackEventAmazonLinkOpened } from "@/services/analytics/events";
import { haptics } from "@/utils/haptics";

interface AmazonButtonProps {
  type: "Food" | "Drink" | "Decor";
}

export function AmazonButton({ type }: AmazonButtonProps) {
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;
  const links = {
    Food: "https://amzn.to/3EwY4fk",
    Drink: "https://amzn.to/4ht4RoN",
    Decor: "https://amzn.to/3CJNhOo"
  };

  const handlePress = () => {
    haptics.soft();
    trackEventAmazonLinkOpened();
    navigation.navigate("WebView", {
      title: "Amazon",
      uri: links[type]
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("large")}>
      <View style={styles.buttonContainer}>
        <Image
          source={require("@/assets/logos/amazon-logo.png")}
          style={styles.logo}
        />
        <View style={styles.textContainer}>
          <Text type="subHeader" color={colors.black} style={styles.title}>
            Purchase {type}
          </Text>
          <Text type="caption" color={colors.gray} style={styles.subtitle}>
            We recieve a small commission from Amazon for each purchase
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    ...card.medium,
    ...padding.largeWidget,
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  logo: {
    height: 20,
    marginTop: 6,
    width: 60
  },
  subtitle: {
    color: colors.gray,
    textAlign: "left"
  },
  textContainer: {
    flex: 1
  },
  title: {
    textAlign: "left"
  }
});
