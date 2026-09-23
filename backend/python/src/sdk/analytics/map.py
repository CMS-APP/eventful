FEATURE_DOMAINS = [
    {
        "id": "auth",
        "label": "Auth",
        "events": ["auth_sign_in", "auth_sign_out", "auth_account_deleted"],
    },
    {
        "id": "events",
        "label": "Events",
        "events": [
            "event_created",
            "event_updated",
            "event_list_item_added",
            "event_budget_item_added",
            "event_location_searched",
            "event_location_selected",
            "event_timeline_item_toggled",
            "event_amazon_link_opened",
        ],
    },
    {
        "id": "invites",
        "label": "Invites & Guests",
        "events": ["invite_sent", "invite_response_changed", "invite_link_copied"],
    },
    {
        "id": "contacts",
        "label": "Contacts",
        "events": ["contacts_search_performed", "user_followed"],
    },
    {
        "id": "photo_booth",
        "label": "Photo Booth",
        "events": [
            "photo_booth_session_started",
            "photo_booth_photo_shared",
            "photo_booth_photo_saved",
            "photo_booth_photos_uploaded",
            "photo_booth_locked",
            "photo_booth_customised",
        ],
    },
    {
        "id": "inspiration",
        "label": "Inspiration",
        "events": ["post_liked", "poll_voted"],
    },
    {
        "id": "settings_account",
        "label": "Settings & Account",
        "events": [
            "settings_name_changed",
            "settings_notifications_toggled",
            "account_picture_updated",
        ],
    },
    {
        "id": "spotify",
        "label": "Spotify",
        "events": ["spotify_connected", "spotify_playlist_added"],
    },
]

FUNNELS = {
    "onboarding": [
        {"id": "downloads", "label": "Downloads", "event": "first_open"},
        {
            "id": "welcome_viewed",
            "label": "Welcome screen viewed",
            "event": "screen_view",
            "screen_name": "Welcome",
        },
        {"id": "signup", "label": "Signup", "event": "auth_sign_up"},
        {
            "id": "onboarding_started",
            "label": "Onboarding started",
            "event": "onboarding_started",
        },
        {
            "id": "onboarding_completed",
            "label": "Onboarding completed",
            "event": "onboarding_completed",
        },
    ],
    "paywall": [
        {
            "id": "paywall_viewed",
            "label": "Paywall viewed",
            "event": "screen_view",
            "screen_name": "Paywall",
        },
        {
            "id": "subscribe_clicked",
            "label": "Subscribe button clicked",
            "event": "subscribe_button_clicked",
        },
        {
            "id": "purchased",
            "label": "Purchase completed",
            "event": "subscription_purchased",
        },
    ],
}
