import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const createExpense = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};
    const { Title, Description, Amount } = req.body;

    if (!Title || !Amount) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Title and Amount are required" });
    }

    const ReceiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      `INSERT INTO Expenses (CompanyId, EmployeeId, Title, Description, Amount, ExpenseDate, ReceiptUrl)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`,
      [CompanyId, EmployeeId, Title, Description ?? null, Amount, ReceiptUrl]
    );

    return apiResponse({ res, statusCode: 201, message: "Expense added successfully", data: { ExpenseId: result.insertId, ReceiptUrl } });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to add expense", error: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { EmployeeId, CompanyId, Role } = req.user || {};
    const { month, year } = req.query;

    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();

    // 🔹 Base query
    let baseWhere = `
      FROM Expenses e
      WHERE e.CompanyId = ?
        AND MONTH(e.ExpenseDate) = ?
        AND YEAR(e.ExpenseDate) = ?
    `;

    const params = [CompanyId, m, y];

    if (Role === "employee") {
      baseWhere += " AND e.EmployeeId = ?";
      params.push(EmployeeId);
    }

    // 🔹 Get expense list
    const listSql = `
  SELECT
    e.ExpenseId,
    CONVERT_TZ(e.ExpenseDate, '+00:00', '+05:30') AS ExpenseDate,
    e.EmployeeId,
    e.Amount,
    e.ReceiptUrl,
    emp.FullName AS EmployeeName,
    e.Title,
    e.Description,
    e.Status
  FROM Expenses e
  INNER JOIN Employees emp ON e.EmployeeId = emp.EmployeeId
  WHERE e.CompanyId = ?
    AND MONTH(e.ExpenseDate) = ?
    AND YEAR(e.ExpenseDate) = ?
    ${Role === "employee" ? "AND e.EmployeeId = ?" : ""}
  ORDER BY e.ExpenseId DESC
`;

    const data = await query(listSql, params);

    // 🔹 Get counts (IMPORTANT)
    const countSql = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN e.Status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN e.Status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN e.Status = 'paid' THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN e.Status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      ${baseWhere}
    `;

    const countResult = await query(countSql, params);
    const counts = countResult[0];

    return apiResponse({
      res,
      message: "Expenses fetched successfully",
      data,
      meta: {
        counts,
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch expenses",
      error: err.message,
    });
  }
};

export const getExpenseTypes = async (req, res) => {
  try {
    const data = await query("SELECT id, name FROM expense_types WHERE status = 'active' ORDER BY name ASC");
    return apiResponse({ res, message: "Expense types fetched successfully", data });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to fetch expense types", error: err.message });
  }
};

export const updateExpenseStatus = async (req, res) => {
  try {
    const { Role, CompanyId } = req.user || {};
    const { expenseId } = req.params;
    const { Status } = req.body;

    if (Role !== "admin") {
      return apiResponse({ res, success: false, statusCode: 403, message: "Only admin can change expense status" });
    }

    const validStatuses = ["pending", "approved", "rejected", "paid"];
    if (!validStatuses.includes(Status)) {
      return apiResponse({ res, success: false, statusCode: 400, message: "Invalid status value" });
    }

    const existing = await query(
      "SELECT ExpenseId FROM Expenses WHERE ExpenseId = ? AND CompanyId = ?",
      [expenseId, CompanyId]
    );

    if (!existing.length) {
      return apiResponse({ res, success: false, statusCode: 404, message: "Expense not found" });
    }

    await query("UPDATE Expenses SET Status = ? WHERE ExpenseId = ?", [Status, expenseId]);

    return apiResponse({ res, message: "Expense status updated successfully" });
  } catch (err) {
    return apiResponse({ res, success: false, statusCode: 500, message: "Failed to update status", error: err.message });
  }
};
