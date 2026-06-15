// components/Expense/DateFilterRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { DateFilter } from '../../constants/expenseConstants';

interface DateFilterRowProps {
  currentFilter: DateFilter;
  onSelectFilter: (filter: DateFilter) => void;
}

const filters: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30_days', label: 'Last 30D' },
  { value: 'last_week', label: 'Last Week' },
];

export default function DateFilterRow({ currentFilter, onSelectFilter }: DateFilterRowProps) {
  return (
    <View style={styles.filterRow}>
      {filters.map(({ value, label }) => (
        <TouchableOpacity
          key={value}
          onPress={() => onSelectFilter(value)}
          style={[styles.filterPill, currentFilter === value && styles.filterPillActive]}
        >
          <Text style={[styles.filterPillText, currentFilter === value && styles.filterPillTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  filterPillText: {
    color: Colors.whiteFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});