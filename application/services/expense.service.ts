import axios from 'axios';
import { baseUrl, endpoints } from '../apis/apis';
import { getAuthToken } from './auth.service';

const api = axios.create({ baseURL: baseUrl });

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Get User Expenses
export const getUserExpenses = async (month: number, year: number) => {
  const response = await api.get(endpoints.admin.getExpenses, { params: { month, year } });
  return response.data;
};

// ✅ Get Expense Types
export const getExpenseTypes = async () => {
  const response = await api.get(endpoints.admin.expenseTypes);
  return response.data;
};

// ✅ Add Expense by Admin
export const addExpenseAdmin = async (data: {
  employeeId: number;
  expenseType: string;
  description: string;
  amount: number;
  hasBill: boolean;
  billFile: { uri: string; name: string; type: string } | null;
}) => {
  const formData = new FormData();
  formData.append('employeeId', data.employeeId.toString());
  formData.append('expenseType', data.expenseType);
  formData.append('description', data.description);
  formData.append('amount', data.amount.toString());
  formData.append('hasBill', data.hasBill ? 'true' : 'false');
  if (data.hasBill && data.billFile) {
    const file = {
      uri: data.billFile.uri,
      name: data.billFile.name,
      type: data.billFile.type,
    };
    formData.append('ReceiptUrl', file as unknown as Blob);
  }
  const response = await api.post(endpoints.admin.addExpense, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createExpense = async (data: {
  title: string;
  description: string;
  amount: number;
  expenseDate: string;
  receiptFile?: { uri: string; name: string; type: string } | null;
}) => {
  const formData = new FormData();
  formData.append('Title', data.title);
  formData.append('Description', data.description);
  formData.append('Amount', data.amount.toString());
  formData.append('ExpenseDate', data.expenseDate);
  if (data.receiptFile) {
    formData.append('ReceiptUrl', {
      uri: data.receiptFile.uri,
      name: data.receiptFile.name,
      type: data.receiptFile.type,
    } as any);
  }
  const response = await api.post(endpoints.admin.createExpense, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
