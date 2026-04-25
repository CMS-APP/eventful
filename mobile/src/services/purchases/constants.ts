/* eslint-disable @typescript-eslint/no-unused-vars */

export const SubscriptionTypes = {
  PHOTO_BOOTH_MONTHLY_ANDROID:
    "photo_booth_monthly_subscription:photo-booth-monthly-subscription",
  PHOTO_BOOTH_YEARLY_ANDROID:
    "photo_booth_yearly_subscription:photo-booth-yearly-sub",
  PREMIUM_MONTHLY_ANDROID: "premium_monthly_sub:premium-monthly-sub",
  PREMIUM_YEARLY_ANDROID: "premium_yearly_sub:premium-yearly-sub",
  PHOTO_BOOTH_MONTHLY_IOS: "photo_booth_monthly_subscription",
  PHOTO_BOOTH_YEARLY_IOS: "photo_booth_yearly_subscription",
  PREMIUM_MONTHLY_IOS: "premium_monthly_sub",
  PREMIUM_YEARLY_IOS: "premium_yearly_sub"
} as const;

export type SubscriptionType =
  (typeof SubscriptionTypes)[keyof typeof SubscriptionTypes];
