// components/Expense/ExpenseListItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { STATUS_CONFIG, MONTH_SHORT } from '../../constants/expenseConstants';
import { formatDate } from '../../utils/expenseHelpers';

interface ExpenseListItemProps {
  id: string;
  date: Date;
  type: string;
  amount: number;
  description?: string;
  status: keyof typeof STATUS_CONFIG;
}

export default function ExpenseListItem({ date, type, amount, description, status }: ExpenseListItemProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.listItem, { borderLeftColor: cfg.color }]}>
      <View style={[styles.dateBlock, { backgroundColor: cfg.color + '18' }]}>
        <Text style={[styles.dateBlockDay, { color: cfg.color }]}>{date.getDate()}</Text>
        <Text style={[styles.dateBlockMonth, { color: cfg.color + 'BB' }]}>
          {MONTH_SHORT[date.getMonth()]}
        </Text>
      </View>

      <View style={styles.listInfo}>
        <Text style={styles.expenseType} numberOfLines={1}>{type}</Text>
        <Text style={styles.expenseDate}>{formatDate(date)}</Text>
        {description ? <Text style={styles.expenseDesc} numberOfLines={1}>{description}</Text> : null}
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.amountText}>₹{amount.toFixed(2)}</Text>
        <View style={[styles.statusChip, { backgroundColor: cfg.color + '18' }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={11} color={cfg.color} />
          <Text style={[styles.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18, padding: 14, gap: 12,
    borderWidth: 1, borderColor: '#f3f4f6',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  dateBlock: {
    width: 50, height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  dateBlockDay:   { fontSize: 20, fontWeight: '800' },
  dateBlockMonth: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  listInfo: { flex: 1 },
  expenseType: { color: '#111827', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  expenseDate: { color: '#9ca3af', fontSize: 11 },
  expenseDesc: { color: '#6b7280', fontSize: 11, marginTop: 2 },
  rightSection: { alignItems: 'flex-end', gap: 6 },
  amountText: { color: '#111827', fontSize: 16, fontWeight: '800' },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusChipText: { fontSize: 10, fontWeight: '700' },
});
