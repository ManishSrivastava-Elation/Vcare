type AttendanceStatus = "present" | "absent" | "na" | null;

export interface PunchRecord {
  site: string;
  checkIn: string;
  checkOut: string | null;
  detail?: string;
  remarks?: string;
  address?: string;
  dynamicAddress?: string;
  checkInTime?: string;
  checkOutTime?: string | null;
  checkInImg?: string;
  checkOutImg?: string;
  status?: 'approved' | 'rejected' | 'pending';
}

export interface DayAttendance {
  status: AttendanceStatus;
  punches: PunchRecord[];
}

export type { AttendanceStatus };

