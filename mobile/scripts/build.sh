#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1
source "$SCRIPT_DIR/utils.sh"

ACTION=$1
PLATFORM=$2

usage() {
  echo "Usage: $0 [deploy [ios|android|both] | dev [ios|android|both] | sim [ios|android]]"
  exit 1
}

choose_action() {
  echo ""
  echo "What do you want to do?"
  echo "1) Deploy mobile (bump version, build & upload to stores)"
  echo "2) Dev build for devices (.ipa / .apk in build/dev)"
  echo "3) Local build for simulators (build, launch & attach Metro)"
  echo ""
  read -p "Enter choice (1-3): " choice
  case $choice in
    1) ACTION=deploy ;;
    2) ACTION=dev ;;
    3) ACTION=sim ;;
    *) echo "❌ Invalid choice"; exit 1 ;;
  esac
}

choose_platform() {
  local allow_both=$1
  echo ""
  echo "Select platform:"
  echo "1) iOS"
  echo "2) Android"
  [ "$allow_both" = true ] && echo "3) Both (Enter)"
  echo ""
  read -p "Enter choice: " choice
  case $choice in
    1) PLATFORM=ios ;;
    2) PLATFORM=android ;;
    3|"")
      if [ "$allow_both" = true ]; then
        PLATFORM=both
      else
        echo "❌ Invalid choice"; exit 1
      fi
      ;;
    *) echo "❌ Invalid choice"; exit 1 ;;
  esac
}

resolve_platforms() {
  local allow_both=$1
  [ -z "$PLATFORM" ] && choose_platform "$allow_both"
  BUILD_IOS=false
  BUILD_ANDROID=false
  case $PLATFORM in
    ios) BUILD_IOS=true ;;
    android) BUILD_ANDROID=true ;;
    both)
      [ "$allow_both" = true ] || usage
      BUILD_IOS=true
      BUILD_ANDROID=true
      ;;
    *) usage ;;
  esac
}

dev_pipeline() {
  local platform=$1
  local phase_file=$2
  local ext
  [ "$platform" = ios ] && ext=ipa || ext=apk

  echo "Prebuilding" > "$phase_file"
  APP_VARIANT=development npx expo prebuild --clean || return $?

  echo "Building" > "$phase_file"
  eas build --local --platform "$platform" --profile development --non-interactive || return $?

  echo "Packaging" > "$phase_file"
  local build_file
  build_file=$(find . -name "*.$ext" -not -path "./build/*" -type f | head -1)
  if [ -n "$build_file" ]; then
    mv "$build_file" "build/dev/eventful_${platform}_dev.$ext"
  fi
}

ios_dev_pipeline() { dev_pipeline ios "$1"; }
android_dev_pipeline() { dev_pipeline android "$1"; }

run_dev() {
  resolve_platforms true
  check_expo_doctor
  mkdir -p build/dev build/logs

  if [ "$BUILD_IOS" = true ]; then
    run_tracks "iOS Dev Build" ios_dev_pipeline "build/logs/ios-dev-build.log"
  fi
  if [ "$BUILD_ANDROID" = true ]; then
    run_tracks "Android Dev Build" android_dev_pipeline "build/logs/android-dev-build.log"
  fi

  print_summary
  echo "✅ Dev build completed"
}

prebuild_sim() {
  local phase_file=$1
  echo "Prebuilding" > "$phase_file"
  APP_VARIANT=development npx expo prebuild --clean --platform "$SIM_PLATFORM"
}

run_sim() {
  resolve_platforms false
  SIM_PLATFORM=$PLATFORM
  check_expo_doctor
  mkdir -p build/logs

  local label
  [ "$PLATFORM" = ios ] && label="iOS" || label="Android"
  run_tracks "$label Prebuild" prebuild_sim "build/logs/$PLATFORM-prebuild.log"
  print_summary

  echo ""
  echo "🚀 Building and launching on the $label simulator — this stays running, Ctrl-C to stop."
  APP_VARIANT=development exec npx expo "run:$PLATFORM"
}

env_var() {
  grep -E "^$1=" .env 2>/dev/null | tail -n1 | cut -d '=' -f2-
}

build_ios() {
  npx expo prebuild --platform ios --clean

  sed -i '' "s/MARKETING_VERSION = [^;]*;/MARKETING_VERSION = $NEW_VERSION;/g" ios/Eventful.xcodeproj/project.pbxproj
  sed -i '' "s/CURRENT_PROJECT_VERSION = [0-9]*/CURRENT_PROJECT_VERSION = $NEW_IOS_BUILD/g" ios/Eventful.xcodeproj/project.pbxproj
  sed -i '' "/<key>CFBundleShortVersionString<\/key>/{n;s#<string>.*</string>#<string>$NEW_VERSION</string>#;}" ios/Eventful/Info.plist
  sed -i '' "/<key>CFBundleVersion<\/key>/{n;s#<string>.*</string>#<string>$NEW_IOS_BUILD</string>#;}" ios/Eventful/Info.plist

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
    --skip_app_version_update true \
    --force \
    --run_precheck_before_submit false \
    --submit_for_review false
}

build_android() {
  npx expo prebuild --platform android --clean

  sed -i '' "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle
  sed -i '' "s/versionCode [0-9]*/versionCode $NEW_ANDROID_BUILD/" android/app/build.gradle

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

ios_deploy_pipeline() {
  local phase_file=$1
  echo "Building" > "$phase_file"
  build_ios || return $?
  echo "Uploading" > "$phase_file"
  upload_ios || return $?
  rm -f "build/$NEW_VERSION/$IOS_FILENAME"
}

android_deploy_pipeline() {
  local phase_file=$1
  echo "Building" > "$phase_file"
  build_android || return $?
  echo "Uploading" > "$phase_file"
  upload_android || return $?
  rm -f "build/$NEW_VERSION/$ANDROID_FILENAME"
}

run_deploy() {
  echo "Building Eventful App"

  echo "🔍 Running lint checks..."
  if ! npx eslint .; then
    echo "❌ Lint errors found. Fix them before deploying."
    exit 1
  fi
  echo "✅ No lint errors found"

  check_expo_doctor

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
  local timestamp
  timestamp=$(date +"%Y%m%d_%H%M%S")
  IOS_FILENAME="eventful_ios_${timestamp}.ipa"
  ANDROID_FILENAME="eventful_android_${timestamp}.aab"

  local current_version
  current_version=$(grep -o 'version: "[^"]*"' app.config.ts | grep -o '[0-9.]*')
  echo "Current version: $current_version"
  echo ""
  read -p "Enter new version number (e.g., $current_version): " NEW_VERSION

  [ -z "$NEW_VERSION" ] && NEW_VERSION=$current_version

  if [[ ! $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Invalid version format. Please use format like 5.6.4"
    exit 1
  fi

  resolve_platforms true

  echo "🔧 Updating version to $NEW_VERSION..."
  local current_version_escaped
  current_version_escaped=$(echo "$current_version" | sed 's/\./\\./g')
  sed -i '' "s/version: \"$current_version_escaped\"/version: \"$NEW_VERSION\"/" app.config.ts
  sed -i '' "s/runtimeVersion: \"$current_version_escaped\"/runtimeVersion: \"$NEW_VERSION\"/" app.config.ts
  echo "✅ Updated version to $NEW_VERSION"

  mkdir -p "build/$NEW_VERSION" build/logs

  local current_ios_build current_android_build current_build
  current_ios_build=$(grep -o 'buildNumber: "[0-9]*"' app.config.ts | grep -o '[0-9]*')
  current_android_build=$(grep -o 'versionCode: [0-9]*' app.config.ts | grep -o '[0-9]*')
  current_build=$(( current_ios_build > current_android_build ? current_ios_build : current_android_build ))
  NEW_BUILD=$((current_build + 1))
  NEW_IOS_BUILD=$NEW_BUILD
  NEW_ANDROID_BUILD=$NEW_BUILD
  sed -i '' "s/buildNumber: \"$current_ios_build\"/buildNumber: \"$NEW_BUILD\"/" app.config.ts
  sed -i '' "s/versionCode: $current_android_build/versionCode: $NEW_BUILD/" app.config.ts
  echo "✅ Updated iOS build number and Android version code to $NEW_BUILD"

  local tracks=()
  [ "$BUILD_IOS" = true ] && tracks+=("iOS" ios_deploy_pipeline "build/logs/ios.log")
  [ "$BUILD_ANDROID" = true ] && tracks+=("Android" android_deploy_pipeline "build/logs/android.log")

  run_tracks "${tracks[@]}"

  print_summary
  echo "✅ All builds completed successfully"
}

[ -z "$ACTION" ] && choose_action

case $ACTION in
  deploy) run_deploy ;;
  dev) run_dev ;;
  sim) run_sim ;;
  *) usage ;;
esac
