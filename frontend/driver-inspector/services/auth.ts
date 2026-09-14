import { apiRequest } from "./api";

export type UserRole = "driver" | "inspector";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    console.log("=================================");
    console.log("LOGIN START");
    console.log("EMAIL:", email);
    console.log("PASSWORD PROVIDED:", password.length > 0);
    console.log("=================================");

    const data = await apiRequest("/login", {
      method: "POST",

      body: JSON.stringify({
        email: email.trim(),
        password: password,
      }),
    });

    console.log("LOGIN API DATA:", data);

    /*
    |--------------------------------------------------------------------------
    | Laravel rejected the login
    |--------------------------------------------------------------------------
    */

    if (!data || data.success !== true) {
      return {
        success: false,
        message:
          data?.message ||
          "Invalid email or password.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Make sure Laravel actually returned a user
    |--------------------------------------------------------------------------
    */

    if (!data.user) {
      return {
        success: false,
        message:
          "Login succeeded but no user information was returned.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Determine role
    |--------------------------------------------------------------------------
    */

    const roles = Array.isArray(data.user.roles)
      ? data.user.roles
      : [];

    const roleName =
      roles.length > 0
        ? roles[0]?.name
        : data.user.role;

    console.log("USER ROLE:", roleName);

    /*
    |--------------------------------------------------------------------------
    | Only Driver or Inspector can use this application
    |--------------------------------------------------------------------------
    */

    if (
      roleName !== "driver" &&
      roleName !== "inspector"
    ) {
      return {
        success: false,
        message:
          "This account is not registered as a Driver or Inspector.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Successful login
    |--------------------------------------------------------------------------
    */

    return {
      success: true,

      message:
        data.message ||
        "Login successful.",

      token: data.token,

      user: {
        id: Number(data.user.id),

        name:
          data.user.name ||
          "User",

        email:
          data.user.email ||
          email,

        role:
          roleName as UserRole,
      },
    };

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Cannot connect to the Laravel server.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

export async function forgotPassword(
  email: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const data = await apiRequest(
      "/forgot-password",
      {
        method: "POST",

        body: JSON.stringify({
          email: email.trim(),
        }),
      }
    );

    return {
      success:
        data?.success === true,

      message:
        data?.message ||
        "Unable to process password reset.",
    };

  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Cannot connect to the Laravel server.",
    };
  }
}