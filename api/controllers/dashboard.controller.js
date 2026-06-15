import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

// ─────────────────────────────────────────────
// 1. DASHBOARD STATS (month-wise)
// ─────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const { CompanyId } = req.user || {};
    const { month, year } = req.query;

    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();

    // Total active employees (not month-dependent)
    const empResult = await query(
      `SELECT COUNT(*) AS totalEmployees
       FROM Employees
       WHERE CompanyId = ? AND Role = 'employee' AND IsActive = 1`,
      [CompanyId]
    );

    // Expense aggregates for the month
    const expResult = await query(
      `SELECT
         COALESCE(SUM(Amount), 0) AS totalExpense,
         COALESCE(SUM(CASE WHEN Status = 'paid' THEN Amount ELSE 0 END), 0) AS totalWithdrawal,
         COALESCE(SUM(CASE WHEN Status != 'paid' and Status != 'rejected' THEN Amount ELSE 0 END), 0) AS pendingWithdrawal
       FROM Expenses
       WHERE CompanyId = ?
         AND MONTH(ExpenseDate) = ? 
         AND YEAR(ExpenseDate) = ?`, 
      [CompanyId, m, y]
    );

    const stats = {
      totalEmployees: empResult[0]?.totalEmployees || 0,
      totalExpense: expResult[0]?.totalExpense || 0,
      totalWithdrawal: expResult[0]?.totalWithdrawal || 0,
      pendingWithdrawal: expResult[0]?.pendingWithdrawal || 0,
    };

    return apiResponse({
      res,
      message: "Dashboard stats fetched successfully",
      data: stats,
      meta: { month: m, year: y },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch dashboard stats",
      error: err.message,
    });
  }
};

// ─────────────────────────────────────────────
// 2. EXPENSE BY TYPE (for pie chart)
// ─────────────────────────────────────────────
export const getExpenseByType = async (req, res) => {
  try {
    const { CompanyId } = req.user || {};
    const { month, year } = req.query;

    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();

    const data = await query(
      `SELECT
     e.Title AS name,
     COALESCE(SUM(e.Amount), 0) AS amount,
     COUNT(*) AS count
   FROM Expenses e
   WHERE e.CompanyId = ?
     AND MONTH(e.ExpenseDate) = ?
     AND YEAR(e.ExpenseDate) = ?
     AND e.Title IS NOT NULL
     AND e.Title != ''
   GROUP BY e.Title
   ORDER BY amount DESC`,
      [CompanyId, m, y]
    );

    return apiResponse({
      res,
      message: "Expense by type fetched successfully",
      data,
      meta: { month: m, year: y },
    });
  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch expense by type",
      error: err.message,
    });
  }
};
