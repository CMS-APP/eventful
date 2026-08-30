import { PURCHASES_ERROR_CODE } from "react-native-purchases";

import { useCallback, useEffect, useMemo, useState } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  PaymentContextType,
  usePaymentProvider
} from "@/app/context/payment/PaymentContext";
import {
  getPhotoBoothProducts,
  getPremiumProducts,
  subscribeToProduct
} from "@/app/context/payment/payments";
import { AppStackParamList } from "@/app/navigation";
import { openSubscriptionManagement } from "@/app/update";
import { Screen } from "@/components/screen/Screen";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { TextButton } from "@/design-system/components/buttons/TextButton";
import { colors } from "@/design-system/tokens/colors";
import { Subscription } from "@/types/Subscription";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { AllStackParamList } from "../../app/navigation";
import { PaywallButtons } from "./PaywallButtons";
import { PaywallFeatures } from "./PaywallFeatures";
import { SubscriptionButton } from "./SubscriptionButton";

interface PaywallScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<AppStackParamList, "Paywall">;
}

export function PaywallScreen({ navigation, route }: PaywallScreenProps) {
  const type = route.params?.type || "Photo Booth";
  const [loading, setLoading] = useState(false);
  const { products, purchasePackage, user } =
    usePaymentProvider() as PaymentContextType;

  const hasActiveSubscription = (user?.activeSubscriptions?.length ?? 0) > 0;

  const [selectedSubscriptionType, setSelectedSubscriptionType] =
    useState("Photo Booth");

  const photo_booth_subscriptions = useMemo(
    () => getPhotoBoothProducts(products),
    [products]
  );
  const premium_subscriptions = useMemo(
    () => getPremiumProducts(products),
    [products]
  );

  const [selectedSubscription, setSelectedSubscription] = useState(
    photo_booth_subscriptions && photo_booth_subscriptions.length > 0
      ? photo_booth_subscriptions[0]
      : ({} as Subscription)
  );

  useEffect(() => {
    if (type === "Premium") {
      setSelectedSubscriptionType("Premium");
      if (premium_subscriptions && premium_subscriptions.length > 0) {
        setSelectedSubscription(premium_subscriptions[0]);
      }
    } else {
      setSelectedSubscriptionType("Photo Booth");
      if (photo_booth_subscriptions && photo_booth_subscriptions.length > 0) {
        setSelectedSubscription(photo_booth_subscriptions[0]);
      }
    }
  }, [type, premium_subscriptions, photo_booth_subscriptions]);

  const handleSubscribeToProduct = useCallback(async () => {
    if (!selectedSubscription?.id || products.length === 0 || loading) {
      return;
    }
    setLoading(true);
    try {
      await subscribeToProduct(
        products,
        selectedSubscription,
        selectedSubscriptionType,
        purchasePackage,
        navigation as StackNavigationProp<AppStackParamList>
      );
    } catch (error) {
      log(`Error Subscribing: ${error}`, "error");
      const errorCode = (error as { code?: string })?.code;
      if (errorCode === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
        showErrorToast("Purchases aren't allowed on this device or account");
      } else {
        showErrorToast("Error Subscribing");
      }
    } finally {
      setLoading(false);
    }
  }, [
    products,
    selectedSubscription,
    selectedSubscriptionType,
    purchasePackage,
    navigation,
    loading
  ]);

  return (
    <Screen
      headerConfig={{
        type: "flat",
        modal: true,
        flatHeaderProps: {
          title: "Subscriptions",
          dark: true,
          backAction: true,
          backgroundColor: colors.primary
        },
        backgroundColor: colors.primary
      }}
      contentConfig={{
        tabBarPresent: false
      }}
    >
      <View style={styles.container}>
        <View style={styles.headerBackground}>
          <SegmentedControl
            selections={["Photo Booth", "Premium"]}
            selectedButton={selectedSubscriptionType}
            setSelectedButton={setSelectedSubscriptionType}
            onChange={(selectedButton: string) => {
              if (selectedButton === "Photo Booth") {
                setSelectedSubscription(photo_booth_subscriptions[0]);
              } else if (selectedButton === "Premium") {
                setSelectedSubscription(premium_subscriptions[0]);
              }
            }}
          />

          <View style={styles.subscriptionContainer}>
            <View style={styles.subscriptionButtons}>
              {selectedSubscriptionType === "Photo Booth" &&
                photo_booth_subscriptions.map((subscription) => {
                  return (
                    <SubscriptionButton
                      key={subscription.id}
                      subscription={subscription}
                      selectedSubscription={selectedSubscription}
                      setSelectedSubscription={setSelectedSubscription}
                    />
                  );
                })}

              {selectedSubscriptionType === "Premium" &&
                premium_subscriptions.map((subscription) => {
                  return (
                    <SubscriptionButton
                      key={subscription.id}
                      subscription={subscription}
                      selectedSubscription={selectedSubscription}
                      setSelectedSubscription={setSelectedSubscription}
                    />
                  );
                })}
            </View>

            <PaywallButtons
              subscribeToProduct={handleSubscribeToProduct}
              isSubscribing={loading}
            />
          </View>
        </View>

        <PaywallFeatures selectedSubscriptionType={selectedSubscriptionType} />

        {hasActiveSubscription && (
          <TextButton
            text="Manage subscription"
            textColor={colors.primaryTint}
            textAlign="center"
            type="subHeader"
            onPress={openSubscriptionManagement}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1
  },
  headerBackground: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40
  },
  subscriptionButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginVertical: 12
  },
  subscriptionContainer: {
    paddingHorizontal: 24
  }
});
