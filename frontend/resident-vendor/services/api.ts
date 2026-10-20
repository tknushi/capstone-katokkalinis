import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const LAN_IP = "192.168.18.174";
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "web"
    ? (typeof window !== "undefined" && window.location?.hostname ? `http://${window.location.hostname}:8000/api` : "http://localhost:8000/api")
    : `http://${LAN_IP}:8000/api`);
const TOKEN_KEY = "katokkalinis_token";

/*
|--------------------------------------------------------------------------
| API REQUEST
|--------------------------------------------------------------------------
*/

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",

          ...(token ? { Authorization: `Bearer ${token}` } : {}),

          ...(options.headers || {}),
        },
      }
    );

    const text = await response.text();

    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      console.log(
        "Laravel returned:",
        text
      );

      throw new Error(
        "Laravel returned an invalid response."
      );
    }

    return data;

  } catch (error) {
    console.error(
      "API REQUEST ERROR:",
      error
    );

    throw error;
  }
}