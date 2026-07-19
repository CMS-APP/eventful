import "dotenv/config";

import { ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext) => {
  return {
    ...config,
    name: "Eventful",
    slug: "Eventful",
    scheme: "eventful",
    owner: "chrissharp",
    version: "6.2.0",
    runtimeVersion: "6.2.0",
    orientation: "portrait",
    icon: "./src/assets/logos/eventful-logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./src/assets/logos/eventful-background.png",
      resizeMode: "contain",
      backgroundColor: "#0a3b2e"
    },
    android: {
      package: "com.hostinghappily.app",
      icon: "./src/assets/logos/eventful-logo-android.png",
      versionCode: 298,
      softwareKeyboardLayoutMode: "pan",
      permissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.ACCESS_MEDIA_LOCATION",
        "android.permission.CAMERA"
      ],
      googleServicesFile: "./google-services.json"
    },
    ios: {
      bundleIdentifier: "com.hostinghappily.app",
      icon: "./src/assets/logos/eventful-logo.png",
      buildNumber: "297",
      supportsTablet: true,
      usesAppleSignIn: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library to upload photos to your account and events.",
        LSApplicationQueriesSchemes: ["spotify"],
        NSCameraUsageDescription:
          "Eventful uses your camera to let you take photos for your event pages or user profile.",
        ITSAppUsesNonExemptEncryption: false
      },
      entitlements: {
        "com.apple.developer.applesignin": ["Default"]
      },
      googleServicesFile: "./GoogleService-Info.plist"
    },
    plugins: [
      "@react-native-firebase/app",
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
            "./src/assets/fonts/Playfair-Variable.ttf",
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
      "expo-asset"
    ],
    extra: {
      eas: {
        projectId: "8a843ae2-e39e-46ef-8eea-47724de6edf0"
      }
    },
    updates: {
      url: "https://u.expo.dev/8a843ae2-e39e-46ef-8eea-47724de6edf0",
      enabled: true,
      fallbackToCacheTimeout: 0
    }
  };
};
