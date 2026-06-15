// components/common/MonthNavigator.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface MonthNavigatorProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  disableNext?: boolean;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ month, year, onPrev, onNext, disableNext }) => (
  <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.monthNav}>
    <TouchableOpacity onPress={onPrev} style={styles.navBtn}>
      <Ionicons name="chevron-back" size={20} color={Colors.accent} />
    </TouchableOpacity>
    <View style={styles.monthCenter}>
      <Text style={styles.monthName}>{MONTH_NAMES[month]}</Text>
      <Text style={styles.yearLabel}>{year}</Text>
    </View>
    <TouchableOpacity
      onPress={onNext}
      style={[styles.navBtn, disableNext && { opacity: 0.3 }]}
      disabled={disableNext}
    >
      <Ionicons name="chevron-forward" size={20} color={Colors.accent} />
    </TouchableOpacity>
  </LinearGradient>
);

export default MonthNavigator;

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  navBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(99,102,241,0.1)' },
  monthCenter: { alignItems: 'center' },
  monthName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  yearLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
