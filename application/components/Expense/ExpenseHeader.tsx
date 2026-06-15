// components/Expense/ExpenseHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface ExpenseHeaderProps {
  dateFilterLabel: string;
  onAddPress: () => void;
}

export default function ExpenseHeader({ dateFilterLabel, onAddPress }: ExpenseHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Expenses</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={styles.dateRangeBadge}>
          <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.accent} />
          <Text style={styles.dateRangeText}>{dateFilterLabel}</Text>
        </View>
        <TouchableOpacity onPress={onAddPress} style={styles.addBtn}>
          <Ionicons name="add" size={18} color={Colors.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dateRangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    gap: 6,
  },
  dateRangeText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});