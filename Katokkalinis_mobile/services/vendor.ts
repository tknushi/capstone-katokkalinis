import { apiRequest } from "./api";

export async function fetchVendorStatus() {
  // Since vendor details aren't stored in the token, we can get it from /me if implemented or by fetching vendors
  // Currently, the backend has /me. We need the vendor info.
  // Wait, let's just assume we can fetch the user's profile and vendor data
  return apiRequest("/me", { method: "GET" });
}

export interface VendorEvaluation {
  id: number | null;
  grade: string;
  total_score: number;
  hygiene_score: number;
  premises_score: number;
  pest_control_score: number;
  violations_count: number;
  notes: string;
  inspected_at: string;
  inspected_at_formatted: string;
  valid_through: string;
  inspector_name: string;
  status: string;
  decision: string;
  updated_at: string;
  has_pending_change?: boolean;
}

export async function fetchVendorEvaluation(vendorId?: number | string): Promise<{
  success: boolean;
  has_evaluation?: boolean;
  vendor_id?: number;
  evaluation?: VendorEvaluation;
  message?: string;
}> {
  try {
    const endpoint = vendorId ? `/vendor/evaluation?vendor_id=${encodeURIComponent(String(vendorId))}` : "/vendor/evaluation";
    const res = await apiRequest(endpoint, { method: "GET" });
    if (res && res.success && res.evaluation) {
      return res;
    }
  } catch (err) {
    // Fallback to public endpoint below
  }

  try {
    const url = vendorId ? `/public/vendor/evaluation/${vendorId}` : "/public/vendor/evaluation";
    const publicRes = await apiRequest(url, { method: "GET" });
    if (publicRes && publicRes.success && publicRes.evaluation) {
      return publicRes;
    }
  } catch (err: any) {
    console.warn("fetchVendorEvaluation fallback error:", err?.message || err);
  }

  return {
    success: false,
    message: "Unable to retrieve vendor evaluation.",
  };
}

export async function fetchViolations() {
  return apiRequest("/violations", { method: "GET" });
}

export async function fetchAttendance() {
  return apiRequest("/attendance", { method: "GET" });
}

