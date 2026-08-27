import AsyncStorage from "@react-native-async-storage/async-storage";

import { log } from "@/utils/logging";

export async function saveData(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));

}

export async function getData(key: string) {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    log(
      `AsyncStorage: Error getting data from ${key}: ${(error as any)?.message ?? error}`,
      "error"
    );
    return null;
  }
}

export async function removeData(key: string) {
  await AsyncStorage.removeItem(key);

}

export async function removeAllData() {
  await AsyncStorage.clear();

}
