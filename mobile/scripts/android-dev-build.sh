#!/bin/bash
set -e

# Prebuild the app (development variant — separate bundle ID/name from production)
APP_VARIANT=development npx expo prebuild

# Create Development Build
echo "📦 Building Android Development App..."
ANDROID_START_TIME=$(date +%s)
eas build --local --platform android --profile development --non-interactive
IOS_END_TIME=$(date +%s)
ANDROID_DURATION=$((ANDROID_END_TIME - ANDROID_START_TIME))
ANDROID_MINUTES=$((ANDROID_DURATION / 60))
ANDROID_SECONDS=$((ANDROID_DURATION % 60))
echo "✅ Android build completed in ${ANDROID_MINUTES}m ${ANDROID_SECONDS}s"

# Create development build directory if it doesn't exist
mkdir -p build/development

# Find and move Android build files
ANDROID_BUILD_FILE=$(find . -name "*.apk" -not -path "./build/$NEW_VERSION/*" | head -1)
if [ -n "$ANDROID_BUILD_FILE" ]; then
    ANDROID_FILENAME="eventful_android_development.apk"
    mv "$ANDROID_BUILD_FILE" "build/development/$ANDROID_FILENAME"
    echo "✅ Moved Android build to build/development/$ANDROID_FILENAME"
else
    echo "⚠️  No Android .apk file found"
fi

# Method 1: Use terminal-notifier (most reliable)
if command -v terminal-notifier >/dev/null 2>&1; then
    terminal-notifier -title "Eventful Build Complete" -message "${NOTIFICATION_MESSAGE}" -sound Glass
else
    echo "⚠️ terminal-notifier not found, trying osascript..."
    
    # Method 2: Fallback to osascript
    if osascript -e "display notification \"${NOTIFICATION_MESSAGE}\" with title \"Eventful Build Complete\"" 2>/dev/null; then
        echo "✅ Desktop notification sent via osascript!"
    else
        # Method 3: Fallback to system beep and echo
        echo "🔔 Build completed! (Notification not available - check Terminal permissions)"
        echo "📱 ${NOTIFICATION_MESSAGE}"
        # Try to make a system beep
        printf "\a"
    fi
fi
