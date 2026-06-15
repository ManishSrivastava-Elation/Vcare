import { z } from "zod";

export const createAttendanceSchema = z.object({
  CheckInTime: z.string().trim().min(1, "CheckInTime is required"),
  CheckInLatitude: z.coerce.number(),
  CheckInLongitude: z.coerce.number(),
  CheckInSelfieUrl: z.string().trim().optional(),
  IsWithinGeoFence: z.string(),
  Remarks: z.string().trim().optional(),
  DynamicAddress: z.string().trim(),
  LocationSource: z.string().trim(),
  AccuracyMeters: z.coerce.number().nonnegative(),
  FaceVerified: z.string(),
  ImageTimestamp: z.string().trim(),
  DeviceInfo: z.string().trim().optional(),
  LocalId: z.string().trim(),
  Address: z.string().trim().optional(),
});

export const updateAttendanceSchema = z.object({
  CheckOutTime: z.string().trim().min(1, "CheckOutTime is required"),
  CheckOutLatitude: z.coerce.number(),
  CheckOutLongitude: z.coerce.number(),
  CheckOutSelfieUrl: z.string().trim().optional(),
  Remarks: z.string().trim().optional(),
  DynamicAddress: z.string().trim(),
  LocationSource: z.string().trim(),
  AccuracyMeters: z.coerce.number().nonnegative(),
  FaceVerified: z.string(),
  ImageTimestamp: z.string().trim(),
  DeviceInfo: z.string().trim().optional(),
  Address: z.string().trim().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
  path: [],
});


export const adminAddAttendanceSchema = z.object({
  EmployeeId: z
    .number()
    .min(1, "EmployeeId must be greater than 0")
    .max(999999999, "EmployeeId is too large"),

  CheckInTime: z
    .string()
    .trim()
    .min(3, "CheckInTime is required")
    .max(50, "CheckInTime is too long"),

  Remarks: z
    .string()
    .trim()
    .optional(),

  Address: z
    .string()
    .trim()
    .min(3, "Address must be at least 3 characters")
    .max(255, "Address cannot exceed 255 characters"),

  CheckOutTime: z
    .string()
    .trim()
    .optional(),
});