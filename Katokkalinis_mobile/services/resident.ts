import { apiRequest } from "./api";

export async function fetchBarangays() {
  return apiRequest("/barangays", { method: "GET" });
}

export async function fetchSchedules(barangayId?: number | string) {
  let url = "/schedules";
  if (barangayId) {
    url += `?barangay_id=${barangayId}`;
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

export async function submitReport(data: {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  barangay_id: number;
  image_url?: string;
}) {
  return apiRequest("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
