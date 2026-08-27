#!/bin/bash
set -e

if [ -f .env ]; then
  echo "🔑 Loading environment variables from .env"
  set -a
  source .env
  set +a
  if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "❌ SENTRY_AUTH_TOKEN is not set in .env — sourcemaps will not be uploaded to Sentry."
    echo "   Add it to .env (get a token from Sentry: Settings → Auth Tokens)."
    exit 1
  fi
  export SENTRY_AUTH_TOKEN
else
  echo "❌ No .env file found — required for SENTRY_AUTH_TOKEN and other secrets."
  exit 1
fi

unset APP_VARIANT

if [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Not on the main branch! Please checkout the main branch and try again."
  exit 1
fi

echo "🔧 Updating CocoaPods repository..."
pod repo update

echo "🏥 Running Expo doctor to check for issues..."
if npx expo-doctor; then
    echo "✅ Expo doctor passed - no issues found"
else
    echo "❌ Expo doctor found issues - please review the output above"
    echo "⚠️  Continuing with build process..."
fi

echo ""

CURRENT_VERSION=$(grep -o 'version: "[^"]*"' app.config.ts | grep -o '[0-9.]*')
echo "Current version: $CURRENT_VERSION"
echo ""
read -p "Enter new version number (e.g., $CURRENT_VERSION): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    NEW_VERSION=$CURRENT_VERSION
fi

if [[ ! $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Invalid version format. Please use format like 5.6.4"
    exit 1
fi

echo "🔧 Updating version to $NEW_VERSION..."

CURRENT_VERSION_ESCAPED=$(echo "$CURRENT_VERSION" | sed 's/\./\\./g')
NEW_VERSION_ESCAPED=$(echo "$NEW_VERSION" | sed 's/\./\\./g')

sed -i '' "s/version: \"$CURRENT_VERSION_ESCAPED\"/version: \"$NEW_VERSION\"/" app.config.ts
sed -i '' "s/runtimeVersion: \"$CURRENT_VERSION_ESCAPED\"/runtimeVersion: \"$NEW_VERSION\"/" app.config.ts
echo "✅ Updated version to $NEW_VERSION"

echo ""
echo "Select platform to build:"
echo "1) iOS"
echo "2) Android"
echo "3) Both (Enter)"
echo ""
read -p "Enter choice (1-3): " PLATFORM_CHOICE

BUILD_IOS=false
BUILD_ANDROID=false

case $PLATFORM_CHOICE in
  1)
    BUILD_IOS=true
    echo "✅ Building iOS only"
    ;;
  2)
    BUILD_ANDROID=true
    echo "✅ Building Android only"
    ;;
  3|"")
    BUILD_IOS=true
    BUILD_ANDROID=true
    echo "✅ Building both iOS and Android"
    ;;
  *)
    echo "❌ Invalid choice. Please select 1, 2, or 3"
    exit 1
    ;;
esac

if [ "$BUILD_IOS" = true ]; then
  echo "🔧 Incrementing iOS build number..."
  CURRENT_IOS_BUILD=$(grep -o 'buildNumber: "[0-9]*"' app.config.ts | grep -o '[0-9]*')
  NEW_IOS_BUILD=$((CURRENT_IOS_BUILD + 1))
  sed -i '' "s/buildNumber: \"$CURRENT_IOS_BUILD\"/buildNumber: \"$NEW_IOS_BUILD\"/" app.config.ts
  echo "✅ Updated iOS build number to $NEW_IOS_BUILD"
fi

if [ "$BUILD_ANDROID" = true ]; then
  echo "🔧 Incrementing Android version code..."
  CURRENT_ANDROID_BUILD=$(grep -o 'versionCode: [0-9]*' app.config.ts | grep -o '[0-9]*')
  NEW_ANDROID_BUILD=$((CURRENT_ANDROID_BUILD + 1))
  sed -i '' "s/versionCode: $CURRENT_ANDROID_BUILD/versionCode: $NEW_ANDROID_BUILD/" app.config.ts
  echo "✅ Updated Android version code to $NEW_ANDROID_BUILD"
fi

if [ "$BUILD_IOS" = true ]; then
  echo "🔧 Regenerating iOS native project..."
  npx expo prebuild --platform ios
  echo "✅ iOS native project regenerated"

  echo "🔧 Stamping iOS version $NEW_VERSION, build $NEW_IOS_BUILD..."
  sed -i '' "s/MARKETING_VERSION = [^;]*;/MARKETING_VERSION = $NEW_VERSION;/g" ios/Eventful.xcodeproj/project.pbxproj
  sed -i '' "s/CURRENT_PROJECT_VERSION = [0-9]*/CURRENT_PROJECT_VERSION = $NEW_IOS_BUILD/g" ios/Eventful.xcodeproj/project.pbxproj
  sed -i '' "/<key>CFBundleShortVersionString<\/key>/{n;s#<string>.*</string>#<string>$NEW_VERSION</string>#;}" ios/Eventful/Info.plist
  sed -i '' "/<key>CFBundleVersion<\/key>/{n;s#<string>.*</string>#<string>$NEW_IOS_BUILD</string>#;}" ios/Eventful/Info.plist
  echo "✅ iOS stamped at version $NEW_VERSION, build $NEW_IOS_BUILD"
fi

if [ "$BUILD_ANDROID" = true ]; then
  echo "🔧 Regenerating Android native project..."
  npx expo prebuild --platform android
  echo "✅ Android native project regenerated"

  echo "🔧 Stamping Android version $NEW_VERSION, versionCode $NEW_ANDROID_BUILD..."
  sed -i '' "s/versionCode [0-9]*/versionCode $NEW_ANDROID_BUILD/" android/app/build.gradle
  sed -i '' "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle
  echo "✅ Android stamped at version $NEW_VERSION, versionCode $NEW_ANDROID_BUILD"
fi

IOS_DURATION=0
ANDROID_DURATION=0
IOS_MINUTES=0
IOS_SECONDS=0
ANDROID_MINUTES=0
ANDROID_SECONDS=0

if [ "$BUILD_IOS" = true ]; then
  echo "📦 Building iOS app..."
  IOS_START_TIME=$(date +%s)
  eas build --platform ios --local --profile production --non-interactive
  IOS_END_TIME=$(date +%s)
  IOS_DURATION=$((IOS_END_TIME - IOS_START_TIME))
  IOS_MINUTES=$((IOS_DURATION / 60))
  IOS_SECONDS=$((IOS_DURATION % 60))
  echo "✅ iOS build completed in ${IOS_MINUTES}m ${IOS_SECONDS}s"
fi

if [ "$BUILD_ANDROID" = true ]; then
  echo "📦 Building Android app..."
  ANDROID_START_TIME=$(date +%s)
  eas build --platform android --local --non-interactive
  ANDROID_END_TIME=$(date +%s)
  ANDROID_DURATION=$((ANDROID_END_TIME - ANDROID_START_TIME))
  ANDROID_MINUTES=$((ANDROID_DURATION / 60))
  ANDROID_SECONDS=$((ANDROID_DURATION % 60))
  echo "✅ Android build completed in ${ANDROID_MINUTES}m ${ANDROID_SECONDS}s"
fi

echo "📁 Organising build files..."

mkdir -p build

mkdir -p build/$NEW_VERSION

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

IOS_FILENAME=""
ANDROID_FILENAME=""

if [ "$BUILD_IOS" = true ]; then
  IOS_BUILD_FILE=$(find . -name "*.ipa" -not -path "./build/*" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | sort -rn | head -1 | sed 's/^[0-9]* //')
  if [ -n "$IOS_BUILD_FILE" ]; then
      IOS_FILENAME="eventful_ios_${TIMESTAMP}.ipa"
      mv "$IOS_BUILD_FILE" "build/$NEW_VERSION/$IOS_FILENAME"
      echo "✅ Moved iOS build to build/$NEW_VERSION/$IOS_FILENAME"
  else
      echo "⚠️  No iOS .ipa file found"
  fi
fi

if [ "$BUILD_ANDROID" = true ]; then
  ANDROID_BUILD_FILE=$(find . -name "*.aab" -not -path "./build/*" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | sort -rn | head -1 | sed 's/^[0-9]* //')
  if [ -n "$ANDROID_BUILD_FILE" ]; then
      ANDROID_FILENAME="eventful_android_${TIMESTAMP}.aab"
      mv "$ANDROID_BUILD_FILE" "build/$NEW_VERSION/$ANDROID_FILENAME"
      echo "✅ Moved Android build to build/$NEW_VERSION/$ANDROID_FILENAME"
  else
      echo "⚠️  No Android .aab file found"
  fi
fi

TOTAL_DURATION=$((IOS_DURATION + ANDROID_DURATION))
TOTAL_MINUTES=$((TOTAL_DURATION / 60))
TOTAL_SECONDS=$((TOTAL_DURATION % 60))

echo ""
if [ "$BUILD_IOS" = true ] && [ "$BUILD_ANDROID" = true ]; then
  echo "🎉 Build complete for iOS and Android!"
elif [ "$BUILD_IOS" = true ]; then
  echo "🎉 Build complete for iOS!"
elif [ "$BUILD_ANDROID" = true ]; then
  echo "🎉 Build complete for Android!"
fi
echo ""
echo "Build Times:"
if [ "$BUILD_IOS" = true ]; then
  echo "🍎 iOS: ${IOS_MINUTES}m ${IOS_SECONDS}s"
fi
if [ "$BUILD_ANDROID" = true ]; then
  echo "🤖 Android: ${ANDROID_MINUTES}m ${ANDROID_SECONDS}s"
fi
if [ "$BUILD_IOS" = true ] && [ "$BUILD_ANDROID" = true ]; then
  echo "⏱️ Total: ${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"
fi

if [ "$BUILD_IOS" = true ]; then
  echo "📤 Uploading iOS build to App Store Connect..."

  if [ -f "build/$NEW_VERSION/$IOS_FILENAME" ]; then
    fastlane deliver \
      --api_key_path "$APP_STORE_CONNECT_API_KEY_PATH" \
      --ipa "build/$NEW_VERSION/$IOS_FILENAME" \
      --skip_screenshots \
      --skip_metadata \
      --force \
      --run_precheck_before_submit false \
      --submit_for_review false

    if [ $? -eq 0 ]; then
      echo "✅ iOS build uploaded to App Store Connect successfully!"
    else
      echo "❌ Failed to upload iOS build to App Store Connect."
    fi
  else
    echo "❌ .ipa file not found for upload."
  fi
fi

if [ "$BUILD_ANDROID" = true ]; then
  echo "📤 Uploading Android build to Google Play Console..."

  if [ -f "build/$NEW_VERSION/$ANDROID_FILENAME" ]; then
    fastlane supply \
      --json_key "$GOOGLE_PLAY_API_KEY_PATH" \
      --package_name "com.hostinghappily.app" \
      --aab "build/$NEW_VERSION/$ANDROID_FILENAME" \
      --track "internal" \
      --skip_upload_metadata true \
      --skip_upload_images true \
      --skip_upload_screenshots true

    if [ $? -eq 0 ]; then
      echo "✅ Android build uploaded to Google Play Console successfully!"
    else
      echo "❌ Failed to upload Android build to Google Play Console."
    fi
  else
    echo "❌ .aab file not found for upload."
  fi
fi

echo ""
echo "📱 Sending desktop notification..."

if [ "$BUILD_IOS" = true ] && [ "$BUILD_ANDROID" = true ]; then
  NOTIFICATION_MESSAGE="Eventful v${NEW_VERSION} build completed! iOS: ${IOS_MINUTES}m ${IOS_SECONDS}s, Android: ${ANDROID_MINUTES}m ${ANDROID_SECONDS}s"
elif [ "$BUILD_IOS" = true ]; then
  NOTIFICATION_MESSAGE="Eventful v${NEW_VERSION} iOS build completed! ${IOS_MINUTES}m ${IOS_SECONDS}s"
elif [ "$BUILD_ANDROID" = true ]; then
  NOTIFICATION_MESSAGE="Eventful v${NEW_VERSION} Android build completed! ${ANDROID_MINUTES}m ${ANDROID_SECONDS}s"
fi

if command -v terminal-notifier >/dev/null 2>&1; then
    terminal-notifier -title "Eventful Build Complete" -message "${NOTIFICATION_MESSAGE}" -sound Glass
else
    echo "⚠️ terminal-notifier not found, trying osascript..."

    if osascript -e "display notification \"${NOTIFICATION_MESSAGE}\" with title \"Eventful Build Complete\"" 2>/dev/null; then
        echo "✅ Desktop notification sent via osascript!"
    else
        echo "🔔 Build completed! (Notification not available - check Terminal permissions)"
        echo "📱 ${NOTIFICATION_MESSAGE}"
        printf "\a"
    fi
fi
