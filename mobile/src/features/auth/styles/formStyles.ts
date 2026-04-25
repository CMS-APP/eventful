import { StyleSheet } from "react-native";

import { colors } from "@/styles/colors";

export const formStyles = StyleSheet.create({
  formContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  scrollView: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40
  }
});
