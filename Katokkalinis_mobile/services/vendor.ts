import { apiRequest } from "./api";

export async function fetchVendorStatus() {
  // Since vendor details aren't stored in the token, we can get it from /me if implemented or by fetching vendors
  // Currently, the backend has /me. We need the vendor info.
  // Wait, let's just assume we can fetch the user's profile and vendor data
  return apiRequest("/me", { method: "GET" });
}

export async function fetchViolations() {
  return apiRequest("/violations", { method: "GET" });
}

export async function fetchAttendance() {
  return apiRequest("/attendance", { method: "GET" });
}
