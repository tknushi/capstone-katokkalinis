import { apiRequest } from "./api";

export type UserRole = "resident" | "vendor" | "driver" | "inspector";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  roles?: { id?: number; name: string }[] | string[];
  avatar?: string | null;
  avatar_url?: string | null;
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
  password: string,
  expectedRole?: UserRole
): Promise<AuthResponse> {
  try {
    const data = await apiRequest("/login", {
      method: "POST",
      headers: {
        "X-Client-Platform": "mobile",
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
        device: "mobile",
      }),
    });

    if (!data || data.success === false) {
      let detailedMessage = data?.message || "Invalid email or password.";
      if (data?.errors && typeof data.errors === "object") {
        const errorList = Object.values(data.errors).flat();
        if (errorList.length > 0) {
          detailedMessage = errorList.join("\n");
        }
      }
      return {
        success: false,
        message: detailedMessage,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "Login succeeded but no user data was returned.",
      };
    }

    const roles = Array.isArray(data.user.roles) ? data.user.roles : [];
    let roleName: UserRole = "resident";

    if (roles.length > 0) {
      const firstRole = roles[0];
      roleName = (typeof firstRole === "string" ? firstRole : firstRole?.name) as UserRole;
    } else if (data.user.role) {
      roleName = data.user.role as UserRole;
    }

    // Validate expected role if supplied
    if (expectedRole && roleName !== expectedRole) {
      return {
        success: false,
        message: `This account does not have access to the ${expectedRole} portal.`,
      };
    }

    return {
      success: true,
      message: data.message || "Login successful.",
      token: data.token,
      user: {
        id: Number(data.user.id),
        name: data.user.name || "User",
        email: data.user.email || email,
        role: roleName,
        roles: roles,
        avatar: data.user.avatar || null,
        avatar_url: data.user.avatar_url || null,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Cannot connect to the server.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| REGISTER (Residents / Vendors)
|--------------------------------------------------------------------------
*/

export async function registerUser(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  role: UserRole = "resident",
  phone?: string,
  address?: string,
  barangayId?: number | null
): Promise<AuthResponse> {
  try {
    const data = await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role,
        phone,
        contact_number: phone,
        address,
        barangay: address,
        barangay_id: barangayId,
      }),
    });

    if (!data || data.success === false) {
      let detailedMessage = data?.message || "Registration failed.";
      if (data?.errors && typeof data.errors === "object") {
        const errorList = Object.values(data.errors).flat();
        if (errorList.length > 0) {
          detailedMessage = errorList.join("\n");
        }
      }
      return {
        success: false,
        message: detailedMessage,
      };
    }

    const roles = Array.isArray(data.user?.roles) ? data.user.roles : [];
    let roleName: UserRole = role;

    if (roles.length > 0) {
      const firstRole = roles[0];
      roleName = (typeof firstRole === "string" ? firstRole : firstRole?.name) as UserRole;
    } else if (data.user?.role) {
      roleName = data.user.role as UserRole;
    }

    return {
      success: true,
      message: data.message || "Registration successful.",
      token: data.token,
      user: {
        id: Number(data.user.id),
        name: data.user.name || name,
        email: data.user.email || email,
        role: roleName,
        roles: roles,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Registration connection failed.",
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
    const data = await apiRequest("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });

    return {
      success: data?.success === true,
      message: data?.message || "Unable to process password reset.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Cannot connect to the server.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| LOGOUT & SESSION INVALIDATION
|--------------------------------------------------------------------------
*/
export const AUTH_KEYS = [
  "katokkalinis_token",
  "authToken",
  "userRole",
  "userId",
  "userName",
  "userEmail",
  "userBarangay",
  "userContact",
  "selectedRole",
  "rememberMe",
  "userAvatar",
];

export async function logoutUser(router: any): Promise<void> {
  try {
    // 1. Notify backend to record attendance check-out and revoke token
    try {
      await apiRequest("/logout", {
        method: "POST",
        headers: {
          "X-Client-Platform": "mobile",
        },
      });
    } catch (apiErr) {
      console.warn("Backend logout attendance check-out notice:", apiErr);
    }

    // 2. Invalidate tokens and session keys from storage
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.multiRemove(AUTH_KEYS);

    // 3. Clear navigation stack and redirect to Welcome/Login
    if (router) {
      if (typeof router.dismissAll === "function") {
        try {
          router.dismissAll();
        } catch {
          // Ignore if no dismissable screens
        }
      }
      router.replace("/welcome" as any);
    }
  } catch (error) {
    console.error("Logout error:", error);
    if (router) {
      router.replace("/welcome" as any);
    }
  }
}