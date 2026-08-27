import { CustomerInfo, PurchasesStoreProduct } from "react-native-purchases";

import { createContext, useContext } from "react";

export interface PaymentContextType {
  restorePermissions: () => Promise<CustomerInfo>;
  user: CustomerInfo | null;
  products: PurchasesStoreProduct[];
  purchasePackage: (
    pack: PurchasesStoreProduct,
    type: string
  ) => Promise<string>;
  isReady: boolean;
}

export const PaymentContext = createContext<PaymentContextType | null>(null);

export function usePaymentProvider(): PaymentContextType {
  const ctx = useContext(PaymentContext);
  if (!ctx) {
    throw new Error("usePaymentProvider must be used within PaymentProvider");
  }
  return ctx;
}
