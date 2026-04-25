import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppError } from "@/utils/error";

export async function saveData(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new AppError(error, "AsyncStorage: Error saving data to " + key);
  }
}

export async function getData(key: string) {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    new AppError(error, "AsyncStorage: Error getting data from " + key);
    return null;
  }
}

export async function removeData(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    throw new AppError(error, "AsyncStorage: Error removing data from " + key);
  }
}

export async function removeAllData() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    throw new AppError(error, "AsyncStorage: Error removing all data");
  }
}
