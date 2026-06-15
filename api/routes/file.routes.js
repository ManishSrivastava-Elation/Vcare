import express from "express";
import { getAttendanceFile, getExpensesFile } from "../controllers/file.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/attendence", authenticateToken, getAttendanceFile)
router.get("/expenses", authenticateToken, getExpensesFile)

export default router;