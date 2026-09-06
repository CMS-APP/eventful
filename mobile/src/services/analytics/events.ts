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

export function trackOnboardingStarted() {
  track("onboarding_started");
}

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

export function trackEventListItemAdded(
  list: "checklist" | "toDoList" | "shoppingList"
) {
  track("event_list_item_added", { list });
}

export function trackEventBudgetItemAdded(category: string) {
  track("event_budget_item_added", { category });
}

export function trackEventLocationSearched() {
  track("event_location_searched");
}

export function trackEventLocationSelected() {
  track("event_location_selected");
}

export function trackEventTimelineItemToggled(completed: boolean) {
  track("event_timeline_item_toggled", { completed });
}

export function trackEventAmazonLinkOpened() {
  track("event_amazon_link_opened");
}

// Invites & guests

export function trackInviteSent(type: "app" | "link" | "manual") {
  track("invite_sent", { type }, `sent:${type}`);
}

export function trackInviteResponseChanged(response: string) {
  track("invite_response_changed", { response });
}

export function trackInviteLinkCopied() {
  track("invite_link_copied");
}

// Contacts

export function trackUserFollowed() {
  track("user_followed");
}

export function trackContactsSearchPerformed() {
  track("contacts_search_performed");
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

export function trackPhotoBoothSessionStarted() {
  track("photo_booth_session_started");
}

export function trackPhotoBoothLocked() {
  track("photo_booth_locked");
}

export function trackPhotoBoothCustomised(type: "collage" | "filter") {
  track("photo_booth_customised", { type });
}

// Inspiration

export function trackPostLiked() {
  track("post_liked");
}

export function trackPollVoted() {
  track("poll_voted");
}

// Settings & account

export function trackSettingsNameChanged() {
  track("settings_name_changed");
}

export function trackSettingsNotificationsToggled(
  type: "push" | "email",
  enabled: boolean
) {
  track("settings_notifications_toggled", { type, enabled });
}

export function trackAccountPictureUpdated() {
  track("account_picture_updated");
}

// Spotify

export function trackSpotifyConnected() {
  track("spotify_connected");
}

export function trackSpotifyPlaylistAdded() {
  track("spotify_playlist_added");
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
