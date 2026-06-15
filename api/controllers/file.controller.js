import ExcelJS from "exceljs";
import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

// ==============================
// 📌 COMMON STATUS STYLE FUNCTION
// ==============================
const formatStatusCell = (cell, status) => {
  status = (status || "").toLowerCase();

  if (["approved"].includes(status)) {
    cell.font = { color: { argb: "008000" }, bold: true };
  }
  else if (["pending"].includes(status)) {
    cell.font = { color: { argb: "FFA500" }, bold: true };
  }
  else if (["rejected"].includes(status)) {
    cell.font = { color: { argb: "FF0000" }, bold: true };
  }
  else if (["paid"].includes(status)) {
    cell.font = { color: { argb: "0000FF" }, bold: true };
  }
};

function getUtcDatetimeFromIstDate(istDate, isEndOfDay = false) {
  // istDate format: '2026-05-21'
  let time = isEndOfDay ? '23:59:59.999' : '00:00:00.000';
  let istDateTimeStr = `${istDate} ${time}`;
  // Create Date object assuming IST (UTC+5:30)
  let istDateObj = new Date(istDateTimeStr + '+05:30');
  let utcIso = istDateObj.toISOString(); // '2026-05-20T18:30:00.000Z' for start, etc.
  // Convert to MySQL DATETIME format: 'YYYY-MM-DD HH:MM:SS'
  return utcIso.slice(0, 19).replace('T', ' ');
}

// ==============================
// 📌 ATTENDANCE EXCEL (filter by IST date)
// ==============================
export const getAttendanceFile = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    let sql = `
      SELECT
        a.AttendanceId,
        DATE_FORMAT(a.CheckInTime, '%d-%m-%Y %h:%i %p') AS CheckInTime,
        DATE_FORMAT(a.CheckOutTime, '%d-%m-%Y %h:%i %p') AS CheckOutTime,
        a.Remarks,
        a.DynamicAddress,
        a.AccuracyMeters,
        a.Address,
        a.Status,
        e.EmployeeCode,
        e.FullName AS EmployeeName,
        e.MobileNo
      FROM Attendance a
      INNER JOIN Employees e ON a.EmployeeId = e.EmployeeId
      WHERE 1=1
    `;
    const params = [];

    if (employeeId && employeeId !== "all") {
      sql += ` AND a.EmployeeId = ?`;
      params.push(employeeId);
    }

    // Date filter (IST date to UTC range)
    if (startDate) {
      const startUtc = getUtcDatetimeFromIstDate(startDate, false);
      sql += ` AND a.CheckInTime >= ?`;
      params.push(startUtc);
    }

    if (endDate) {
      const endUtc = getUtcDatetimeFromIstDate(endDate, true);
      sql += ` AND a.CheckInTime <= ?`;
      params.push(endUtc);
    }

    sql += ` ORDER BY a.AttendanceId DESC`;

    const data = await query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance Report");

    sheet.columns = [
      { header: "ID", key: "AttendanceId", width: 10 },
      { header: "Check In Time", key: "CheckInTime", width: 22 },
      { header: "Check Out Time", key: "CheckOutTime", width: 22 },
      { header: "Site Name", key: "Address", width: 22 },
      { header: "Dynamic Address", key: "DynamicAddress", width: 40 },
      { header: "Accuracy (m)", key: "AccuracyMeters", width: 15 },
      { header: "Status", key: "Status", width: 12 },
      { header: "Remarks", key: "Remarks", width: 25 },
      { header: "Emp Code", key: "EmployeeCode", width: 15 },
      { header: "Employee Name", key: "EmployeeName", width: 22 },
      { header: "Mobile No", key: "MobileNo", width: 15 },
    ];

    // Header Style
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2F5597" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    data.forEach((item) => {
      const row = sheet.addRow(item);
      row.alignment = { vertical: "middle" };
      const statusCell = row.getCell(7);
      formatStatusCell(statusCell, item.Status);
    });

    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: "A1", to: "K1" };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=attendance-report.xlsx");
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Excel generation failed",
      error: err.message,
    });
  }
};

// ==============================
// 📌 EXPENSES EXCEL (filter by IST date)
// ==============================
export const getExpensesFile = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    let sql = `
      SELECT
        e.ExpenseId,
        e.Title,
        e.Description,
        e.Amount,
        e.ExpenseDate,
        DATE_FORMAT(e.ExpenseDate, '%d-%m-%Y') AS FormattedExpenseDate,
        e.Status,
        emp.EmployeeCode,
        emp.FullName AS EmployeeName
      FROM Expenses e
      INNER JOIN Employees emp ON e.EmployeeId = emp.EmployeeId
      WHERE 1=1
    `;

    const params = [];

    // Employee Filter
    if (employeeId && employeeId !== "all") {
      sql += ` AND e.EmployeeId = ?`;
      params.push(employeeId);
    }

    // =========================
    // IST DATE FILTER
    // =========================

    if (startDate) {
      const startUtc = getUtcDatetimeFromIstDate(startDate, false);

      sql += ` AND e.ExpenseDate >= ?`;
      params.push(startUtc);
    }

    if (endDate) {
      const endUtc = getUtcDatetimeFromIstDate(endDate, true);

      sql += ` AND e.ExpenseDate <= ?`;
      params.push(endUtc);
    }

    sql += ` ORDER BY e.ExpenseId DESC`;

    console.log("SQL:", sql);
    console.log("PARAMS:", params);

    const data = await query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Expenses Report");

    sheet.columns = [
      { header: "ID", key: "ExpenseId", width: 10 },
      { header: "Title", key: "Title", width: 20 },
      { header: "Description", key: "Description", width: 35 },
      { header: "Amount (₹)", key: "Amount", width: 15 },
      { header: "Date", key: "FormattedExpenseDate", width: 22 },
      { header: "Status", key: "Status", width: 15 },
      { header: "Emp Code", key: "EmployeeCode", width: 15 },
      { header: "Employee Name", key: "EmployeeName", width: 22 },
    ];

    // Header Styling
    sheet.getRow(1).eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2F5597" },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Data Rows
    data.forEach((item) => {
      const row = sheet.addRow(item);

      row.alignment = {
        vertical: "middle",
      };

      // Amount Format
      row.getCell(4).numFmt = '"₹"#,##0.00';

      // Status Color
      const statusCell = row.getCell(6);
      formatStatusCell(statusCell, item.Status);
    });

    // Freeze Header
    sheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // Filter
    sheet.autoFilter = {
      from: "A1",
      to: "H1",
    };

    // Response Headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expenses-report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Excel generation failed",
      error: err.message,
    });

  }
};