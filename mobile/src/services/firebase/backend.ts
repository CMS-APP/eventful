import { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { getAppCheckToken } from "@/app/init/firebase";

const BASE_URL = "https://api.eventfulapp.com";

const ENDPOINTS = {
  sendVerificationEmail: `${BASE_URL}/sendVerificationEmail`,
  forgotPassword: `${BASE_URL}/forgotPassword`,
  incrementUserCount: `${BASE_URL}/incrementUserCount`,
  incrementEventCount: `${BASE_URL}/incrementEventCount`,
  userSearch: `${BASE_URL}/searchUsers`,
  locationSearch: `${BASE_URL}/locationSearch`
};

async function post(
  endpoint: string,
  body?: Record<string, unknown>,
  { throwOnError = true }: { throwOnError?: boolean } = {}
) {
  const appCheckToken = await getAppCheckToken();
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
    ENDPOINTS.sendVerificationEmail,
    { email: user.email },
    { throwOnError: false }
  );
}

export async function forgotPassword(email: string) {
  return await post(
    ENDPOINTS.forgotPassword,
    { email },
    { throwOnError: false }
  );
}

export async function incrementUserCount(_user: FirebaseAuthTypes.User) {
  await post(ENDPOINTS.incrementUserCount);
}

export async function incrementEventCount(_user: FirebaseAuthTypes.User) {
  await post(ENDPOINTS.incrementEventCount);
}

export async function userSearch(
  searchInput: string,
  _user: FirebaseAuthTypes.User
) {
  const response = await post(ENDPOINTS.userSearch, { q: searchInput });
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
  _user: FirebaseAuthTypes.User
): Promise<PlaceSuggestion[]> {
  const response = await post(ENDPOINTS.locationSearch, {
    action: "autocomplete",
    input,
    sessionToken
  });
  const { suggestions } = await response.json();
  return suggestions;
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken: string,
  _user: FirebaseAuthTypes.User
): Promise<PlaceDetailsResult> {
  const response = await post(ENDPOINTS.locationSearch, {
    action: "details",
    placeId,
    sessionToken
  });
  return await response.json();
}
