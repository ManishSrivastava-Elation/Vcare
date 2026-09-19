import { hashPassword } from "../services/password.service.js";
import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const AuthRole  = req.user.Role || "";

    if (AuthRole !== 'admin') {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Forbidden: Only admins can update status",
      });
    }

    // Check employee exists
    const employees = await query(
      `SELECT EmployeeId FROM Employees WHERE EmployeeId = ?`,
      [id]
    );

    if (!employees.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Employee not found",
      });
    }

    const {
      CompanyId,
      EmployeeCode,
      FullName,
      MobileNo,
      Email,
      Password,
      Role,
    } = req.body;

    // Check duplicate email except current employee
    const existingEmail = await query(
      `SELECT EmployeeId 
       FROM Employees 
       WHERE Email = ? AND EmployeeId != ?`,
      [Email, id]
    );

    if (existingEmail.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 409,
        message: "Email already exists",
      });
    }

    let sql;
    let params;

    if (Password) {
      sql = `
        UPDATE Employees
        SET
          CompanyId = ?,
          EmployeeCode = ?,
          FullName = ?,
          MobileNo = ?,
          Email = ?,
          PasswordHash = ?,
          Role = ?
        WHERE EmployeeId = ?
      `;

      params = [
        CompanyId,
        EmployeeCode,
        FullName,
        MobileNo,
        Email,
        await hashPassword(Password),
        Role || "employee",
        id,
      ];
    } else {
      sql = `
        UPDATE Employees
        SET
          CompanyId = ?,
          EmployeeCode = ?,
          FullName = ?,
          MobileNo = ?,
          Email = ?,
          Role = ?
        WHERE EmployeeId = ?
      `;

      params = [
        CompanyId,
        EmployeeCode,
        FullName,
        MobileNo,
        Email,
        Role || "employee",
        id,
      ];
    }

    await query(sql, params);

    return apiResponse({
      res,
      statusCode: 200,
      message: "Employee updated successfully",
      data: {
        EmployeeId: Number(id),
        Role: Role || "employee",
      },
    });

  } catch (err) {
    const statusCode = err.message?.includes("already exists")
      ? 409
      : err.code
      ? 400
      : 500;

    return apiResponse({
      res,
      success: false,
      statusCode,
      message: err.message || "Employee update failed",
      error: err.message,
    });
  }
};




export const restoreEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const AuthRole = req.user.Role || "";

    if (AuthRole !== "admin") {
      return apiResponse({
        res,
        success: false,
        statusCode: 403,
        message: "Forbidden: Only admins can restore employees",
      });
    }

    const employees = await query(
      `SELECT EmployeeId FROM Employees WHERE EmployeeId = ? AND Deleted = 1`,
      [id]
    );

    if (!employees.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Deleted employee not found",
      });
    }

    await query(
      `UPDATE Employees SET IsActive = 1, Deleted = 0 WHERE EmployeeId = ?`,
      [id]
    );

    return apiResponse({
      res,
      statusCode: 200,
      message: "Employee restored successfully",
      data: { EmployeeId: Number(id) },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: err.code ? 400 : 500,
      message: err.message || "Employee restore failed",
      error: err.message,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Check employee exists
    const employees = await query(
      `SELECT EmployeeId FROM Employees WHERE EmployeeId = ? AND Deleted = 0`,
      [id]
    );

    if (!employees.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Employee not found",
      });
    }

    await query(
      `UPDATE Employees
       SET IsActive = 0,
           Deleted = 1
       WHERE EmployeeId = ?`,
      [id]
    );

    return apiResponse({
      res,
      statusCode: 200,
      message: "Employee deleted successfully",
      data: {
        EmployeeId: Number(id),
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: err.code ? 400 : 500,
      message: err.message || "Employee deletion failed",
      error: err.message,
    });
  }
};