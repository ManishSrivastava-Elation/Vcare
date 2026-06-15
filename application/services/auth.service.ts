import axios from "axios";
import { baseUrl, endpoints } from "../apis/apis";
import { getData, removeData, storeData } from "../utils/asyncStorage";

export const AUTH_STORAGE_KEY = "authData";

const authApi = axios.create({
  baseURL: baseUrl,
});

export type Employee = {
  EmployeeId: number;
  FullName: string;
  MobileNo: string;
  Role: string;
};

export type AuthData = {
  token: string;
  user: Employee;
};

export type AuthCredentials = {
  mobileNo: string; 
  password: string;
};


// ✅ Create Employee
export const createEmployee = async (payload: {
  CompanyId: number;
  EmployeeCode: string;
  FullName: string;
  MobileNo: string;
  Email: string;
  Password: string;
}) => {
  const res = await authApi.post(endpoints.auth.createEmployee, payload);
  return res.data;
};


export const login = async (body: AuthCredentials): Promise<AuthData> => {
  try {
    const requestBody = {
      MobileNo: body.mobileNo,
      Password: body.password,
    };
    const response = await authApi.post(endpoints.auth.login, requestBody);

    const data = response.data ?? {};
    const token = data?.data?.token ?? data?.token ?? data?.accessToken;
    const user: Employee = data?.data?.employee;

    if (!token) throw new Error('Login response did not include a token');
    if (!user) throw new Error('Login response did not include employee data');

    const authData: AuthData = { token, user };
    await storeData(AUTH_STORAGE_KEY, authData);
    return authData;
  } catch (error: any) {
    console.log('LOGIN ERROR:', JSON.stringify({
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
    }, null, 2));
    throw error;
  }
};

export const getStoredAuthData = async (): Promise<AuthData | null> => {
  try {
    const raw = await getData(AUTH_STORAGE_KEY);
    return raw ? (raw as AuthData) : null;
  } catch (error) {
    console.error("Get stored auth data error:", error);
    return null;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  const authData = await getStoredAuthData();
  return authData?.token ?? null;
};

export const updatePassword = async (newPassword: string, confirmPassword: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  await authApi.put(
    endpoints.auth.updatePassword,
    { newPassword, confirmPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const clearStoredAuthData = async (): Promise<void> => {
  try {
    await removeData(AUTH_STORAGE_KEY);
    await removeData('userInfo');
    await removeData('userToken');
  } catch (error) {
    console.error("Clear stored auth data error:", error);
  }
};
