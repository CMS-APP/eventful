#!/bin/bash
set -e

# ----------------------------
# Get current version and prompt user for new version
# ----------------------------
CURRENT_VERSION=$(grep -o 'version: "[^"]*"' app.config.ts | grep -o '[0-9.]*')
NEW_IOS_BUILD=$(grep -o 'buildNumber: "[0-9]*"' app.config.ts | grep -o '[0-9]*')
echo "Current version: $CURRENT_VERSION"
echo "Current iOS build: $NEW_IOS_BUILD"

echo "📤 Exporting sourcemaps..."
npx expo export --dump-sourcemap --platform ios --output-dir dist
npx expo export --dump-sourcemap --platform android --output-dir dist


echo "📤 Uploading iOS sourcemaps to Sentry..."
if npx sentry-cli sourcemaps upload \
  --org chris-app \
  --project eventful-app \
  --release com.hostinghappily.app@${CURRENT_VERSION}+${NEW_IOS_BUILD} \
  --dist ${NEW_IOS_BUILD} \
  ./dist; then
    echo "✅ iOS sourcemaps uploaded to Sentry"
else
    echo "❌ Failed to upload iOS sourcemaps to Sentry"
fi

NEW_ANDROID_BUILD=$(grep -o 'versionCode: [0-9]*' app.config.ts | grep -o '[0-9]*')

echo "📤 Uploading Android sourcemaps to Sentry..."
if npx sentry-cli sourcemaps upload \
  --org chris-app \
  --project eventful-app \
  --release com.hostinghappily.app@${CURRENT_VERSION}+${NEW_ANDROID_BUILD} \
  --dist ${NEW_ANDROID_BUILD} \
  ./dist; then
    echo "✅ Android sourcemaps uploaded to Sentry"
else
    echo "❌ Failed to upload Android sourcemaps to Sentry"
fi