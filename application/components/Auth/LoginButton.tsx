import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface LoginButtonProps {
  loading: boolean;
  onPress: () => void;
  label?: string;
}

export default function LoginButton({ loading, onPress, label = 'Sign In' }: LoginButtonProps) {
  return (
    <TouchableOpacity style={styles.loginBtn} onPress={onPress} activeOpacity={0.88} disabled={loading}>
      <LinearGradient
        colors={['#9ca3af', '#4b5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.loginGradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.loginText}>{label}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loginBtn: { marginTop: 28, borderRadius: 16, overflow: 'hidden' },
  loginGradient: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
});