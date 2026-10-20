import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

const OFFLINE_REPORTS_QUEUE_KEY = "@offline_reports_queue";

export interface ReportPayload {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  barangay_id: number;
  image_url?: string;
  queued_at?: string;
}

export async function getOfflineReportsQueue(): Promise<ReportPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_REPORTS_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function queueOfflineReport(data: ReportPayload): Promise<void> {
  try {
    const queue = await getOfflineReportsQueue();
    queue.push({
      ...data,
      queued_at: new Date().toISOString(),
    });
    await AsyncStorage.setItem(OFFLINE_REPORTS_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn("Failed to queue report offline:", err);
  }
}

export async function flushOfflineReportsQueue(): Promise<{ sent: number; failed: number }> {
  try {
    const queue = await getOfflineReportsQueue();
    if (!queue || queue.length === 0) return { sent: 0, failed: 0 };

    const remaining: ReportPayload[] = [];
    let sentCount = 0;

    for (const report of queue) {
      try {
        const res = await apiRequest("/reports", {
          method: "POST",
          body: JSON.stringify(report),
        });
        if (res && res.success) {
          sentCount++;
        } else {
          remaining.push(report);
        }
      } catch {
        remaining.push(report);
      }
    }

    await AsyncStorage.setItem(OFFLINE_REPORTS_QUEUE_KEY, JSON.stringify(remaining));
    return { sent: sentCount, failed: remaining.length };
  } catch (e) {
    console.warn("Flush offline queue error:", e);
    return { sent: 0, failed: 0 };
  }
}

export async function fetchBarangays() {
  return apiRequest("/barangays", { method: "GET" });
}

export async function fetchSchedules(barangayId?: number | string, barangayName?: string) {
  let url = "/schedules";
  const params: string[] = [];
  if (barangayId) params.push(`barangay_id=${barangayId}`);
  if (barangayName) params.push(`barangay=${encodeURIComponent(barangayName)}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return apiRequest(url, { method: "GET" });
}

export async function fetchNextSchedule(barangayId?: number | string, barangayName?: string) {
  let url = "/schedules/next";
  const params: string[] = [];
  if (barangayId) params.push(`barangay_id=${barangayId}`);
  if (barangayName) params.push(`barangay=${encodeURIComponent(barangayName)}`);
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return apiRequest(url, { method: "GET" });
}

export async function completeSchedule(scheduleId: number) {
  return apiRequest(`/schedules/${scheduleId}/complete`, { method: "POST" });
}

export async function fetchReports(params?: { status?: string; search?: string; myReports?: boolean }) {
  let url = "/reports";
  const queryParts: string[] = [];
  if (params?.status && params.status !== "all") {
    queryParts.push(`status=${encodeURIComponent(params.status)}`);
  }
  if (params?.search) {
    queryParts.push(`search=${encodeURIComponent(params.search)}`);
  }
  if (params?.myReports) {
    queryParts.push(`my_reports=1`);
  }
  if (queryParts.length > 0) {
    url += `?${queryParts.join("&")}`;
  }
  return apiRequest(url, { method: "GET" });
}

export async function fetchMyReportsCount(userId?: number | string): Promise<number> {
  try {
    const res = await apiRequest("/reports?my_reports=1", { method: "GET" });
    if (res && res.success && Array.isArray(res.reports)) {
      return res.reports.length;
    }
    if (res && Array.isArray(res.reports)) {
      if (userId) {
        return res.reports.filter((r: any) => String(r.user_id) === String(userId)).length;
      }
      return res.reports.length;
    }
    return 0;
  } catch (e) {
    console.warn("Could not fetch my reports count from API:", e);
    return 0;
  }
}

export async function submitReport(data: ReportPayload) {
  try {
    const res = await apiRequest("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res && res.success) {
      // Auto-flush any previously queued reports now that connection is active
      flushOfflineReportsQueue().catch(() => {});
      return res;
    }
    // If not successful due to network/server issue, save to queue
    await queueOfflineReport(data);
    return {
      success: true,
      is_queued_offline: true,
      message: "Report saved locally and queued. It will automatically upload once network connection is stable.",
    };
  } catch (err) {
    await queueOfflineReport(data);
    return {
      success: true,
      is_queued_offline: true,
      message: "Network offline. Report saved locally and queued for automatic upload.",
    };
  }
}

export async function fetchFeedback() {
  return apiRequest("/feedback", { method: "GET" });
}

export async function submitFeedback(content: string) {
  return apiRequest("/feedback", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function fetchNotifications() {
  return apiRequest("/notifications", { method: "GET" });
}

export async function markNotificationAsRead(id: number) {
  return apiRequest(`/notifications/${id}/read`, { method: "PUT" });
}
