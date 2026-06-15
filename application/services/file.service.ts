import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { baseUrl, endpoints } from '../apis/apis';
import { getAuthToken } from './auth.service';

// ================= AXIOS INSTANCE =================

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================= SHARE FILE CORE FUNCTION =================

const shareExcelFile = async (
  endpoint: string,
  fileName: string,
  params?: {
    employeeId?: number | string;
    startDate?: string;
    endDate?: string;
  }
) => {
  try {
    const token = await getAuthToken();

    // build query params
    let query = '';

    if (params) {
      const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');

      if (queryParams) query = `?${queryParams}`;
    }

    const downloadUrl = `${baseUrl}${endpoint}${query}`;

    // temporary local file
    const fileUri =
      FileSystem.documentDirectory +
      `${fileName}-${Date.now()}.xlsx`;

    // download file to cache
    const response = await FileSystem.downloadAsync(downloadUrl, fileUri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // check sharing support
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    // open share sheet (WhatsApp / Drive / Mail etc.)
    await Sharing.shareAsync(response.uri);

    return {
      success: true,
      path: response.uri,
      message: 'Share sheet opened successfully',
    };
  } catch (error: any) {
    console.log('Share Error:', error);

    throw new Error(error?.message || 'Sharing failed');
  }
};

// ================= ATTENDANCE =================

export const downloadAttendanceFile = async (params?: {
  employeeId?: number | string;
  startDate?: string;
  endDate?: string;
}) => {
  return shareExcelFile(
    endpoints.files.attendance,
    'attendance-report',
    params
  );
};

// ================= EXPENSES =================

export const downloadExpensesFile = async (params?: {
  employeeId?: number | string;
  startDate?: string;
  endDate?: string;
}) => {
  return shareExcelFile(
    endpoints.files.expenses,
    'expenses-report',
    params
  );
};