import React from "react";

import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

import { Button } from "../buttons/Button";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.content}>
        <FontAwesome5 name="exclamation-circle" size={64} color={colors.red} />
        <Text type="header" color={colors.red} style={styles.title}>
          Something went wrong
        </Text>
        <Text type="subHeader" color={colors.darkGray} style={styles.message}>
          We are sorry, but something unexpected happened. Please try restarting
          the app.
        </Text>
        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text type="body" color={colors.darkGray} center>
              Error Details (Development Only):
            </Text>
            <Text type="body" color={colors.red} center>
              {error.message}
            </Text>
            {error.stack && (
              <Text type="footnote" color={colors.gray} center>
                {error.stack}
              </Text>
            )}
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Button
            text="Restart App"
            color={colors.primary}
            textColor={colors.white}
            onPress={resetError}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 24,
    width: "100%"
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.white,
    justifyContent: "center",
    padding: 24
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%"
  },
  errorDetails: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 32,
    marginTop: 24,
    maxHeight: 300,
    padding: 16,
    width: "100%"
  },
  message: {
    color: colors.darkGray,
    marginBottom: 24,
    paddingHorizontal: 24,
    textAlign: "center"
  },
  title: {
    color: colors.primary,
    marginBottom: 16,
    marginTop: 24
  }
});
