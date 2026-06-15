import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import MonthNavigator from '@/components/common/MonthNavigator';
import StatCard from '@/components/common/StatCard';
import ExpenseCard, { ExpenseItem } from '@/components/Expense/ExpenseCard';
import { getAdminExpenses } from '@/services/admin.service';
import { Colors } from '@/constants/colors';

type StatusFilter = 'all' | 'pending' | 'approved' | 'paid' | 'rejected';

interface ApiExpense {
  ExpenseId: number;
  ExpenseDate: string;
  EmployeeId: number;
  EmployeeName: string;
  Title: string;
  Description: string;
  Amount: string;
  Status: 'approved' | 'pending' | 'rejected' | 'paid';
  ReceiptUrl?: string;
}

interface MetaCounts {
  total: number;
  pending: string;
  approved: string;
  paid: string;
  rejected: string;
}

interface DayGroup {
  key: string;
  date: Date;
  employeeId: number;
  employeeName: string;
  expenses: ExpenseItem[];
}

function groupExpenses(data: ApiExpense[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  data.forEach(exp => {
    const dateStr = exp.ExpenseDate.split('T')[0];
    const key = `${exp.EmployeeId}_${dateStr}`;
    if (!map.has(key)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      map.set(key, {
        key,
        date: new Date(Date.UTC(y, m - 1, d)),
        employeeId: exp.EmployeeId,
        employeeName: exp.EmployeeName,
        expenses: [],
      });
    }
    map.get(key)!.expenses.push({
      ExpenseId: exp.ExpenseId,
      ExpenseDate: exp.ExpenseDate,
      Title: exp.Title,
      Description: exp.Description,
      Amount: exp.Amount ?? '0',
      Status: exp.Status,
      ReceiptUrl: exp.ReceiptUrl,
    });
  });
  return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export default function AdminExpenseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [allGroups, setAllGroups] = useState<DayGroup[]>([]);
  const [counts, setCounts] = useState<MetaCounts>({ total: 0, pending: '0', approved: '0', paid: '0', rejected: '0' });
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async (month: number, year: number) => {
    try {
      setLoading(true);
      const res = await getAdminExpenses(month + 1, year);
      setAllGroups(groupExpenses(res.data ?? []));
      if (res.meta?.counts) setCounts(res.meta.counts);
    } catch {
      setAllGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchExpenses(viewMonth, viewYear); }, [viewMonth, viewYear]));

  const isFutureMonth = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isFutureMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const groups = useMemo(() => {
    if (filter === 'all') return allGroups;
    return allGroups
      .map(g => ({ ...g, expenses: g.expenses.filter(e => e.Status === filter) }))
      .filter(g => g.expenses.length > 0);
  }, [allGroups, filter]);

  const totalAmount = useMemo(() =>
    groups.reduce((s, g) => s + g.expenses.reduce((ss, e) => ss + parseFloat(e.Amount || '0'), 0), 0),
    [groups]);

  const uniqueEmployees = useMemo(() => new Set(groups.map(g => g.employeeId)).size, [groups]);

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
      <LoadingOverlay visible={loading} message="Loading Expenses..." />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Expenses</Text>
            <Text style={styles.headerSub}>All Employees</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* <View style={styles.empCountBadge}>
              <MaterialCommunityIcons name="account-group-outline" size={14} color={Colors.accent ?? '#6b7280'} />
              <Text style={styles.empCountText}>{uniqueEmployees} employees</Text>
            </View> */}
            <TouchableOpacity onPress={() => router.push('/add-expense' as any)} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6b6d71', '#4b5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                <Text style={styles.addText}>Add</Text>
                <Ionicons name="add" size={16} color="#fff" style={{ marginLeft: 2 }} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/download-expense' as any)} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6b6d71', '#4b5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                <Text style={styles.addText}>Share Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <MonthNavigator
          month={viewMonth}
          year={viewYear}
          onPrev={prevMonth}
          onNext={nextMonth}
          disableNext={isFutureMonth}
        />

        {/* Stat Cards */}
        {!loading && (
          <View style={styles.statsRow}>
            <StatCard label="Pending" count={parseInt(counts.pending) || 0} color="#f59e0b" icon="clock-outline" active={filter === 'pending'} onPress={() => setFilter(f => f === 'pending' ? 'all' : 'pending')} />
            <StatCard label="Approved" count={parseInt(counts.approved) || 0} color="#22c55e" icon="check-circle" active={filter === 'approved'} onPress={() => setFilter(f => f === 'approved' ? 'all' : 'approved')} />
            <StatCard label="Paid" count={parseInt(counts.paid) || 0} color="#3b82f6" icon="cash-check" active={filter === 'paid'} onPress={() => setFilter(f => f === 'paid' ? 'all' : 'paid')} />
            <StatCard label="All" count={counts.total || 0} color="#6366f1" icon="receipt" active={filter === 'all'} onPress={() => setFilter('all')} />
          </View>
        )}

        {/* Total amount summary */}
        {!loading && groups.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryValue}>{groups.reduce((s, g) => s + g.expenses.length, 0)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.listTitle}>{groups.length} Records</Text>

        {!loading && groups.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt-outline" size={40} color={Colors.whiteFaint ?? '#9ca3af'} />
            <Text style={styles.emptyText}>No expenses for this month</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {groups.map(g => (
              <ExpenseCard
                key={g.key}
                date={g.date}
                expenses={g.expenses}
                employeeName={g.employeeName}
                onStatusUpdated={() => fetchExpenses(viewMonth, viewYear)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 16,
  },
  headerTitle: { color: Colors.white ?? '#111827', fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: Colors.whiteMuted ?? 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 },
  empCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  empCountText: { color: Colors.accent ?? '#6b7280', fontSize: 11, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  addText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#6b7280', fontWeight: '500', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  summaryDivider: { width: 1, backgroundColor: '#f0f0f0', marginHorizontal: 8 },
  listTitle: {
    color: Colors.whiteMuted ?? 'rgba(255,255,255,0.55)',
    fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  list: { gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { color: Colors.whiteFaint ?? '#9ca3af', fontSize: 14 },
});
