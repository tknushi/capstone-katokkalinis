import { apiRequest } from "./api";

export interface BarangayItem {
  id: number;
  number: number;
  name: string;
  code: string;
  city: string;
  latitude: number;
  longitude: number;
  route_number: number;
  route_name: string;
  assigned_truck: string;
  description?: string;
  today_collected_tons?: number;
  today_logs_count?: number;
}

export interface CollectionLogAuditItem {
  id: number;
  action: string;
  user?: { id: number; name: string; email: string };
  old_values?: any;
  new_values?: any;
  reason?: string;
  created_at: string;
}

export interface CollectionLogItem {
  id: number;
  driver_id: number;
  truck_id?: number;
  barangay_id?: number;
  barangay_name: string;
  amount_collected: number;
  unit: string;
  waste_type: string;
  notes?: string;
  idempotency_key: string;
  is_finalized: boolean;
  finalized_at?: string;
  server_timestamp: string;
  created_at: string;
  updated_at: string;
  driver?: { id: number; name: string; email: string };
  truck?: { id: number; truck_number: string; plate_number: string };
  audits?: CollectionLogAuditItem[];
}

export interface CreateCollectionLogPayload {
  amount_collected: number;
  unit?: string;
  barangay_name: string;
  barangay_id?: number;
  waste_type?: string;
  truck_id?: number;
  notes?: string;
}

export interface TypoCorrectionPayload {
  amount_collected?: number;
  waste_type?: string;
  notes?: string;
  barangay_name?: string;
  reason?: string;
}

/**
 * Generate a unique idempotency key (UUID v4) for network-safe concurrent submissions
 */
export function generateIdempotencyKey(): string {
  return "dlog-" + "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }) + "-" + Date.now();
}

/**
 * Fetch list of Barangays 1 through 40 with routes and GPS coordinates in Cagayan de Oro
 */
export async function getBarangays1to40(): Promise<BarangayItem[]> {
  try {
    const res = await apiRequest("/barangays/1-to-40");
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (err) {
    console.warn("Falling back to public barangays endpoint...", err);
    try {
      const pubRes = await apiRequest("/public/barangays/1-to-40");
      if (pubRes?.data && Array.isArray(pubRes.data)) {
        return pubRes.data;
      }
    } catch (e2) {
      console.error("Failed to load barangays from server", e2);
    }
  }

  // Local fallback if offline
  return Array.from({ length: 40 }, (_, i) => {
    const num = i + 1;
    const routeNum = Math.ceil(num / 10);
    return {
      id: num,
      number: num,
      name: `Barangay ${num}`,
      code: `CDO-BRGY-${num < 10 ? "0" + num : num}`,
      city: "Cagayan de Oro City",
      latitude: 8.4822 + (i % 5 - 2) * 0.003,
      longitude: 124.6472 + (Math.floor(i / 5) - 4) * 0.003,
      route_number: routeNum,
      route_name: `Route #${routeNum} (Barangay ${(routeNum - 1) * 10 + 1} - ${routeNum * 10})`,
      assigned_truck: `KAL-${100 + routeNum}`,
    };
  });
}

/**
 * Fetch actual collection logs for the authenticated driver
 */
export async function getDriverCollectionLogs(params?: {
  myLogsOnly?: boolean;
  isFinalized?: boolean;
  barangay?: string;
}): Promise<CollectionLogItem[]> {
  const queryParts: string[] = [];
  if (params?.myLogsOnly !== undefined) queryParts.push(`my_logs_only=${params.myLogsOnly ? 1 : 0}`);
  if (params?.isFinalized !== undefined) queryParts.push(`is_finalized=${params.isFinalized ? 1 : 0}`);
  if (params?.barangay) queryParts.push(`barangay=${encodeURIComponent(params.barangay)}`);

  const qs = queryParts.length ? `?${queryParts.join("&")}` : "";

  try {
    const res = await apiRequest(`/driver/collection-logs${qs}`);
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (e) {
    console.warn("Using public fallback for collection logs", e);
    const pubRes = await apiRequest(`/public/driver/collection-logs${qs}`);
    return pubRes?.data || [];
  }
}

/**
 * Submit an insert-only collection log with idempotency key
 */
export async function submitCollectionLog(
  payload: CreateCollectionLogPayload,
  idempotencyKey?: string
): Promise<{ success: boolean; data?: CollectionLogItem; message?: string }> {
  const key = idempotencyKey || generateIdempotencyKey();

  const body = {
    ...payload,
    idempotency_key: key,
  };

  const res = await apiRequest("/driver/collection-logs", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return res;
}

/**
 * Edit a typographical error before finalization
 */
export async function correctTypoCollectionLog(
  id: number,
  payload: TypoCorrectionPayload
): Promise<{ success: boolean; data?: CollectionLogItem; message?: string }> {
  const res = await apiRequest(`/driver/collection-logs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return res;
}

/**
 * Finalize and permanently lock a collection log
 */
export async function finalizeCollectionLog(
  id: number
): Promise<{ success: boolean; data?: CollectionLogItem; message?: string }> {
  const res = await apiRequest(`/driver/collection-logs/${id}/finalize`, {
    method: "POST",
  });

  return res;
}
