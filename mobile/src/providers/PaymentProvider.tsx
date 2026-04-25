import Purchases, {
  CustomerInfo,
  PurchasesStoreProduct
} from "react-native-purchases";
import { useDispatch, useSelector } from "react-redux";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import { Alert } from "react-native";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/contexts/LoadingProviderContext";
import { AppError } from "@/utils/error";

import { ensurePurchasesConfigured } from "../services/purchases/purchasesConfig";
import { UserState, setPhotoBooth, setPremium } from "../store/UserSlice";

const PaymentContext = createContext<PaymentContextType | null>(null);

const PHOTO_BOOTH_SUBSCRIPTIONS = [
  "photo_booth_yearly_subscription",
  "photo_booth_monthly_subscription",
  "photo_booth_yearly_subscription:photo-booth-yearly-sub",
  "photo_booth_monthly_subscription:photo-booth-monthly-subscription"
];

const PREMIUM_SUBSCRIPTIONS = [
  "premium_monthly_sub",
  "premium_yearly_sub",
  "premium_monthly_sub:premium-monthly-sub",
  "premium_yearly_sub:premium-yearly-sub"
];

function hasActiveSubscription(
  customerInfo: CustomerInfo,
  subscriptionIds: string[]
): boolean {
  return subscriptionIds.some((id) =>
    customerInfo.activeSubscriptions.includes(id)
  );
}

function checkIfPhotoBoothSubscription(customerInfo: CustomerInfo) {
  return hasActiveSubscription(customerInfo, PHOTO_BOOTH_SUBSCRIPTIONS);
}

function checkIfPremiumSubscription(customerInfo: CustomerInfo) {
  return hasActiveSubscription(customerInfo, PREMIUM_SUBSCRIPTIONS);
}

export function usePaymentProvider() {
  return useContext(PaymentContext);
}

export interface PaymentContextType {
  restorePermissions: () => Promise<CustomerInfo>;
  user: CustomerInfo | null;
  products: PurchasesStoreProduct[];
  purchasePackage: (
    pack: PurchasesStoreProduct,
    type: string
  ) => Promise<string>;
}

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const email = useSelector((state: UserState) => state.email);
  const name = useSelector((state: UserState) => state.name);
  const [user, setUser] = useState<CustomerInfo | null>(null);
  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { setLoading } = useLoadingModal() as ILoadingModalContext;
  const dispatch = useDispatch();

  const getProducts = useCallback(async () => {
    try {
      const products = await Purchases.getProducts([
        "premium_monthly_sub",
        "premium_yearly_sub",
        "photo_booth_monthly_subscription",
        "photo_booth_yearly_subscription"
      ]);

      // Sort by price
      products.sort((a, b) => a.price - b.price);

      // Filter or validate products with identifiers
      const validProducts = products.filter((p) => p?.identifier);

      if (validProducts.length !== products.length) {
        throw new AppError(
          "Some products are missing identifiers",
          "Error getting subscriptions"
        );
      }

      // Proceed only with valid products
      setProducts(validProducts);
    } catch (error) {
      throw new AppError(error, "Error getting subscriptions");
    }
  }, []);

  const updateUserInfo = useCallback(
    async (customerInfo: CustomerInfo) => {
      try {
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
          dispatch(setPremium(false));
        }
      } catch (error) {
        throw new AppError(error, "Error updating user info");
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
      await ensurePurchasesConfigured();

      const customerInfo = await Purchases.getCustomerInfo();
      await updateUserInfo(customerInfo);

      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        updateUserInfo(customerInfo);
      });
      getProducts();
      setIsReady(true);
    } catch (error) {
      throw new AppError(error, "Error initialising payments");
    }
  }, [updateUserInfo, getProducts]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          throw new AppError(error, "Error purchasing package");
        }
      }
    },
    [dispatch]
  );

  if (!isReady) return <></>;

  const value = {
    restorePermissions,
    user,
    products,
    purchasePackage
  };

  return (
    <PaymentContext.Provider value={value as PaymentContextType}>
      {children}
    </PaymentContext.Provider>
  );
}
