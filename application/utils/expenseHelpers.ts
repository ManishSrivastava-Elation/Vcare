// utils/expenseHelpers.ts
import { ExpenseItem, ExpenseStatus, DateFilter } from '../constants/expenseConstants';

export const getDateRangeForFilter = (filter: DateFilter): { start: Date | null, end: Date | null } => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const end = today;
  if (filter === 'all') return { start: null, end: null };
  if (filter === 'this_month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start, end };
  }
  if (filter === 'last_30_days') {
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    return { start, end };
  }
  if (filter === 'last_week') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start, end };
  }
  return { start: null, end: null };
};

export const generateMockExpenses = (): ExpenseItem[] => {
  const expenseTypes = [
    'Team Lunch', 'Taxi Fare', 'Office Supplies', 'Client Dinner',
    'Software License', 'Flight Ticket', 'Hotel Booking', 'Stationery',
    'Coffee Meeting', 'Conveyance', 'Internet Bill', 'Training Material'
  ];
  const statuses: ExpenseStatus[] = ['Pending', 'Approved', 'Rejected', 'Paid'];
  const expenses: ExpenseItem[] = [];
  const today = new Date();
  // Fixed day offsets so same dates repeat → multiple expenses per day
  const dayOffsets = [0, 0, 1, 1, 1, 2, 3, 3, 5, 5, 7, 8, 8, 8, 10, 12, 15, 15, 20, 25];
  dayOffsets.forEach((daysAgo, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);
    const type = expenseTypes[i % expenseTypes.length];
    const amount = parseFloat((50 + i * 37.5 + (i % 3) * 12.25).toFixed(2));
    const status = statuses[i % statuses.length];
    expenses.push({ id: `exp_${i}`, date, type, amount, description: `Description for ${type}`, status });
  });
  expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
  return expenses;
};

export const formatDate = (date: Date): string => {
  const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${date.getDate().toString().padStart(2,'0')} ${monthShort[date.getMonth()]} ${date.getFullYear()}`;
};