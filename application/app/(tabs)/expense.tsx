import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import MonthNavigator from '@/components/common/MonthNavigator';
import StatCard from '@/components/common/StatCard';
import ExpenseCard, { ExpenseItem } from '@/components/Expense/ExpenseCard';
import AddExpenseModal from '@/components/Expense/AddExpenseModal';
import { getUserExpenses, createExpense } from '@/services/expense.service';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

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

export default function ExpenseScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [allGroups, setAllGroups] = useState<DayGroup[]>([]);
  const [counts, setCounts]       = useState<MetaCounts>({ total: 0, pending: '0', approved: '0', paid: '0', rejected: '0' });
  const [filter, setFilter]       = useState<StatusFilter>('pending');
  const [loading, setLoading]     = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchExpenses = async (month: number, year: number) => {
    try {
      setLoading(true);
      const res = await getUserExpenses(month + 1, year);
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

  const handleAddExpense = async (data: {
    type: string;
    description: string;
    amount: number;
    hasBill: boolean;
    billFile: { uri: string; name: string; type: string } | null;
  }) => {
    try {
      await createExpense({
        title: data.type,
        description: data.description,
        amount: data.amount,
        expenseDate: new Date().toISOString().split('T')[0],
        receiptFile: data.billFile,
      });
      Alert.alert('Success', 'Expense added successfully!');
      fetchExpenses(viewMonth, viewYear);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to add expense';
      Alert.alert('Error', msg);
    }
  };

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
            <Text style={styles.headerTitle}>My Expenses</Text>
            <Text style={styles.headerSub}>Your expense history</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
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
            <StatCard label="Pending"  count={parseInt(counts.pending)  || 0} color="#f59e0b" icon="clock-outline" active={filter === 'pending'}  onPress={() => setFilter(f => f === 'pending'  ? 'all' : 'pending')} />
            <StatCard label="Approved" count={parseInt(counts.approved) || 0} color="#22c55e" icon="check-circle"  active={filter === 'approved'} onPress={() => setFilter(f => f === 'approved' ? 'all' : 'approved')} />
            <StatCard label="Paid"     count={parseInt(counts.paid)     || 0} color="#3b82f6" icon="cash-check"    active={filter === 'paid'}     onPress={() => setFilter(f => f === 'paid'     ? 'all' : 'paid')} />
            <StatCard label="All"      count={counts.total              || 0} color="#6366f1" icon="receipt"       active={filter === 'all'}      onPress={() => setFilter('all')} />
          </View>
        )}

        {/* Summary */}
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
                readOnly
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AddExpenseModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddExpense={handleAddExpense}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { color: Colors.white ?? '#111827', fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: Colors.whiteMuted ?? 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 },
  addBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: '#4b5563',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#6b7280', fontWeight: '500', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  summaryDivider: { width: 1, backgroundColor: '#f0f0f0', marginHorizontal: 8 },
  listTitle: { color: Colors.whiteMuted ?? 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
  list: { gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { color: Colors.whiteFaint ?? '#9ca3af', fontSize: 14 },
});
