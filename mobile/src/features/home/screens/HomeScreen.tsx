import { useState } from "react";

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { Screen } from "@/components/views/screen/Screen";
import { AllStackParamList } from "@/features/app/navigationTypes";
import { colors } from "@/styles/colors";
import { useScreenStatusBar } from "@/utils/statusBar";

import { HomeButtons } from "../components/HomeButtons";
import { HomeNextEvent } from "../components/HomeNextEvent";

interface HomeScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function HomeScreen(_: HomeScreenProps) {
  const [scrollY, setScrollY] = useState(0);
  useScreenStatusBar(true);

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
