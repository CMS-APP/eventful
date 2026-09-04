import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { getServiceAccountCredentials } from "@/lib/firebase-admin";

let client: BetaAnalyticsDataClient | undefined;

export function getGa4Client(): BetaAnalyticsDataClient | undefined {
  if (client) return client;

  const credentials = getServiceAccountCredentials();
  if (!credentials?.clientEmail || !credentials.privateKey) return undefined;

  client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.clientEmail,
      private_key: credentials.privateKey,
    },
  });
  return client;
}
