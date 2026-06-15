// components/Expense/StatusFilterRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { StatusFilter } from '../../constants/expenseConstants';

interface StatusFilterRowProps {
  currentFilter: StatusFilter;
  onSelectFilter: (filter: StatusFilter) => void;
}

const statuses: StatusFilter[] = ['All', 'Pending', 'Approved', 'Rejected', 'Paid'];

export default function StatusFilterRow({ currentFilter, onSelectFilter }: StatusFilterRowProps) {
  return (
    <View style={styles.statusChipRow}>
      {statuses.map(status => (
        <TouchableOpacity
          key={status}
          onPress={() => onSelectFilter(status)}
          style={[styles.statusChip, currentFilter === status && styles.statusChipActive]}
        >
          <Text style={[styles.statusChipText, currentFilter === status && styles.statusChipTextActive]}>
            {status}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statusChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  statusChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.whiteFaint,
  },
  statusChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});