import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    if (Platform.OS === "web") {
      try {
        return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn("SecureStore getToken error:", error);
      await SecureStore.deleteItemAsync(key).catch(() => {});
      return null;
    }
  },

  async saveToken(key: string, value: string) {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, value);
        }
      } catch {
        // Local storage might be blocked in some browser privacy modes
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn("SecureStore saveToken error:", error);
    }
  },

  async clearToken(key: string) {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
      } catch {
        // Ignore
      }
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn("SecureStore clearToken error:", error);
    }
  },
};
