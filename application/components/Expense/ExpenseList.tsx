// components/Expense/ExpenseList.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { ExpenseStatus, STATUS_CONFIG, MONTH_SHORT } from '../../constants/expenseConstants';
import { formatDate } from '../../utils/expenseHelpers';

export interface ExpenseItem {
  id: string;
  date: Date;
  type: string;
  amount: number;
  description: string;
  status: ExpenseStatus;
}

interface ExpenseListProps {
  expenses: ExpenseItem[];
  statusFilter: ExpenseStatus | 'All';
  onClearFilter: () => void;
  emptyMessage?: string;
  emptySubMessage?: string;
}

interface GroupedExpense {
  date: Date;
  items: ExpenseItem[];
  totalAmount: number;
}

function DayExpenseCard({ group }: { group: GroupedExpense }) {
  const [expanded, setExpanded] = useState(false);
  const { date, items, totalAmount } = group;
  const hasMultiple = items.length > 1;
  const firstItem = items[0];
  const cfg = STATUS_CONFIG[firstItem.status];

  return (
    <View style={[styles.cardWrapper, { borderLeftColor: cfg.color }]}>
      {/* Main Row */}
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => hasMultiple && setExpanded(e => !e)}
        activeOpacity={hasMultiple ? 0.7 : 1}
      >
        <View style={[styles.dateBlock, { backgroundColor: cfg.color + '18' }]}>
          <Text style={[styles.dateBlockDay, { color: cfg.color }]}>{date.getDate()}</Text>
          <Text style={[styles.dateBlockMonth, { color: cfg.color + 'BB' }]}>
            {MONTH_SHORT[date.getMonth()]}
          </Text>
        </View>

        <View style={styles.listInfo}>
          <Text style={styles.expenseType} numberOfLines={1}>
            {hasMultiple ? `${items.length} Expenses` : firstItem.type}
          </Text>
          <Text style={styles.expenseDate}>{formatDate(date)}</Text>
          {!hasMultiple && firstItem.description ? (
            <Text style={styles.expenseDesc} numberOfLines={1}>{firstItem.description}</Text>
          ) : null}
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.amountText}>₹{totalAmount.toFixed(2)}</Text>
          {!hasMultiple ? (
            <View style={[styles.statusChip, { backgroundColor: cfg.color + '18' }]}>
              <MaterialCommunityIcons name={cfg.icon as any} size={11} color={cfg.color} />
              <Text style={[styles.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          ) : (
            <View style={styles.expandBadge}>
              <Text style={styles.expandText}>{items.length} items</Text>
              <MaterialCommunityIcons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={13}
                color={Colors.whiteFaint}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Items */}
      {expanded && items.map((item, i) => {
        const itemCfg = STATUS_CONFIG[item.status];
        return (
          <View key={item.id} style={styles.expandedRow}>
            <View style={styles.expandLine} />
            <View style={[styles.expandDot, { backgroundColor: itemCfg.color }]} />
            <View style={styles.expandInfo}>
              <Text style={styles.expandType}>{item.type}</Text>
              {item.description ? (
                <Text style={styles.expandDesc} numberOfLines={1}>{item.description}</Text>
              ) : null}
            </View>
            <View style={styles.expandRight}>
              <Text style={styles.expandAmount}>₹{item.amount.toFixed(2)}</Text>
              <View style={[styles.statusChip, { backgroundColor: itemCfg.color + '18' }]}>
                <MaterialCommunityIcons name={itemCfg.icon as any} size={10} color={itemCfg.color} />
                <Text style={[styles.statusChipText, { color: itemCfg.color, fontSize: 9 }]}>
                  {itemCfg.label}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function ExpenseList({
  expenses,
  statusFilter,
  onClearFilter,
  emptyMessage = 'No expenses found',
  emptySubMessage = 'Try changing date or status filter',
}: ExpenseListProps) {
  const groupedExpenses = useMemo(() => {
    const map = new Map<string, GroupedExpense>();
    expenses.forEach(exp => {
      const key = exp.date.toDateString();
      if (!map.has(key)) {
        map.set(key, { date: exp.date, items: [], totalAmount: 0 });
      }
      const group = map.get(key)!;
      group.items.push(exp);
      group.totalAmount += exp.amount;
    });
    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses]);

  if (groupedExpenses.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="receipt-outline" size={44} color={Colors.whiteFaint} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <Text style={styles.emptySub}>{emptySubMessage}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recent transactions</Text>
        {statusFilter !== 'All' && (
          <TouchableOpacity onPress={onClearFilter} style={styles.clearFilterBtn}>
            <Ionicons name="close-circle" size={14} color={Colors.accent} />
            <Text style={styles.clearFilterText}>Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.listSection}>
        {groupedExpenses.map((group, idx) => (
          <DayExpenseCard key={idx} group={group} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    color: Colors.whiteMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  clearFilterText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  listSection: { gap: 12 },
  cardWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderLeftWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  dateBlock: {
    width: 50,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBlockDay: { fontSize: 20, fontWeight: '800' },
  dateBlockMonth: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  listInfo: { flex: 1 },
  expenseType: { color: '#111827', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  expenseDate: { color: '#9ca3af', fontSize: 11 },
  expenseDesc: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  rightSection: { alignItems: 'flex-end', gap: 6 },
  amountText: { color: '#111827', fontSize: 16, fontWeight: '800' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusChipText: { fontSize: 10, fontWeight: '700' },
  expandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  expandText: { fontSize: 10, fontWeight: '600', color: Colors.whiteFaint },
  // Expanded rows
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
    gap: 10,
  },
  expandLine: {
    position: 'absolute',
    left: 22,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  expandDot: { width: 8, height: 8, borderRadius: 4, zIndex: 1 },
  expandInfo: { flex: 1 },
  expandType: { color: '#111827', fontSize: 13, fontWeight: '700' },
  expandDesc: { color: '#6b7280', fontSize: 11, marginTop: 1 },
  expandRight: { alignItems: 'flex-end', gap: 4 },
  expandAmount: { color: '#111827', fontSize: 14, fontWeight: '800' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    color: Colors.whiteMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    color: Colors.whiteFaint,
    fontSize: 12,
  },
});
