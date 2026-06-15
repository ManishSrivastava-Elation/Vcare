import express from "express";
import { apiResponse } from "../utils/response.js";
import { adminAddAttendance, getAllAttendanceAdmin, getAllEmployeesAdmin, updateAttendanceStatus, adminAddExpense, adminCheckout } from "../controllers/admin.controller.js";
import { getDashboardStats, getExpenseByType } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import { validateZod } from "../middlewares/validateZod.js";
import { adminAddAttendanceSchema } from "../validators/attendance.schema.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Dashboard
router.get("/dashboard/stats", authenticateToken, getDashboardStats);
router.get("/dashboard/expense-by-type", authenticateToken, getExpenseByType);

router.get("/employees", authenticateToken, getAllEmployeesAdmin);
router.get("/attendance", authenticateToken, getAllAttendanceAdmin);
router.put("/attendance/:attendanceId/status", authenticateToken, updateAttendanceStatus);
router.post("/attendance/add", authenticateToken, validateZod(adminAddAttendanceSchema), adminAddAttendance);
router.patch("/attendance/checkout", authenticateToken, adminCheckout);
router.post("/expense/add", authenticateToken, upload.single("ReceiptUrl"), adminAddExpense);

export default router;