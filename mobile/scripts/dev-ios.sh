#!/bin/bash
set -e

# Prebuild the app (development variant — separate bundle ID/name from production)
APP_VARIANT=development npx expo prebuild --clean

# Create Development Build
echo "📦 Building iOS Development App..."
IOS_START_TIME=$(date +%s)
eas build --local --platform ios --profile development --non-interactive
IOS_END_TIME=$(date +%s)
IOS_DURATION=$((IOS_END_TIME - IOS_START_TIME))
IOS_MINUTES=$((IOS_DURATION / 60))
IOS_SECONDS=$((IOS_DURATION % 60))
echo "✅ iOS build completed in ${IOS_MINUTES}m ${IOS_SECONDS}s"

# Create dev build directory if it doesn't exist
mkdir -p build/dev

# Find and move iOS build files
IOS_BUILD_FILE=$(find . -name "*.ipa" -not -path "./build/*" | head -1)
if [ -n "$IOS_BUILD_FILE" ]; then
    IOS_FILENAME="eventful_ios_dev.ipa"
    mv "$IOS_BUILD_FILE" "build/dev/$IOS_FILENAME"
    echo "✅ Moved iOS build to build/dev/$IOS_FILENAME"
else
    echo "⚠️  No iOS .ipa file found"
fi