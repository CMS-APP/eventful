#!/bin/bash
set -e

# Prebuild the app (development variant — separate bundle ID/name from production)
APP_VARIANT=development npx expo prebuild

# Create Development Build
echo "📦 Building iOS Development App..."
IOS_START_TIME=$(date +%s)
eas build --local --platform ios --profile development --non-interactive
IOS_END_TIME=$(date +%s)
IOS_DURATION=$((IOS_END_TIME - IOS_START_TIME))
IOS_MINUTES=$((IOS_DURATION / 60))
IOS_SECONDS=$((IOS_DURATION % 60))
echo "✅ iOS build completed in ${IOS_MINUTES}m ${IOS_SECONDS}s"

# Create development build directory if it doesn't exist
mkdir -p build/development

# Find and move iOS build files
IOS_BUILD_FILE=$(find . -name "*.ipa" -not -path "./build/$NEW_VERSION/*" | head -1)
if [ -n "$IOS_BUILD_FILE" ]; then
    IOS_FILENAME="eventful_ios_development.ipa"
    mv "$IOS_BUILD_FILE" "build/development/$IOS_FILENAME"
    echo "✅ Moved iOS build to build/development/$IOS_FILENAME"
else
    echo "⚠️  No iOS .ipa file found"
fi


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
