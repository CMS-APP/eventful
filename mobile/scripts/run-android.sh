#!/bin/bash

source "$(dirname "$0")/utils.sh"

mkdir -p build/logs

prebuild_android() {
  local phase_file=$1
  echo "Prebuilding" > "$phase_file"
  APP_VARIANT=development npx expo prebuild --clean --platform android
}

run_tracks "Android Prebuild" prebuild_android "build/logs/android-prebuild.log"
print_summary

# expo run:android attaches Metro and stays running for live reload, so
# it's left interactive here rather than piped through run_tracks like the
# prebuild above.
echo ""
echo "🚀 Building and launching on the Android emulator — this stays running, Ctrl-C to stop."
APP_VARIANT=development npx expo run:android
