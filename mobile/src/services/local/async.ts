import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveData(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getData(key: string) {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export async function removeData(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function removeAllData() {
  await AsyncStorage.clear();
}
