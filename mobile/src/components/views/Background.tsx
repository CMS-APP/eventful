import React from "react";

import { ImageBackground, StyleSheet, View } from "react-native";

import { colors } from "@/styles/colors";

interface BackgroundProps {
  page?: string;
  children?: React.ReactNode;
  image?: boolean;
  color?: string;
}

export function Background({
  page,
  children,
  image = false,
  color = colors.primary
}: BackgroundProps) {
  const background = {
    Home: require("@/assets/backgrounds/home-background.png"),
    Welcome: require("@/assets/backgrounds/welcome-background.png"),
    Contacts: require("@/assets/backgrounds/welcome-background.png"),
    Events: require("@/assets/backgrounds/events-background.png"),
    Calendar: require("@/assets/backgrounds/calendar-background.png"),
    EventEdit: require("@/assets/backgrounds/events-background.png")
  }[page || "Home"];

  if (image) {
    return (
      <ImageBackground
        source={background}
        resizeMode="cover"
        style={styles.flex1}
      >
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.flex1, { backgroundColor: color }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  }
});
