import { FirebaseAuthTypes, getIdToken } from "@react-native-firebase/auth";

const BASE_URL = "https://api.eventfulapp.com";

const ENDPOINTS = {
  appCheckToken: `${BASE_URL}/appCheckToken`,
  sendVerificationEmail: `${BASE_URL}/sendVerificationEmail`,
  incrementUserCount: `${BASE_URL}/incrementUserCount`,
  incrementEventCount: `${BASE_URL}/incrementEventCount`,
  userSearch: `${BASE_URL}/searchUsers`,
  searchPlaces: `${BASE_URL}/searchPlaces`,
  placeDetails: `${BASE_URL}/getPlaceDetails`
};

async function getAppCheckToken(user: FirebaseAuthTypes.User) {
  const idToken = await getIdToken(user, true);
  const appCheckRes = await fetch(ENDPOINTS.appCheckToken, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!appCheckRes.ok) {
    throw new Error("FirebaseBackend: Error getting App Check token");
  }

  const { token: appCheckToken } = await appCheckRes.json();
  return appCheckToken;
}

async function post(
  user: FirebaseAuthTypes.User,
  endpoint: string,
  body?: Record<string, unknown>,
  { throwOnError = true }: { throwOnError?: boolean } = {}
) {
  const appCheckToken = await getAppCheckToken(user);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Firebase-AppCheck": appCheckToken
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (throwOnError && !response.ok) {
    throw new Error(`FirebaseBackend: Request failed (${response.status})`);
  }

  return response;
}

export async function sendVerificationEmail(user: FirebaseAuthTypes.User) {
  return await post(
    user,
    ENDPOINTS.sendVerificationEmail,
    { email: user.email },
    { throwOnError: false }
  );

}

export async function incrementUserCount(user: FirebaseAuthTypes.User) {
  await post(user, ENDPOINTS.incrementUserCount);

}

export async function incrementEventCount(user: FirebaseAuthTypes.User) {
  await post(user, ENDPOINTS.incrementEventCount);

}

export async function userSearch(
  searchInput: string,
  user: FirebaseAuthTypes.User
) {
  const response = await post(user, ENDPOINTS.userSearch, { q: searchInput });
  const { hits } = await response.json();
  return hits;

}

export interface PlaceSuggestion {
  placeId: string | null;
  text: string | null;
  mainText: string | null;
  secondaryText: string | null;
}

export interface PlaceAddressComponent {
  longText: string | null;
  shortText: string | null;
  types: string[];
}

export interface PlaceDetailsResult {
  formattedAddress: string | null;
  addressComponents: PlaceAddressComponent[];
}

export async function searchPlaces(
  input: string,
  sessionToken: string,
  user: FirebaseAuthTypes.User
): Promise<PlaceSuggestion[]> {
  const response = await post(user, ENDPOINTS.searchPlaces, {
    input,
    sessionToken
  });
  const { suggestions } = await response.json();
  return suggestions;
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken: string,
  user: FirebaseAuthTypes.User
): Promise<PlaceDetailsResult> {
  const response = await post(user, ENDPOINTS.placeDetails, {
    placeId,
    sessionToken
  });
  return await response.json();
}
