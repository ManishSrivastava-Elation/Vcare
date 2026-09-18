import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import {
  createExpense,
  getExpenses,
  updateExpenseStatus,
  getExpenseTypes,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", authenticateToken, upload.single("ReceiptUrl"), createExpense);
router.get("/", authenticateToken, getExpenses);
router.get("/types", getExpenseTypes);
router.put("/:expenseId", authenticateToken, upload.single("ReceiptUrl"), updateExpense);
router.patch("/:expenseId", authenticateToken, updateExpenseStatus);
router.delete("/:expenseId", authenticateToken, deleteExpense);

export default router;
