#!/bin/bash

source "$(dirname "$0")/utils.sh"

mkdir -p build/dev
mkdir -p build/logs

android_dev_pipeline() {
  local phase_file=$1

  echo "Prebuilding" > "$phase_file"
  APP_VARIANT=development npx expo prebuild --clean || return $?

  echo "Building" > "$phase_file"
  eas build --local --platform android --profile development --non-interactive || return $?

  echo "Packaging" > "$phase_file"
  local android_build_file
  android_build_file=$(find . -name "*.apk" -not -path "./build/*" -type f | head -1)
  if [ -n "$android_build_file" ]; then
    mv "$android_build_file" "build/dev/eventful_android_dev.apk"
  fi
}

run_tracks "Android Dev Build" android_dev_pipeline "build/logs/android-dev-build.log"
print_summary
echo "✅ Android dev build completed"
