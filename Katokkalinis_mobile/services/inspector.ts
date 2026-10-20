import { apiRequest } from "./api";

export interface VendorItem {
  id: number;
  vendor_code: string;
  business_name: string;
  owner_name: string;
  market?: string;
  stall_number?: string;
  contact_number?: string;
  address?: string;
  qr_code?: string;
  status: "active" | "inactive" | "suspended";
  barangay?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  inspections?: InspectionItem[];
}

export interface InspectionItem {
  id: number;
  vendor_id: number;
  inspector_id: number;
  hygiene_system: number;
  condition_of_premises: number;
  total_score: number;
  compliance_level: number | string;
  notes?: string;
  status: "pending" | "in_progress" | "completed" | "reviewed";
  inspected_at?: string;
  created_at?: string;
  vendor?: VendorItem;
  inspector?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateInspectionPayload {
  vendor_id: number;
  inspection_id?: number;
  inspector_id?: number;
  hygiene_system: number;
  condition_of_premises: number;
  notes?: string;
  status?: string;
}

/*
|--------------------------------------------------------------------------
| INSPECTOR API SERVICES
|--------------------------------------------------------------------------
*/

export async function fetchVendors(search?: string): Promise<{ success: boolean; vendors: VendorItem[]; message?: string }> {
  try {
    const endpoint = search ? `/vendors?search=${encodeURIComponent(search)}` : "/vendors";
    const data = await apiRequest(endpoint, { method: "GET" });
    return {
      success: true,
      vendors: data.vendors || [],
    };
  } catch (error: any) {
    return {
      success: false,
      vendors: [],
      message: error?.message || "Failed to fetch vendors.",
    };
  }
}

export async function fetchVendorByCodeOrId(codeOrId: string | number): Promise<{ success: boolean; vendor?: VendorItem; message?: string }> {
  try {
    // 1. Try search query first
    const searchRes = await fetchVendors(String(codeOrId));
    if (searchRes.success && searchRes.vendors.length > 0) {
      // Look for exact match or first result
      const exactMatch = searchRes.vendors.find(
        (v) =>
          v.vendor_code?.toLowerCase() === String(codeOrId).toLowerCase() ||
          v.qr_code?.toLowerCase() === String(codeOrId).toLowerCase() ||
          String(v.id) === String(codeOrId)
      );
      return {
        success: true,
        vendor: exactMatch || searchRes.vendors[0],
      };
    }

    // 2. If not found via search and it's a numeric ID, try direct show
    if (!isNaN(Number(codeOrId))) {
      const showRes = await apiRequest(`/vendors/${codeOrId}`, { method: "GET" });
      if (showRes && showRes.vendor) {
        return {
          success: true,
          vendor: showRes.vendor,
        };
      }
    }

    return {
      success: false,
      message: `Vendor with code/ID "${codeOrId}" was not found.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to verify vendor.",
    };
  }
}

export async function fetchInspections(): Promise<{ success: boolean; inspections: InspectionItem[]; message?: string }> {
  try {
    const data = await apiRequest("/inspections", { method: "GET" });
    return {
      success: true,
      inspections: data.inspections || [],
    };
  } catch (error: any) {
    return {
      success: false,
      inspections: [],
      message: error?.message || "Failed to fetch inspections.",
    };
  }
}

export async function submitInspection(payload: CreateInspectionPayload): Promise<{
  success: boolean;
  is_pending_approval?: boolean;
  inspection?: InspectionItem;
  message?: string;
}> {
  try {
    const data = await apiRequest("/inspections", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      success: data.success ?? true,
      is_pending_approval: Boolean(data.is_pending_approval),
      inspection: data.inspection,
      message: data.message || "Inspection submitted successfully.",
    };
  } catch (error: any) {
    return {
      success: false,
      is_pending_approval: false,
      message: error?.message || "Failed to submit inspection.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| VERIFY VENDOR QR TOKEN (Inspector Verification)
|--------------------------------------------------------------------------
*/
export async function verifyVendorQrToken(codeOrToken: string): Promise<{
  success: boolean;
  vendor?: VendorItem;
  compliance?: {
    score: number;
    grade: string;
    grade_letter: string;
    status_label: string;
    flagged: boolean;
    inspections_count: number;
    violations_count: number;
  };
  recent_inspections?: InspectionItem[];
  recent_violations?: any[];
  error_type?: string;
  message?: string;
}> {
  try {
    const data = await apiRequest("/inspector/verify-vendor-qr", {
      method: "POST",
      body: JSON.stringify({ qr_code: codeOrToken }),
    });
    return data;
  } catch (error: any) {
    try {
      const publicData = await apiRequest("/public/inspector/verify-vendor-qr", {
        method: "POST",
        body: JSON.stringify({ qr_code: codeOrToken }),
      });
      return publicData;
    } catch {
      return {
        success: false,
        message: error?.message || "Failed to verify vendor QR code.",
      };
    }
  }
}

/*
|--------------------------------------------------------------------------
| RECORD SANITATION VIOLATION / PENALTY
|--------------------------------------------------------------------------
*/
export async function recordViolation(payload: {
  vendor_id: number;
  inspection_id?: number;
  violation_type: string;
  description: string;
  penalty?: string;
  corrective_action?: string;
}): Promise<{ success: boolean; message?: string; violation?: any }> {
  try {
    const res = await apiRequest("/violations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to record violation.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| INSPECTOR PROFILE REAL STATS (Requirement 3)
|--------------------------------------------------------------------------
*/
export interface InspectorStats {
  stalls_certified: number;
  total_inspections: number;
  pending_reviews: number;
  completed_today: number;
  recent_stalls: Array<{
    id: number;
    vendor_id: number;
    business_name: string;
    stall_number: string;
    market: string;
    score: number;
    grade: string;
    status: string;
    inspected_at: string;
  }>;
}

export async function fetchInspectorStats(): Promise<{
  success: boolean;
  stats?: InspectorStats;
  message?: string;
}> {
  try {
    const data = await apiRequest("/inspector/stats", { method: "GET" });
    return {
      success: true,
      stats: {
        stalls_certified: data.stalls_certified ?? 0,
        total_inspections: data.total_inspections ?? 0,
        pending_reviews: data.pending_reviews ?? 0,
        completed_today: data.completed_today ?? 0,
        recent_stalls: data.recent_stalls ?? [],
      },
    };
  } catch (error: any) {
    try {
      const publicData = await apiRequest("/public/inspector/stats", { method: "GET" });
      return {
        success: true,
        stats: {
          stalls_certified: publicData.stalls_certified ?? 0,
          total_inspections: publicData.total_inspections ?? 0,
          pending_reviews: publicData.pending_reviews ?? 0,
          completed_today: publicData.completed_today ?? 0,
          recent_stalls: publicData.recent_stalls ?? [],
        },
      };
    } catch {
      return {
        success: false,
        message: error?.message || "Failed to fetch inspector statistics.",
      };
    }
  }
}


