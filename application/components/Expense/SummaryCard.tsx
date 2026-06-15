// components/Expense/SummaryCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SummaryCardProps {
  totalItems: number;
  totalAmount: number;
}

export default function SummaryCard({ totalItems, totalAmount }: SummaryCardProps) {
  return (
    <LinearGradient colors={['#9ca3af', '#4b5563']} style={styles.summaryCard}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="wallet-outline" size={26} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.summaryTitle}>Total Expenses</Text>
          <Text style={styles.summaryCount}>{totalItems} entries this period</Text>
        </View>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 24, padding: 20, marginBottom: 20,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  summaryCount: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginTop: 3 },
  amountBox: { alignItems: 'flex-end' },
  amountLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500' },
  amountValue: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginTop: 2 },
});
