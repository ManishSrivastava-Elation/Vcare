// components/report/DateRangePicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  fromDate: string;
  toDate: string;
  errors: { fromDate?: string; toDate?: string };
  onPressFrom: () => void;
  onPressTo: () => void;
}

export const DateRangePicker = ({ fromDate, toDate, errors, onPressFrom, onPressTo }: Props) => (
  <View>
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>From Date *</Text>
      <TouchableOpacity style={[styles.selector, errors.fromDate && styles.selectorError]} onPress={onPressFrom}>
        <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.selectorIcon} />
        <Text style={[styles.selectorText, !fromDate && { color: '#9ca3af' }]}>{fromDate || 'Select from date'}</Text>
        <Ionicons name="chevron-down-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
      {errors.fromDate && <Text style={styles.errorText}>{errors.fromDate}</Text>}
    </View>

    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>To Date *</Text>
      <TouchableOpacity style={[styles.selector, errors.toDate && styles.selectorError]} onPress={onPressTo}>
        <Ionicons name="calendar-outline" size={20} color="#9ca3af" style={styles.selectorIcon} />
        <Text style={[styles.selectorText, !toDate && { color: '#9ca3af' }]}>{toDate || 'Select to date'}</Text>
        <Ionicons name="chevron-down-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
      {errors.toDate && <Text style={styles.errorText}>{errors.toDate}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#6b7280', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12 },
  selectorError: { borderColor: '#ef4444' },
  selectorIcon: { marginRight: 8 },
  selectorText: { flex: 1, fontSize: 15, color: '#111827' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 6 },
});