import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/app/navigationTypes";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

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
    ...padding.largeWidget,
    alignItems: "center",
    backgroundColor: colors.lightGray,
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
