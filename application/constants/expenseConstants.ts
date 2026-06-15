// constants/expenseConstants.ts
import { Colors } from './colors';

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';
export type DateFilter = 'all' | 'this_month' | 'last_30_days' | 'last_week';
export type StatusFilter = 'All' | ExpenseStatus;

export const STATUS_CONFIG: Record<ExpenseStatus, { color: string; icon: string; label: string }> = {
  Pending:  { color: Colors.pending,  icon: 'clock-outline',     label: 'Pending'  },
  Approved: { color: Colors.approved, icon: 'check-circle',      label: 'Approved' },
  Rejected: { color: Colors.rejected, icon: 'close-circle',      label: 'Rejected' },
  Paid:     { color: Colors.paid,     icon: 'cash-multiple',     label: 'Paid'     },
};

export const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export interface ExpenseItem {
  id: string;
  date: Date;
  type: string;
  amount: number;
  description: string;
  status: ExpenseStatus;
  billFile?: { uri: string; name: string; type: string } | null;
}