import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const TOKEN_KEYS = ["katokkalinis_token", "authToken"];

let cachedCustomUrl: string | null = null;

// Immediately initialize custom URL from storage if previously saved
AsyncStorage.getItem("@custom_backend_url").then((saved) => {
  if (saved && saved.trim()) {
    cachedCustomUrl = saved.trim();
  }
}).catch(() => {});

export function setRuntimeBackendUrl(url: string | null) {
  cachedCustomUrl = url;
}

export async function updateBackendServerUrl(newUrl: string): Promise<void> {
  cachedCustomUrl = newUrl.trim();
  await AsyncStorage.setItem("@custom_backend_url", newUrl.trim());
}

export async function resetBackendServerUrl(): Promise<void> {
  cachedCustomUrl = null;
  await AsyncStorage.removeItem("@custom_backend_url");
}

/*
|--------------------------------------------------------------------------
| BASE API URL RESOLUTION
|--------------------------------------------------------------------------
| Dynamically resolves the backend API URL:
| 1. Custom runtime override from AsyncStorage (@custom_backend_url)
| 2. Web browser: active window hostname (localhost or LAN IP)
| 3. Expo Metro bundler hostUri (auto-detects dev PC's IP on physical phones)
| 4. EXPO_PUBLIC_API_URL from .env
| 5. Default Development LAN IP fallback (192.168.18.174:8000)
|--------------------------------------------------------------------------
*/
export function getBaseApiUrl(): string {
  // 1. Check custom runtime override
  if (cachedCustomUrl && cachedCustomUrl.trim()) {
    return cachedCustomUrl.replace(/\/+$/, "");
  }

  // 2. Web browser: Always use active window hostname (localhost or LAN IP)
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname || "localhost";
    return `http://${host}:8000/api`;
  }

  // 3. Expo Metro bundler host (automatically detects dev PC's IP when running via Expo Go on physical device)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).experienceUrl;

  if (hostUri && typeof hostUri === "string") {
    const cleanHostUri = hostUri.replace(/^https?:\/\//, "").replace(/^exp:\/\//, "");
    const host = cleanHostUri.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:8000/api`;
    }
  }

  // 4. Custom env variable from .env (e.g. EXPO_PUBLIC_API_URL)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    // If running on native and envUrl is localhost/127.0.0.1, replace with active LAN IP
    if (Platform.OS !== "web" && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
      return envUrl.replace(/localhost|127\.0\.0\.1/, "192.168.254.103").replace(/\/+$/, "");
    }
    return envUrl.replace(/\/+$/, "");
  }

  // 5. Android Studio Emulator fallback (only if running inside emulator and no hostUri found)
  if (Platform.OS === "android" && !Constants.isDevice && Constants.deviceName?.toLowerCase().includes("emulator")) {
    return "http://10.0.2.2:8000/api";
  }

  // 6. Default Development LAN IP (active host PC IP)
  return "http://192.168.254.103:8000/api";
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