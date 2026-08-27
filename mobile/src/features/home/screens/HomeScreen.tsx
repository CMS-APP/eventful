import { useState } from "react";

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";

import { HomeButtons } from "../components/HomeButtons";
import { HomeNextEvent } from "../components/HomeNextEvent";

interface HomeScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function HomeScreen(_: HomeScreenProps) {
  const [scrollY, setScrollY] = useState(0);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset < 0) {
      setScrollY(-yOffset);
    }
  }

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Home",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "home"
        }
      }}
      contentConfig={{
        backgroundColor: colors.lightGray,
        tabBarPresent: true
      }}
      handleScroll={handleScroll}
    >
      <View style={styles.container}>
        <HomeButtons scrollY={scrollY} />
      </View>

      <HomeNextEvent event={null} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 12,
    paddingTop: 52
  }
});
