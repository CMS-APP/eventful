import { CustomerInfo } from "react-native-purchases";

const PHOTO_BOOTH_PRODUCTS = {
  PHOTO_BOOTH_MONTHLY_IOS: "photo_booth_monthly_subscription",
  PHOTO_BOOTH_YEARLY_IOS: "photo_booth_yearly_subscription",
  PHOTO_BOOTH_MONTHLY_ANDROID:
    "photo_booth_monthly_subscription:photo-booth-monthly-subscription",
  PHOTO_BOOTH_YEARLY_ANDROID:
    "photo_booth_yearly_subscription:photo-booth-yearly-sub"
} as const;

const PREMIUM_PRODUCTS = {
  PREMIUM_MONTHLY_IOS: "premium_monthly_sub",
  PREMIUM_YEARLY_IOS: "premium_yearly_sub",
  PREMIUM_MONTHLY_ANDROID: "premium_monthly_sub:premium-monthly-sub",
  PREMIUM_YEARLY_ANDROID: "premium_yearly_sub:premium-yearly-sub"
} as const;

export const SubscriptionTypes = {
  ...PHOTO_BOOTH_PRODUCTS,
  ...PREMIUM_PRODUCTS
} as const;

export type SubscriptionType =
  (typeof SubscriptionTypes)[keyof typeof SubscriptionTypes];

export const PHOTO_BOOTH_SUBSCRIPTIONS = Object.values(PHOTO_BOOTH_PRODUCTS);

export const PREMIUM_SUBSCRIPTIONS = Object.values(PREMIUM_PRODUCTS);

export function hasActiveSubscription(
  customerInfo: CustomerInfo,
  subscriptionIds: string[]
): boolean {
  return subscriptionIds.some((id) =>
    customerInfo.activeSubscriptions.includes(id)
  );
}

export function checkIfPhotoBoothSubscription(customerInfo: CustomerInfo) {
  return hasActiveSubscription(customerInfo, PHOTO_BOOTH_SUBSCRIPTIONS);
}

export function checkIfPremiumSubscription(customerInfo: CustomerInfo) {
  return hasActiveSubscription(customerInfo, PREMIUM_SUBSCRIPTIONS);
}
