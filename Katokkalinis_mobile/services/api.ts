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

  // Detect IP from Expo Metro bundler
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:8000/api`;
    }
  }

  // Android Emulator
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }

  // Web Browser
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }

  // Default LAN fallback
  return envUrl ? envUrl.replace(/\/+$/, "") : "http://192.168.18.174:8000/api";
}

/**
 * Resolves a media path or URL to an absolute reachable URL on mobile devices.
 * Rewrites localhost/127.0.0.1 to the active LAN server IP and handles /storage paths.
 */
export function resolveMediaUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("data:image")) return pathOrUrl;

  const baseOrigin = getBaseApiUrl().replace(/\/api$/, "");

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    if (pathOrUrl.includes("localhost:8000") || pathOrUrl.includes("127.0.0.1:8000")) {
      return pathOrUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):8000/, baseOrigin);
    }
    return pathOrUrl;
  }

  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseOrigin}${cleanPath}`;
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