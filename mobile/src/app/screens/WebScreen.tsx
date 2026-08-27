import WebView from "react-native-webview";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { FlatHeader } from "@/components/screen/FlatHeader";
import { colors } from "@/design-system/tokens/colors";

export function WebScreen({ route }: { route: RouteProp<any, any> }) {
  const { title, uri } = route.params as { title: string; uri: string };

  const headerConfig = {
    title: title,
    dark: true,
    modal: true,
    backgroundColor: colors.primary,
    backAction: true
  };

  return (
    <View style={styles.container}>
      <FlatHeader {...headerConfig} />
      <WebView source={{ uri: uri }} style={styles.webView} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    paddingTop: 24
  },
  webView: {
    backgroundColor: colors.primary,
    marginTop: 12
  }
});
