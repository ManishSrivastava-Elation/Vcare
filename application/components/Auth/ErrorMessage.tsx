import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <View style={styles.errorRow}>
      <Ionicons name="alert-circle-outline" size={13} color="#ef4444" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, marginLeft: 2 },
  errorText: { color: '#ef4444', fontSize: 12, fontWeight: '500' },
});