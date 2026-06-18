import Constants from "expo-constants";
import { Platform } from "react-native";

export function isPushNotificationsSupported(): boolean {
  if (Platform.OS === "web") {
    return false;
  }

  return Constants.appOwnership !== "expo";
}
