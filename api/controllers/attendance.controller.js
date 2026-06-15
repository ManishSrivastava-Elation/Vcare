import { query } from "../utils/dbQuery.js";
import { apiResponse } from "../utils/response.js";

export const checkIn = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};

    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: [{ field: "Authorization", message: "Token must include EmployeeId and CompanyId" }],
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Check-in image is required",
        error: [{ field: "image", message: "Image file is required for check-in" }],
      });
    }

    const body = req.body;
    const checkInImageUrl = `/uploads/${req.file.filename}`;

    const values = [
      CompanyId,
      EmployeeId,
      body.CheckInTime ?? null,
      body.CheckInLatitude ?? null,
      body.CheckInLongitude ?? null,
      checkInImageUrl,
      body.IsWithinGeoFence ?? null,
      body.Remarks ?? null,
      body.DynamicAddress ?? null,
      body.LocationSource ?? null,
      body.AccuracyMeters ?? null,
      body.FaceVerified ?? null,
      body.ImageTimestamp ?? null,
      body.DeviceInfo ?? null,
      body.LocalId ?? null,
      body.Address ?? null,
    ];

    const sql = `
      INSERT INTO Attendance (
        CompanyId,
        EmployeeId,
        CheckInTime,
        CheckInLatitude,
        CheckInLongitude,
        CheckInSelfieUrl,
        IsWithinGeoFence,
        Remarks,
        DynamicAddress,
        LocationSource,
        AccuracyMeters,
        FaceVerified,
        ImageTimestamp,
        DeviceInfo,
        LocalId,
        Address
      )
      VALUES (${values.map(() => "?").join(", ")})
    `;

    const result = await query(sql, values);

    return apiResponse({
      res,
      statusCode: 201,
      message: "Check-in successful",
      data: { 
        AttendanceId: result.insertId,
        imageUrl: checkInImageUrl,
        fileName: req.file.filename,
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      statusCode: 500,
      success: false,
      message: "Failed to check-in",
      error: err.message,
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};
    const { attendanceId } = req.params;

    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: [{ field: "Authorization", message: "Token must include EmployeeId and CompanyId" }],
      });
    }

    if (!attendanceId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Attendance ID is required",
        error: [{ field: "attendanceId", message: "Attendance ID is required" }],
      });
    }

    // Verify the attendance belongs to the user
    const attendanceCheck = await query(
      "SELECT * FROM Attendance WHERE AttendanceId = ? AND EmployeeId = ? AND CompanyId = ?",
      [attendanceId, EmployeeId, CompanyId]
    );

    if (!attendanceCheck.length) {
      return apiResponse({
        res,
        success: false,
        statusCode: 404,
        message: "Attendance record not found or access denied",
        error: [{ field: "attendanceId", message: "Invalid attendance ID" }],
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      return apiResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Check-out image is required",
        error: [{ field: "image", message: "Image file is required for check-out" }],
      });
    }

    const body = req.body;
    const checkOutImageUrl = `/uploads/${req.file.filename}`;

    const updateFields = [];
    const values = [];

    // Add image URL
    updateFields.push("CheckOutSelfieUrl = ?");
    values.push(checkOutImageUrl);

    // Add other fields from body
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(body[key]);
      }
    });

    const sql = `UPDATE Attendance SET ${updateFields.join(", ")} WHERE AttendanceId = ?`;
    values.push(attendanceId);

    await query(sql, values);

    return apiResponse({
      res,
      message: "Check-out successful",
      data: { 
        AttendanceId: attendanceId,
        imageUrl: checkOutImageUrl,
        fileName: req.file.filename,
      },
    });

  } catch (err) {
    return apiResponse({
      res,
      statusCode: 500,
      success: false,
      message: "Failed to check-out",
      error: err.message,
    });
  }
};


export const getAttendance = async (req, res) => {
  try {
    const { EmployeeId, CompanyId } = req.user || {};

    if (!EmployeeId || !CompanyId) {
      return apiResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid token payload",
        error: [{ field: "Authorization", message: "Token must include EmployeeId and CompanyId" }],
      });
    }

    const { startDate, endDate } = req.query;

    let sql = `
      SELECT
        a.*,
        c.CompanyName,
        e.FullName AS EmployeeName,
        e.EmployeeCode,
        e.MobileNo
      FROM Attendance a
      INNER JOIN Companies c ON a.CompanyId = c.CompanyId
      INNER JOIN Employees e ON a.EmployeeId = e.EmployeeId
      WHERE a.EmployeeId = ? AND a.CompanyId = ?
    `;

    const params = [EmployeeId, CompanyId];

    if (startDate) {
      sql += " AND a.CheckInTime >= ?";
      params.push(startDate);
    }

    if (endDate) {
      sql += " AND a.CheckInTime <= ?";
      params.push(endDate);
    }

    sql += " ORDER BY a.AttendanceId DESC";

    const data = await query(sql, params);

    return apiResponse({
      res,
      message: "Attendance fetched successfully",
      data,
    });

  } catch (err) {
    return apiResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to fetch attendance",
      error: err.message,
    });
  }
};