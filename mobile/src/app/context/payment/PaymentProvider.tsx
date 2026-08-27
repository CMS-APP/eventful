import Purchases, {
  CustomerInfo,
  PurchasesStoreProduct
} from "react-native-purchases";
import { useDispatch, useSelector } from "react-redux";

import React, { useCallback, useEffect, useState } from "react";

import { Alert } from "react-native";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/app/context/loading/LoadingModalContext";
import { PaymentContext } from "@/app/context/payment/PaymentContext";
import {
  checkIfPhotoBoothSubscription,
  checkIfPremiumSubscription
} from "@/app/context/payment/const";

import { UserState, setPhotoBooth, setPremium } from "../../../store/UserSlice";

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const email = useSelector((state: UserState) => state.email);
  const name = useSelector((state: UserState) => state.name);
  const userId = useSelector((state: UserState) => state.uid);
  const [user, setUser] = useState<CustomerInfo | null>(null);
  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { setLoading } = useLoadingModal() as ILoadingModalContext;
  const dispatch = useDispatch();

  const getProducts = useCallback(async () => {
    const products = await Purchases.getProducts([
      "premium_monthly_sub",
      "premium_yearly_sub",
      "photo_booth_monthly_subscription",
      "photo_booth_yearly_subscription"
    ]);

    products.sort((a, b) => a.price - b.price);

    const validProducts = products.filter((p) => p?.identifier);

    if (validProducts.length !== products.length) {
      throw new Error("Some products are missing identifiers");
    }

    setProducts(validProducts);
  }, []);

  const updateUserInfo = useCallback(
    async (customerInfo: CustomerInfo) => {
      setUser(customerInfo);

      if (customerInfo.activeSubscriptions.length > 0) {
        if (checkIfPhotoBoothSubscription(customerInfo)) {
          dispatch(setPhotoBooth(true));
        }
        if (checkIfPremiumSubscription(customerInfo)) {
          dispatch(setPremium(true));
          dispatch(setPhotoBooth(false));
        }
      } else {
        dispatch(setPhotoBooth(false));
        dispatch(setPremium(__DEV__));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (email && name) {
      Purchases.setEmail(email);
      Purchases.setDisplayName(name);
    }
  }, [email, name]);

  const init = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      await updateUserInfo(customerInfo);

      Purchases.addCustomerInfoUpdateListener((customerInfo) =>
        updateUserInfo(customerInfo)
      );
      getProducts();
      setIsReady(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [updateUserInfo, getProducts]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    init();
  }, [userId, init]);

  const restorePermissions = useCallback(async () => {
    setLoading(true);
    try {
      const customer = await Purchases.restorePurchases();
      await updateUserInfo(customer);

      if (customer.activeSubscriptions.length > 0) {
        Alert.alert(
          "Subscription Restored",
          "Your subscription has been restored"
        );
      } else {
        Alert.alert(
          "No active subscriptions",
          "You do not have any active subscriptions"
        );
      }
      return customer;
    } finally {
      setLoading(false);
    }
  }, [updateUserInfo, setLoading]);

  const purchasePackage = useCallback(
    async (pack: PurchasesStoreProduct, type: string): Promise<string> => {
      try {
        await Purchases.purchaseStoreProduct(pack);

        if (type === "photoBooth") {
          dispatch(setPhotoBooth(true));
          dispatch(setPremium(false));
        } else if (type === "premium") {
          dispatch(setPremium(true));
          dispatch(setPhotoBooth(false));
        }

        return "success";
      } catch (error) {
        if ((error as { code: string }).code === "1") {
          return "cancelled";
        } else {
          throw error;
        }
      }
    },
    [dispatch]
  );

  const value = {
    restorePermissions,
    user,
    products,
    purchasePackage,
    isReady
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}
