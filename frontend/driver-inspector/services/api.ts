import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000/api";
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
  const url = `${API_URL}${endpoint}`;

  console.log("=================================");
  console.log("API REQUEST");
  console.log("URL:", url);
  console.log("METHOD:", options.method || "GET");
  console.log("=================================");

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
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

    console.log("API STATUS:", response.status);
    console.log("API RESPONSE:", text);

    let data: any = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "INVALID JSON FROM LARAVEL:",
          text
        );

        throw new Error(
          "Laravel returned an invalid response."
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | HTTP ERROR
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `API request failed with status ${response.status}.`
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