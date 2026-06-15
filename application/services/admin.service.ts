import axios from "axios";
import { baseUrl, endpoints } from "../apis/apis";
import { getAuthToken } from "./auth.service";

const adminApi = axios.create({
  baseURL: baseUrl,
});

adminApi.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Employees
export const getAllEmployeesAdmin = async () => {
  try {
    const res = await adminApi.get(endpoints.admin.getEmployees);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ✅ Attendance
export const getAllAttendanceAdmin = async () => {
  try {
    const res = await adminApi.get(endpoints.admin.getAttendance);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ✅ Expenses
export const getAdminExpenses = async (month: number, year: number) => {
  const res = await adminApi.get(endpoints.admin.getExpenses, { params: { month, year } });
  return res.data;
};

// ✅ Update Expense Status
export const updateExpenseStatus = async (expenseId: number, status: string) => {
  const res = await adminApi.patch(endpoints.admin.updateExpense(expenseId), { Status: status });
  return res.data;
};

// ✅ Update Attendance Status
export const updateAttendanceStatus = async (attendanceId: number, status: 'approved' | 'rejected' | 'pending') => {
  try {
    const res = await adminApi.put(endpoints.admin.updateAttendanceStatus(attendanceId), { Status: status });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ✅ Add Attendance by Admin
export const addAttendanceAdmin = async (payload: {
  EmployeeId: number;
  CheckInTime: string;
  CheckOutTime: string;
  Remarks: string;
  Address: string;
}) => {
  try {
    const res = await adminApi.post(endpoints.admin.addAttendance, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ✅ Checkout Attendance by Admin
export const checkOutAttendanceAdmin = async (attendanceId: number, checkOutTime: string) => {
  const res = await adminApi.patch(endpoints.admin.checkOutAttendance, {
    AttendanceId: attendanceId,
    CheckOutTime: checkOutTime,
  });
  return res.data;
};

// ✅ Dashboard Stats
export const getDashboardStats = async (month: number, year: number) => {
  const res = await adminApi.get(endpoints.admin.dashboardStats, { params: { month, year } });
  return res.data;
};

// ✅ Expense By Type (for chart)
export const getExpenseByType = async (month: number, year: number) => {
  const res = await adminApi.get(endpoints.admin.expenseByType, { params: { month, year } });
  return res.data;
};