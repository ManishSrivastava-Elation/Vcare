import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function AnimatedBlobs() {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1.18, duration: 2000, useNativeDriver: true }),
          Animated.timing(val, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    anim(pulse1, 0);
    anim(pulse2, 1000);
  }, []);

  return (
    <>
      <Animated.View style={[styles.blobTopRight, { transform: [{ scale: pulse1 }] }]} />
      <Animated.View style={[styles.blobBottomLeft, { transform: [{ scale: pulse2 }] }]} />
    </>
  );
}

const styles = StyleSheet.create({
  blobTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#e5e7eb',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e9ecef',
  },
});