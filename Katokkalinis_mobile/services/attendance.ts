import { apiRequest } from "./api";

export interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: "present" | "late" | "absent" | "on_leave";
  remarks?: string | null;
}

export interface CurrentAttendanceResponse {
  success: boolean;
  attendance: AttendanceRecord | null;
  is_checked_in: boolean;
  date?: string;
  server_time?: string;
}

/**
 * Retrieves the currently authenticated employee's attendance record for today.
 */
export async function getCurrentAttendance(): Promise<CurrentAttendanceResponse> {
  try {
    return await apiRequest("/attendance/current", {
      method: "GET",
    });
  } catch (error: any) {
    return {
      success: false,
      attendance: null,
      is_checked_in: false,
    };
  }
}

/**
 * Explicitly records a self check-in (Time-In) from mobile.
 */
export async function checkInSelf(remarks?: string): Promise<{ success: boolean; message: string; attendance?: AttendanceRecord }> {
  return apiRequest("/attendance/check-in", {
    method: "POST",
    headers: {
      "X-Client-Platform": "mobile",
    },
    body: JSON.stringify({
      remarks: remarks || "Self check-in via Mobile App",
    }),
  });
}

/**
 * Explicitly records a self check-out (Time-Out) from mobile.
 */
export async function checkOutSelf(remarks?: string): Promise<{ success: boolean; message: string; attendance?: AttendanceRecord }> {
  return apiRequest("/attendance/check-out", {
    method: "POST",
    headers: {
      "X-Client-Platform": "mobile",
    },
    body: JSON.stringify({
      remarks: remarks || "Self check-out via Mobile App",
    }),
  });
}
