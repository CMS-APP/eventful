#!/bin/bash
set -e

# Prebuild the app (development variant — separate bundle ID/name from production)
APP_VARIANT=development npx expo prebuild --clean

# Create Development Build
echo "📦 Building Android Development App..."
ANDROID_START_TIME=$(date +%s)
eas build --local --platform android --profile development --non-interactive
ANDROID_END_TIME=$(date +%s)
ANDROID_DURATION=$((ANDROID_END_TIME - ANDROID_START_TIME))
ANDROID_MINUTES=$((ANDROID_DURATION / 60))
ANDROID_SECONDS=$((ANDROID_DURATION % 60))
echo "✅ Android build completed in ${ANDROID_MINUTES}m ${ANDROID_SECONDS}s"

# Create dev build directory if it doesn't exist
mkdir -p build/dev

# Find and move Android build files
ANDROID_BUILD_FILE=$(find . -name "*.apk" -not -path "./build/*" | head -1)
if [ -n "$ANDROID_BUILD_FILE" ]; then
    ANDROID_FILENAME="eventful_android_dev.apk"
    mv "$ANDROID_BUILD_FILE" "build/dev/$ANDROID_FILENAME"
    echo "✅ Moved Android build to build/dev/$ANDROID_FILENAME"
else
    echo "⚠️  No Android .apk file found"
fi