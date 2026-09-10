// export const baseUrl = 'http://192.168.1.44:8001/api';
// export const baseImageUrl = 'http://192.168.1.44:8001';

export const baseUrl = "https://app.vcarelko.com/api";
export const baseImageUrl = "https://app.vcarelko.com";

export const endpoints = {
  auth: {
    createEmployee: `/auth/create`,
    login: `/auth/login`,
    updatePassword: `/auth/update-password`,
  },
  admin: {
    getEmployees: `/admin/employees`,
    getAttendance: `/admin/attendance`,
    updateAttendanceStatus: (id: number) => `/admin/attendance/${id}/status`,
    getExpenses: `/expense`,
    updateExpense: (id: number) => `/expense/${id}`,
    createExpense: `/expense`,
    expenseTypes: `/expense/types`,
    addAttendance: `/admin/attendance/add`,
    addExpense: `/admin/expense/add`,
    checkOutAttendance: `/admin/attendance/checkout`,
    dashboardStats: `/admin/dashboard/stats`,
    expenseByType: `/admin/dashboard/expense-by-type`, 
  },
  attendance: {
    checkIn: `/attendance/checkin`,
    checkOut: `/attendance/checkout`,
    getAttendance: `/attendance`,
  },
  files: {
  attendance: "/files/attendence",
  expenses: "/files/expenses",
}
};
