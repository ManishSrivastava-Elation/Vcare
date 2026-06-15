import {
  AttendanceStatus,
  DayAttendance,
  PunchRecord,
} from "../constants/AttendanceStatusTypes";
import getFullImageUrl from "../services/image.service";
import { convertToIST, extractISTDateParts, extractTime } from "../utils/timeHelpers";

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
  Status?: 'approved' | 'rejected' | 'pending';
}

export function generateAttendance(
  year: number,
  month: number,
): Record<number, AttendanceStatus> {

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const lastDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const result: Record<number, AttendanceStatus> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    
    // Future days are null
    if (year > today.getFullYear() || 
       (year === today.getFullYear() && month > today.getMonth()) || 
       (year === today.getFullYear() && month === today.getMonth() && d > today.getDate())) {
      result[d] = null;
    } else {
      result[d] = "absent";
    }
  }
  return result;
}

export function toDateObj(year: number, month: number, day: number) {
  return new Date(year, month, day);
}

export function fmtTime(date: Date | string): string {
  return extractTime(date);
}

export function fmtDate(d: Date) {
  const monthShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d.getDate().toString().padStart(2, "0")} ${monthShort[d.getMonth()]} ${d.getFullYear()}`;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseAttendanceRecords(
  records: AttendanceApiRecord[],
): Record<string, DayAttendance> {
  const normalized: Record<string, DayAttendance> = {};

  records.forEach((record) => {
    const rawDate = record.CheckInTime || record.CreatedAt;
    if (!rawDate) return;

    const { year, month, day } = extractISTDateParts(rawDate);
    const key = `${year}-${month}-${day}`;
    const checkIn = record.CheckInTime
      ? extractTime(record.CheckInTime)
      : extractTime(rawDate);
    const checkOut = record.CheckOutTime
      ? extractTime(record.CheckOutTime)
      : null;
    const site =
      record.DynamicAddress || record.Address || record.CompanyName || "Office";

    const punch: PunchRecord = {
      site,
      checkIn,
      checkOut,
      detail:
        record.DynamicAddress ||
        record.Address ||
        record.CompanyName ||
        "Office",
      remarks: record.Remarks,
      address: record.Address,
      dynamicAddress: record.DynamicAddress,
      checkInTime: record.CheckInTime ?? undefined,
      checkOutTime: record.CheckOutTime,
      checkInImg: getFullImageUrl(record.CheckInSelfieUrl ?? undefined),
      checkOutImg: record.CheckOutSelfieUrl ? getFullImageUrl(record.CheckOutSelfieUrl) : undefined,
      status: record.Status,
    };

    if (!normalized[key]) {
      normalized[key] = { status: "present", punches: [punch] };
    } else {
      normalized[key].punches.push(punch);
    }
  });

  return normalized;
}

export function buildAttendanceStatusMap(
  year: number,
  month: number,
  records: AttendanceApiRecord[],
): Record<number, AttendanceStatus> {
  const statusMap = generateAttendance(year, month);
  const normalized = parseAttendanceRecords(records);

  Object.keys(normalized).forEach((key) => {
    const [y, m, d] = key.split("-").map(Number);
    if (y === year && m === month) {
      statusMap[d] = normalized[key].status;
    }
  });

  return statusMap;
}

export const STATUS_CFG = {
  present: { color: "#22C55E", icon: "check-circle", label: "Present" },
  absent: { color: "#EF4444", icon: "close-circle", label: "Absent" },
  na: { color: "#6B7280", icon: "minus-circle-outline", label: "N/A" },
} as const;
