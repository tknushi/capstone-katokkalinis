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
