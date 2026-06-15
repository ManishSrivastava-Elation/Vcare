// components/report/FilterTypeSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FilterType = 'all' | 'specific';

const FILTER_OPTIONS: { type: FilterType; label: string; subtitle: string; icon: any }[] = [
  { type: 'all', label: 'All Employees', subtitle: 'Export full data for date range', icon: 'people-outline' },
  { type: 'specific', label: 'Specific Employee', subtitle: 'Export single employee data', icon: 'person-outline' },
];

interface Props {
  selectedType: FilterType;
  onSelect: (type: FilterType) => void;
}

export const FilterTypeSelector = ({ selectedType, onSelect }: Props) => (
  <View>
    <Text style={styles.sectionLabel}>Select filter type</Text>
    <View style={styles.filterGrid}>
      {FILTER_OPTIONS.map((opt) => {
        const selected = selectedType === opt.type;
        return (
          <TouchableOpacity
            key={opt.type}
            activeOpacity={0.8}
            style={[styles.filterCard, selected && styles.filterCardSelected]}
            onPress={() => onSelect(opt.type)}
          >
            <Ionicons name={opt.icon} size={22} color={selected ? '#4b5563' : '#9ca3af'} />
            <Text style={[styles.filterCardLabel, selected && styles.filterCardLabelSelected]}>
              {opt.label}
            </Text>
            <Text style={styles.filterCardSub}>{opt.subtitle}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  filterCard: {
    width: '47.5%', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb',
    backgroundColor: '#fff', padding: 14, gap: 4,
  },
  filterCardSelected: { borderColor: '#9ca3af', backgroundColor: '#f9fafb' },
  filterCardLabel: { fontSize: 13, fontWeight: '700', color: '#9ca3af', marginTop: 6 },
  filterCardLabelSelected: { color: '#374151' },
  filterCardSub: { fontSize: 11, color: '#9ca3af' },
});