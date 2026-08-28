import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

interface FeatureViewProps {
  image: ImageSourcePropType;
  title: string;
  subTitle: string;
  description: string;
}

export function FeatureView({
  image,
  title,
  subTitle,
  description
}: FeatureViewProps) {
  const width = useAppDimensions().screenWidth;

  return (
    <View style={styles.container}>
      <Image
        source={image}
        style={[styles.image, { width: width / 1.5 }]}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text type="header" color="white">
          {title}
        </Text>

        <Text type="subHeader" style={styles.subTitle}>
          {subTitle}
        </Text>

        <Text type="body" color="white" style={styles.description}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.primary,
    flex: 3,
    gap: 24,
    justifyContent: "center"
  },
  description: {
    textAlign: "center",
    textTransform: "none"
  },
  image: {
    aspectRatio: 1,
    height: undefined
  },
  subTitle: {
    color: colors.secondary
  },
  textContainer: {
    alignItems: "center",
    gap: 12,
    marginHorizontal: 24
  }
});
