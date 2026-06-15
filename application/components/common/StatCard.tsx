// components/common/StatCard.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StatCardProps {
  label: string;
  count: number;
  color: string;
  icon: string;
  active: boolean;
  onPress: () => void;
  style?: any;
}

export default function StatCard({ label, count, color, icon, active, onPress, style }: StatCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.8}
      style={[styles.card, style, active && { borderColor: color, borderWidth: 2, shadowColor: color, shadowOpacity: 0.2 }]}
    >
      <View style={[styles.iconRing, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.count, { color: active ? color : '#111827' }]}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
      {active && <View style={[styles.activeDot, { backgroundColor: color }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5, gap: 1,
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 5,
    position: 'relative',
  },
  iconRing: {
    width: 30, height: 30, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 1,
  },
  count: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 11, color: '#9ca3af', fontWeight: '600', letterSpacing: 0.3 },
  activeDot: {
    position: 'absolute', top: 8, right: 10,
    width: 7, height: 7, borderRadius: 4,
  },
});
