import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function LogoHeader() {
  return (
    <View style={styles.logoArea}>
      <View style={styles.logoCircle}>
        <Image source={require('@/assets/images/V-Care Logo.jpeg')} style={styles.logoImg} resizeMode="contain" />
      </View>
      <Text style={styles.appName}>V-Care Technologies</Text>
      <Text style={styles.tagline}>Track your time, own your day</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: '#fff',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    overflow: 'hidden',
  },
  logoImg: { width: 100, height: 100 },
  appName: { color: '#111827', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: '#9ca3af', fontSize: 14, marginTop: 6, letterSpacing: 0.2 },
});