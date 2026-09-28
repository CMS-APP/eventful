import { PurchasesStoreProduct } from "react-native-purchases";

import { Platform } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/app/navigation";
import { Subscription } from "@/types/Subscription";
import { log } from "@/utils/logging";

import { SubscriptionTypes } from "./const";

function getSubscriptionProduct(
  products: PurchasesStoreProduct[],
  type: "photo_booth" | "premium",
  period: "monthly" | "yearly",
  platform: Platform["OS"]
): Subscription | null {
  const key = type + "_" + period + "_" + platform;
  const value =
    SubscriptionTypes[key.toUpperCase() as keyof typeof SubscriptionTypes];
  const product = products.find((p) => p.identifier === value);
  if (!product) {
    log("No product found: Payment Failed", "error");
    return null;
  }

  return {
    id: product.identifier,
    title: period === "monthly" ? "1 Month" : "1 Year",
    description: "",
    priceString:
      period === "monthly"
        ? `${product.pricePerMonthString} / month`
        : `${product.pricePerYearString} / year`,
    packageType: "subscription"
  };
}

function getYearlyDiscountDescription(
  products: PurchasesStoreProduct[],
  type: "photo_booth" | "premium",
  platform: Platform["OS"]
): string {
  const monthlyKey = (
    type +
    "_monthly_" +
    platform
  ).toUpperCase() as keyof typeof SubscriptionTypes;
  const yearlyKey = (
    type +
    "_yearly_" +
    platform
  ).toUpperCase() as keyof typeof SubscriptionTypes;
  const monthlyProduct = products.find(
    (p) => p.identifier === SubscriptionTypes[monthlyKey]
  );
  const yearlyProduct = products.find(
    (p) => p.identifier === SubscriptionTypes[yearlyKey]
  );
  if (!monthlyProduct?.pricePerYear || !yearlyProduct?.pricePerYear) {
    return "";
  }

  const discountPercent = Math.floor(
    (1 - yearlyProduct.pricePerYear / monthlyProduct.pricePerYear) * 100
  );
  return discountPercent > 0 ? `${discountPercent}% off` : "";
}

export function getPhotoBoothProducts(
  products: PurchasesStoreProduct[]
): Subscription[] {
  const monthly = getSubscriptionProduct(
    products,
    "photo_booth",
    "monthly",
    Platform.OS
  );
  const yearly = getSubscriptionProduct(
    products,
    "photo_booth",
    "yearly",
    Platform.OS
  );
  if (monthly && yearly) {
    yearly.description = getYearlyDiscountDescription(
      products,
      "photo_booth",
      Platform.OS
    );
    return [yearly, monthly];
  }
  return [];
}

export function getPremiumProducts(
  products: PurchasesStoreProduct[]
): Subscription[] {
  const monthly = getSubscriptionProduct(
    products,
    "premium",
    "monthly",
    Platform.OS
  );
  const yearly = getSubscriptionProduct(
    products,
    "premium",
    "yearly",
    Platform.OS
  );
  if (monthly && yearly) {
    yearly.description = getYearlyDiscountDescription(
      products,
      "premium",
      Platform.OS
    );
    return [yearly, monthly];
  }
  return [];
}

export async function subscribeToProduct(
  products: PurchasesStoreProduct[],
  selectedSubscription: Subscription,
  selectedSubscriptionType: string,
  purchasePackage: (
    product: PurchasesStoreProduct,
    type: string
  ) => Promise<string>,
  navigation: StackNavigationProp<AppStackParamList>
) {
  const selectedProduct = products.find(
    (product) => product.identifier === selectedSubscription.id
  );

  const subscriptionTypeMap: Record<string, string> = {
    "Photo Booth": "photoBooth",
    Premium: "premium"
  };
  const type = subscriptionTypeMap[selectedSubscriptionType] || "";

  if (!selectedProduct) {
    throw new Error("Selected product not found");
  }

  const result = await purchasePackage(selectedProduct, type);
  if (result !== "success") {
    if (result !== "cancelled") {
      throw new Error("Purchase error");
    }
    return;
  }

  navigation.navigate("Celebration", {
    type: type
  });
}
