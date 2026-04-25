/** @format */
// This file exists for TypeScript module resolution.
// React Native Metro bundler will automatically prioritize platform-specific files:
// - AppleLogin.ios.tsx (on iOS)
// - AppleLogin.android.tsx (on Android)
// - AppleLogin.web.tsx (on web)
// This base file is only used if no platform-specific file matches.
import React from "react";

// Placeholder component - Metro will use platform-specific versions instead
export function AppleLogin(): React.JSX.Element | null {
  return null;
}
