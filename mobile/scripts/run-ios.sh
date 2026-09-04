#!/bin/bash

source "$(dirname "$0")/utils.sh"

mkdir -p build/logs

prebuild_ios() {
  local phase_file=$1
  echo "Prebuilding" > "$phase_file"
  APP_VARIANT=development npx expo prebuild --clean --platform ios
}

run_tracks "iOS Prebuild" prebuild_ios "build/logs/ios-prebuild.log"
print_summary

# expo run:ios attaches Metro and stays running for live reload, so it's
# left interactive here rather than piped through run_tracks like the
# prebuild above.
echo ""
echo "🚀 Building and launching on the iOS simulator — this stays running, Ctrl-C to stop."
APP_VARIANT=development npx expo run:ios
