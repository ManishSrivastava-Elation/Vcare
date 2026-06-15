import { query } from "../utils/dbQuery.js";
import { hashPassword, comparePassword } from "../services/password.service.js";
import { generateToken } from "../services/jwt.service.js";
import { apiResponse } from "../utils/response.js";
import { validateUnique } from "../validators/custom.validators.js";

export const createEmployee = async (req, res) => {
  try {
    const { Email } = req.body;

    await validateUnique({
      table: "Employees",
      column: "Email",
      value: Email,
    });

    const role = req.body.Role || "employee";

    const sql = `
      INSERT INTO Employees
      (CompanyId, EmployeeCode, FullName, MobileNo, Email, PasswordHash, Role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      req.body.CompanyId,
      req.body.EmployeeCode,
      req.body.FullName,
      req.body.MobileNo,
      req.body.Email,
      await hashPassword(req.body.Password),
      role,
    ]);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Employee created successfully",
      data: {
        EmployeeId: result.insertId,
        Role: role,
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
      message: err.message || "Employee creation failed",
      error: err.message,
    });
  }
};


export const loginEmployee = async (req, res) => {
  try {
    const { MobileNo, Password } = req.body;    

    const users = await query(
      "SELECT * FROM Employees WHERE MobileNo = ?",  
      [MobileNo]
    );

    if (!users.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const isValid = await comparePassword(Password, user.PasswordHash);

    if (!isValid) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      EmployeeId: user.EmployeeId,
      CompanyId: user.CompanyId,
      MobileNo: user.MobileNo,  
      Role: user.Role 
    });

    return apiResponse({
      res,
      message: "Login successful",
      data: {
        token,
        employee: {
          EmployeeId: user.EmployeeId,
          FullName: user.FullName,
          MobileNo: user.MobileNo,
          Role: user.Role,
        },
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Login failed",
      error: err.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
      });
    }

    if (newPassword !== confirmPassword) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "New password and confirm password do not match",
      });
    }

    const users = await query(
      "SELECT PasswordHash FROM Employees WHERE EmployeeId = ? AND CompanyId = ?",
      [EmployeeId, CompanyId]
    );

    if (!users.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    const user = users[0];

    const hashedPassword = await hashPassword(newPassword);
    await query(
      "UPDATE Employees SET PasswordHash = ? WHERE EmployeeId = ? AND CompanyId = ?",
      [hashedPassword, EmployeeId, CompanyId]
    );

    return apiResponse({
      res,
      message: "Password updated successfully",
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to update password",
      error: err.message,
    });
  }
};