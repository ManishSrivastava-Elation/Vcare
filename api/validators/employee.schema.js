import { z } from "zod";

export const updateEmployeeSchema = z.object({
  CompanyId: z.coerce.number().int().positive(),

  EmployeeCode: z.string()
    .trim()
    .min(2, "EmployeeCode must be at least 2 characters")
    .max(20, "EmployeeCode cannot be longer than 20 characters"),

  FullName: z.string()
    .trim()
    .min(3, "FullName must be at least 3 characters")
    .max(100, "FullName cannot be longer than 100 characters"),

  MobileNo: z.string()
    .trim()
    .regex(/^[0-9]{10}$/, "MobileNo must be a 10 digit number"),

  Email: z.string()
    .trim()
    .lowercase()
    .email("Invalid Email address"),

  Password: z.string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),

  Role: z.string()
    .trim()
    .optional()
    .default("employee"),
});