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