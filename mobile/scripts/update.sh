#!/bin/bash
set -e

# ----------------------------
# Error handling with notification
# ----------------------------
send_error_notification() {
  local error_message="$1"
  echo ""
  echo "❌ ERROR: ${error_message}"
  echo "📱 Sending error notification..."
  
  # Method 1: Use terminal-notifier (most reliable)
  if command -v terminal-notifier >/dev/null 2>&1; then
    terminal-notifier -title "Eventful Update Failed" -message "${error_message}" -sound Basso
  else
    # Method 2: Fallback to osascript
    if osascript -e "display notification \"${error_message}\" with title \"Eventful Update Failed\" sound name \"Basso\"" 2>/dev/null; then
      echo "✅ Error notification sent via osascript!"
    else
      # Method 3: Fallback to system beep
      echo "🔔 Update failed! ${error_message}"
      printf "\a\a\a"
    fi
  fi
}

# Trap errors and send notification
trap 'send_error_notification "Update failed at line $LINENO. Check the output above for details."' ERR

# ----------------------------
# Load environment variables
# ----------------------------
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo "✅ Loaded environment variables from .env file"
else
  echo "❌ .env file not found!"
  exit 1
fi

# ----------------------------
# Check if git on the production branch
# ----------------------------
if [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Not on the main branch! Please checkout the main branch and try again."
  exit 1
fi

# ----------------------------
# Run health checks
# ----------------------------
echo "🏥 Running Expo doctor to check for issues..."
if npx expo-doctor; then
    echo "✅ Expo doctor passed - no issues found"
else
    echo "❌ Expo doctor found issues - please review the output above"
    echo "⚠️  Continuing with build process..."
fi

echo ""

# ----------------------------
# Configuration
# ----------------------------
SENTRY_ORG="chris-app"
SENTRY_PROJECT="eventful-app"
EAS_BRANCH="production"

# Get current git commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "Using commit hash: $COMMIT_HASH"

# ----------------------------
# EAS Update (generate JS bundle)
# ----------------------------
echo ""
echo "🚀 Running EAS update to branch $EAS_BRANCH..."
eas update --branch $EAS_BRANCH --message "$COMMIT_HASH" > /tmp/eas_update_output.log 2>&1
npx sentry-expo-upload-sourcemaps dist 