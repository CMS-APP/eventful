echo "Building Eventful App"

source "$(dirname "$0")/deploy-utils.sh"

env_var() {
  grep -E "^$1=" .env 2>/dev/null | tail -n1 | cut -d '=' -f2-
}

if [ -f .env ]; then
  SENTRY_AUTH_TOKEN=$(env_var SENTRY_AUTH_TOKEN)
  APP_STORE_CONNECT_API_KEY_PATH=$(env_var APP_STORE_CONNECT_API_KEY_PATH)
  GOOGLE_PLAY_API_KEY_PATH=$(env_var GOOGLE_PLAY_API_KEY_PATH)
fi

if [ -z "$SENTRY_AUTH_TOKEN" ]; then
  echo "❌ No SENTRY_AUTH_TOKEN found"
  exit 1
fi

export SENTRY_AUTH_TOKEN
export APP_STORE_CONNECT_API_KEY_PATH
export GOOGLE_PLAY_API_KEY_PATH
export EXPO_NO_GIT_STATUS=1
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
IOS_FILENAME="eventful_ios_${TIMESTAMP}.ipa"
ANDROID_FILENAME="eventful_android_${TIMESTAMP}.aab"

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

mkdir -p build
mkdir -p build/$NEW_VERSION
mkdir -p build/logs

if [ "$BUILD_IOS" = true ]; then
  CURRENT_IOS_BUILD=$(grep -o 'buildNumber: "[0-9]*"' app.config.ts | grep -o '[0-9]*')
  NEW_IOS_BUILD=$((CURRENT_IOS_BUILD + 1))
  sed -i '' "s/buildNumber: \"$CURRENT_IOS_BUILD\"/buildNumber: \"$NEW_IOS_BUILD\"/" app.config.ts
  echo "✅ Updated iOS build number to $NEW_IOS_BUILD"
fi

if [ "$BUILD_ANDROID" = true ]; then
  CURRENT_ANDROID_BUILD=$(grep -o 'versionCode: [0-9]*' app.config.ts | grep -o '[0-9]*')
  NEW_ANDROID_BUILD=$((CURRENT_ANDROID_BUILD + 1))
  sed -i '' "s/versionCode: $CURRENT_ANDROID_BUILD/versionCode: $NEW_ANDROID_BUILD/" app.config.ts
  echo "✅ Updated Android version code to $NEW_ANDROID_BUILD"
fi

build_ios() {
  # Prebuild iOS app
  npx expo prebuild --platform ios --clean

  # Update iOS version and build number
  sed -i '' "s/MARKETING_VERSION = [^;]*;/MARKETING_VERSION = $NEW_VERSION;/g" ios/Eventful.xcodeproj/project.pbxproj
  sed -i '' "s/CURRENT_PROJECT_VERSION = [0-9]*/CURRENT_PROJECT_VERSION = $NEW_IOS_BUILD/g" ios/Eventful.xcodeproj/project.pbxproj
  sed -i '' "/<key>CFBundleShortVersionString<\/key>/{n;s#<string>.*</string>#<string>$NEW_VERSION</string>#;}" ios/Eventful/Info.plist
  sed -i '' "/<key>CFBundleVersion<\/key>/{n;s#<string>.*</string>#<string>$NEW_IOS_BUILD</string>#;}" ios/Eventful/Info.plist

  # Build iOS app
  eas build --platform ios --local --profile production --non-interactive

  IOS_BUILD_FILE=$(find . -name "*.ipa" -not -path "./build/*" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | sort -rn | head -1 | sed 's/^[0-9]* //')
  mv "$IOS_BUILD_FILE" "build/$NEW_VERSION/$IOS_FILENAME"
}

upload_ios() {
  fastlane deliver \
    --api_key_path "$APP_STORE_CONNECT_API_KEY_PATH" \
    --ipa "build/$NEW_VERSION/$IOS_FILENAME" \
    --skip_screenshots \
    --skip_metadata \
    --force \
    --run_precheck_before_submit false \
    --submit_for_review false
}

build_android() {
  # Prebuild Android app
  npx expo prebuild --platform android --clean

  # Update Android version and build number
  sed -i '' "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle
  sed -i '' "s/versionCode [0-9]*/versionCode $NEW_ANDROID_BUILD/" android/app/build.gradle

  # Build Android app
  eas build --platform android --local --profile production --non-interactive

  ANDROID_BUILD_FILE=$(find . -name "*.aab" -not -path "./build/*" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | sort -rn | head -1 | sed 's/^[0-9]* //')
  mv "$ANDROID_BUILD_FILE" "build/$NEW_VERSION/$ANDROID_FILENAME"
}

upload_android() {
  fastlane supply \
    --json_key "$GOOGLE_PLAY_API_KEY_PATH" \
    --package_name "com.hostinghappily.app" \
    --aab "build/$NEW_VERSION/$ANDROID_FILENAME" \
    --track "internal" \
    --skip_upload_metadata true \
    --skip_upload_images true \
    --skip_upload_screenshots true
}

ios_pipeline() {
  local phase_file=$1
  echo "Building" > "$phase_file"
  build_ios || return $?
  echo "Uploading" > "$phase_file"
  upload_ios
}

android_pipeline() {
  local phase_file=$1
  echo "Building" > "$phase_file"
  build_android || return $?
  echo "Uploading" > "$phase_file"
  upload_android
}

TRACKS=()
if [ "$BUILD_IOS" = true ]; then
  TRACKS+=("iOS" ios_pipeline "build/logs/ios.log")
fi
if [ "$BUILD_ANDROID" = true ]; then
  TRACKS+=("Android" android_pipeline "build/logs/android.log")
fi

run_tracks "${TRACKS[@]}"

print_summary
echo "✅ All builds completed successfully"

