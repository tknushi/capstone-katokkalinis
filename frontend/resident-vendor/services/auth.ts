import { apiRequest } from "./api";

export type UserRole = "resident" | "vendor";

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
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!data.success) {
    return {
      success: false,
      message: data.message || "Login failed.",
    };
  }

  const roles = data.user?.roles || [];

  const roleName = roles.length > 0
    ? roles[0].name
    : null;

  if (roleName !== "resident" && roleName !== "vendor") {
    return {
      success: false,
      message: "This account does not have a valid mobile app role.",
    };
  }

  return {
    success: true,
    message: data.message || "Login successful.",
    token: data.token,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: roleName,
    },
  };
}

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export async function registerUser(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  role: UserRole
): Promise<AuthResponse> {
  const data = await apiRequest("/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      role,
    }),
  });

  if (!data.success) {
    return {
      success: false,
      message: data.message || "Registration failed.",
    };
  }

  const roles = data.user?.roles || [];

  const roleName = roles.length > 0
    ? roles[0].name
    : role;

  return {
    success: true,
    message: data.message || "Registration successful.",
    token: data.token,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: roleName,
    },
  };
}

export async function forgotPassword(
  email: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const data = await apiRequest("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return {
      success: data.success === true,
      message:
        data.message ||
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
        "Cannot connect to the Laravel server.",
    };
  }
}