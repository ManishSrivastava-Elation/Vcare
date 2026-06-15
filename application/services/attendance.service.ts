import axios from "axios";
import { baseUrl, endpoints } from "../apis/apis";
import { getAuthToken } from "./auth.service";

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CheckInPayload {
  CheckInTime?: string;
  CheckInLatitude?: string;
  CheckInLongitude?: string;
  IsWithinGeoFence?: boolean;
  Remarks?: string;
  DynamicAddress?: string;
  LocationSource?: string;
  AccuracyMeters?: number;
  FaceVerified?: boolean;
  ImageTimestamp?: string;
  DeviceInfo?: string;
  LocalId?: string;
  Address?: string;
  checkInImage?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface CheckOutPayload {
  CheckOutTime: string;
  CheckOutLatitude?: string;
  CheckOutLongitude?: string;
  Remarks?: string;
  DynamicAddress?: string;
  LocationSource?: string;
  AccuracyMeters?: number;
  FaceVerified?: boolean;
  ImageTimestamp?: string;
  DeviceInfo?: string;
  Address?: string;
  checkOutImage?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface AttendanceApiRecord {
  AttendanceId: number;
  CompanyId: number;
  EmployeeId: number;
  CheckInTime: string | null;
  CheckOutTime: string | null;
  CheckInLatitude?: string;
  CheckInLongitude?: string;
  CheckOutLatitude?: string | null;
  CheckOutLongitude?: string | null;
  CheckInSelfieUrl?: string | null;
  CheckOutSelfieUrl?: string | null;
  IsWithinGeoFence: number | boolean;
  Remarks?: string;
  CreatedAt: string;
  DynamicAddress?: string;
  LocationSource?: string;
  AccuracyMeters?: string;
  FaceVerified?: number | boolean;
  ImageTimestamp?: string;
  DeviceInfo?: string;
  LocalId?: string;
  Address?: string;
  CompanyName?: string;
  EmployeeName?: string;
  EmployeeCode?: string;
  MobileNo?: string;
  Status: 'approved' | 'rejected' | 'pending';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  error: unknown;
  meta: unknown;
  timestamp: string;
}

// ✅ Check-In (FormData)
export const checkIn = async (body: CheckInPayload): Promise<ApiResponse> => {
  try {
    const formData = new FormData();

    formData.append("CheckInTime", body?.CheckInTime ?? "");
    formData.append("CheckInLatitude", body?.CheckInLatitude ?? "");
    formData.append("CheckInLongitude", body?.CheckInLongitude ?? "");

    // ✅ image (file)
    if (body?.checkInImage) {
      formData.append("CheckInSelfieUrl", {
        uri: body.checkInImage.uri,
        name: body.checkInImage.name,
        type: body.checkInImage.type,
      } as any);
    }

    formData.append("IsWithinGeoFence", body?.IsWithinGeoFence ? "1" : "0");
    formData.append("Remarks", body?.Remarks ?? "");
    formData.append("DynamicAddress", body?.DynamicAddress ?? "");
    formData.append("LocationSource", body?.LocationSource ?? "");
    formData.append("AccuracyMeters", body?.AccuracyMeters?.toString() ?? "0");
    formData.append("FaceVerified", body?.FaceVerified ? "1" : "0");
    formData.append("ImageTimestamp", body?.ImageTimestamp ?? "");
    formData.append("DeviceInfo", body?.DeviceInfo ?? "");
    formData.append("LocalId", body?.LocalId ?? "");
    formData.append("Address", body?.Address ?? "");

    const response = await api.post<ApiResponse>(
      endpoints.attendance.checkIn,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// ✅ Check-Out (FormData)
export const checkOut = async (
  attendanceId: string,
  body: CheckOutPayload,
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();

    formData.append("CheckOutTime", body?.CheckOutTime ?? "");
    formData.append("CheckOutLatitude", body?.CheckOutLatitude ?? "");
    formData.append("CheckOutLongitude", body?.CheckOutLongitude ?? "");

    // ✅ image (file)
    if (body?.checkOutImage) {
      formData.append("CheckOutSelfieUrl", {
        uri: body.checkOutImage.uri,
        name: body.checkOutImage.name,
        type: body.checkOutImage.type,
      } as any);
    }

    formData.append("Remarks", body?.Remarks ?? "");
    formData.append("DynamicAddress", body?.DynamicAddress ?? "");
    formData.append("LocationSource", body?.LocationSource ?? "");
    formData.append("AccuracyMeters", body?.AccuracyMeters?.toString() ?? "0");
    formData.append("FaceVerified", body?.FaceVerified ? "1" : "0");
    formData.append("ImageTimestamp", body?.ImageTimestamp ?? "");
    formData.append("DeviceInfo", body?.DeviceInfo ?? "");
    formData.append("Address", body?.Address ?? "");

    const url = `${endpoints.attendance.checkOut}/${attendanceId}`;
    const response = await api.put<ApiResponse>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// ✅ Get Attendance
export const getAttendance = async (params?: {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AttendanceApiRecord[]>> => {
  try {
    const response = await api.get<ApiResponse<AttendanceApiRecord[]>>(
      endpoints.attendance.getAttendance,
      { params },
    );
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};
