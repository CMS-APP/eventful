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
    description: period === "yearly" ? "16% off" : "",
    priceString:
      period === "monthly"
        ? `${product.pricePerMonthString} / month`
        : `${product.pricePerYearString} / year`,
    packageType: "subscription"
  };
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
