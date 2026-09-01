import { track } from "@/services/analytics/analytics";

// Auth

export function trackAuthSignIn() {
  track("auth_sign_in");
}

export function trackAuthSignUp() {
  track("auth_sign_up");
}

export function trackAuthSignOut() {
  track("auth_sign_out");
}

export function trackAuthAccountDeleted() {
  track("auth_account_deleted");
}

// Onboarding

export function trackOnboardingCompleted() {
  track("onboarding_completed");
}

// Events

export function trackEventCreated() {
  track("event_created", undefined, "create");
}

export function trackEventUpdated() {
  track("event_updated");
}

export function trackEventDeleted() {
  track("event_deleted");
}

// Invites & guests

export function trackInviteSent(type: "app" | "link" | "manual") {
  track("invite_sent", { type }, `sent:${type}`);
}

export function trackInviteResponseChanged(response: string) {
  track("invite_response_changed", { response });
}

// Contacts

export function trackUserFollowed() {
  track("user_followed");
}

export function trackUserUnfollowed() {
  track("user_unfollowed");
}

// Photo booth

export function trackPhotoBoothPhotoShared() {
  track("photo_booth_photo_shared");
}

export function trackPhotoBoothPhotoSaved() {
  track("photo_booth_photo_saved");
}

export function trackPhotoBoothPhotosUploaded(count: number) {
  track("photo_booth_photos_uploaded", { count });
}

// Inspiration

export function trackPostCreated() {
  track("post_created", undefined, "create");
}

export function trackPollCreated() {
  track("poll_created", undefined, "create");
}

export function trackPollVoted() {
  track("poll_voted");
}

// Feedback

export function trackFeedbackSubmitted(type: string) {
  track("feedback_submitted", { type });
}

// Spotify

export function trackSpotifyConnected() {
  track("spotify_connected");
}

export function trackSpotifyDisconnected() {
  track("spotify_disconnected");
}

export function trackSpotifyPlaylistAdded() {
  track("spotify_playlist_added");
}

export function trackSpotifyPlaylistRemoved() {
  track("spotify_playlist_removed");
}

// Payments

export function trackSubscriptionPurchased(type: string) {
  track("subscription_purchased", { type });
}

export function trackSubscriptionRestored(hasActiveSubscription: boolean) {
  track("subscription_restored", {
    has_active_subscription: hasActiveSubscription
  });
}
