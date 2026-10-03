import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const TOKEN_KEYS = ["katokkalinis_token", "authToken"];

/*
|--------------------------------------------------------------------------
| BASE API URL RESOLUTION
|--------------------------------------------------------------------------
| Dynamically resolves the backend API URL:
| 1. Expo env variable (EXPO_PUBLIC_API_URL)
| 2. Automatically derived IP from Metro bundler hostUri (e.g. 192.168.18.174)
| 3. Android emulator fallback (10.0.2.2)
| 4. Web hostname
|--------------------------------------------------------------------------
*/
export function getBaseApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/+$/, "");
  }

  // Detect IP from Expo Metro bundler / Expo Go host
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:8000/api`;
    }
  }

  // Fallback to detected LAN IP
  return "http://10.255.127.26:8000/api";
}

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/
export async function checkApiHealth(): Promise<{ ok: boolean; status?: string; url: string; error?: string }> {
  const baseUrl = getBaseApiUrl();
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const data = await response.json();
      return { ok: true, status: data.status || "ok", url: baseUrl };
    }
    return { ok: false, url: baseUrl, error: `HTTP ${response.status}` };
  } catch (err: any) {
    return { ok: false, url: baseUrl, error: err?.message || "Connection failed" };
  }
}

/*
|--------------------------------------------------------------------------
| API REQUEST CLIENT
|--------------------------------------------------------------------------
*/
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const baseUrl = getBaseApiUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const token =
      (await AsyncStorage.getItem(TOKEN_KEYS[0])) ||
      (await AsyncStorage.getItem(TOKEN_KEYS[1]));

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let data: any = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        console.warn(`[API] Non-JSON response from ${url}:`, text.slice(0, 100));
        throw new Error("Server returned an invalid non-JSON response.");
      }
    }

    if (!response.ok) {
      if (data) {
        if (data.success === undefined) {
          data.success = false;
        }
        return data;
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    return data || { success: response.ok };
  } catch (error: any) {
    console.warn(`[API ERROR] ${options.method || "GET"} ${url}:`, error?.message || error);
    throw error;
  }
}