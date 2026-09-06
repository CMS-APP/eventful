import "dotenv/config";

import { ConfigContext } from "@expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";

const bundleId = IS_DEV
  ? "com.hostinghappily.app.dev"
  : "com.hostinghappily.app";

export default ({ config }: ConfigContext) => {
  return {
    ...config,
    name: IS_DEV ? "Eventful Dev" : "Eventful",
    slug: "Eventful",
    scheme: "eventful",
    owner: "chrissharp",
    version: "6.10.0",
    runtimeVersion: "6.10.0",
    orientation: "portrait",
    icon: "./src/assets/logos/eventful-logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./src/assets/logos/eventful-background.png",
      resizeMode: "contain",
      backgroundColor: "#0a3b2e"
    },
    android: {
      package: bundleId,
      icon: "./src/assets/logos/eventful-logo-android.png",
      versionCode: 352,
      softwareKeyboardLayoutMode: "pan",
      permissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.ACCESS_MEDIA_LOCATION",
        "android.permission.CAMERA",
        "com.google.android.gms.permission.AD_ID"
      ],
      googleServicesFile: IS_DEV
        ? "./firebase/google-services-dev.json"
        : "./firebase/google-services.json"
    },
    ios: {
      bundleIdentifier: bundleId,
      icon: "./src/assets/logos/eventful-logo.png",
      buildNumber: "359",
      supportsTablet: true,
      appleTeamId: "4LMZHG2P3T",
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library to upload photos to your account and events.",
        LSApplicationQueriesSchemes: ["spotify", "comgooglemaps"],
        NSCameraUsageDescription:
          "Eventful uses your camera to let you take photos for your event pages or user profile.",
        ITSAppUsesNonExemptEncryption: false
      },
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
        "com.apple.developer.devicecheck.appattest-environment": "production",
        "com.apple.security.application-groups": [`group.${bundleId}`]
      },
      googleServicesFile: IS_DEV
        ? "./firebase/GoogleService-Info-Dev.plist"
        : "./firebase/GoogleService-Info.plist"
    },
    plugins: [
      "@react-native-firebase/app",
      "@react-native-firebase/app-check",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      "@react-native-google-signin/google-signin",
      [
        "expo-font",
        {
          fonts: [
            "./src/assets/fonts/Poppins-Regular.ttf",
            "./src/assets/fonts/Poppins-Medium.ttf",
            "./src/assets/fonts/Poppins-Medium-Italic.ttf",
            "./src/assets/fonts/Gotham-Bold.otf",
            "./src/assets/fonts/Playfair-Regular.ttf",
            "./src/assets/fonts/Anton-Regular.ttf",
            "./src/assets/fonts/BebasNeue-Regular.ttf",
            "./src/assets/fonts/Lobster.otf",
            "./src/assets/fonts/GreatVibes-Regular.ttf"
          ]
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./src/assets/logos/eventful-logo.png",
          color: "#0a3b2e",
          sounds: ["./src/assets/sounds/notification.wav"]
        }
      ],
      [
        "expo-media-library",
        {
          photosPermission:
            "Eventful uses your camera to let you take photos for your event pages or user profile.",
          savePhotosPermission:
            "Eventful needs access to your photo library to save photos from your events.",
          isAccessMediaLocationEnabled: true
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Eventful uses your camera to let you take photos for your event pages or user profile."
        }
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io",
          project: "eventful-app",
          organization: "chris-app"
        }
      ],
      "expo-asset",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.4",
            useFrameworks: "static",
            forceStaticLinking: [
              "RNFBApp",
              "RNFBAnalytics",
              "RNFBAppCheck",
              "RNFBAuth",
              "RNFBCrashlytics",
              "RNFBFirestore",
              "RNFBStorage"
            ]
          }
        }
      ],
      "@bacons/apple-targets",
      "./plugins/withBoringSSLHeaderFix"
    ],
    extra: {
      appVariant: IS_DEV ? "development" : "production",
      eas: {
        projectId: "8a843ae2-e39e-46ef-8eea-47724de6edf0"
      }
    },
    updates: {
      enabled: false
    }
  };
};
