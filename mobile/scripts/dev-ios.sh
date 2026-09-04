#!/bin/bash

source "$(dirname "$0")/utils.sh"

mkdir -p build/dev
mkdir -p build/logs

ios_dev_pipeline() {
  local phase_file=$1

  echo "Prebuilding" > "$phase_file"
  APP_VARIANT=development npx expo prebuild --clean || return $?

  echo "Building" > "$phase_file"
  eas build --local --platform ios --profile development --non-interactive || return $?

  echo "Packaging" > "$phase_file"
  local ios_build_file
  ios_build_file=$(find . -name "*.ipa" -not -path "./build/*" -type f | head -1)
  if [ -n "$ios_build_file" ]; then
    mv "$ios_build_file" "build/dev/eventful_ios_dev.ipa"
  fi
}

run_tracks "iOS Dev Build" ios_dev_pipeline "build/logs/ios-dev-build.log"
print_summary
echo "✅ iOS dev build completed"
