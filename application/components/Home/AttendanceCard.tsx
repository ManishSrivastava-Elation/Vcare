// components/Home/AttendanceCard.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AttendanceCardProps {
  currentTime: string;
  currentDate: string;
  isPunchedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHrs: string;
  onPunch: () => void;
}

export default function AttendanceCard({
  currentTime,
  currentDate,
  isPunchedIn,
  checkInTime,
  checkOutTime,
  workingHrs,
  onPunch,
}: AttendanceCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 950, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 950, useNativeDriver: true }),
      ])
    );
    const ring = Animated.loop(
      Animated.timing(ringAnim, { toValue: 1, duration: 2200, useNativeDriver: true })
    );
    pulse.start();
    ring.start();
    return () => { pulse.stop(); ring.stop(); };
  }, []);

  const ringScale = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.32] });
  const ringOpacity = ringAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.45, 0.12, 0] });

  // Colors
  const accentColor = isPunchedIn ? '#16a34a' : '#6b7280';
  const accentMid = isPunchedIn ? '#22c55e' : '#9ca3af';
  const punchColors: [string, string] = isPunchedIn
    ? ['#22c55e', '#15803d']
    : ['#9ca3af', '#4b5563'];

  const stats = [
    { icon: 'clock-check-outline' as const, label: 'Check In', value: checkInTime ?? '--:--', color: '#16a34a', bg: '#dcfce7' },
    { icon: 'clock-remove-outline' as const, label: 'Check Out', value: checkOutTime ?? '--:--', color: '#dc2626', bg: '#fee2e2' },
    { icon: 'timer-outline' as const, label: 'Working Hrs', value: workingHrs, color: '#4f46e5', bg: '#eef2ff' },
  ];

  return (
    <View style={styles.outerWrapper}>

      {/* ── Punch Panel ── */}
      <View style={styles.punchPanel}>

        {/* Punch button */}
        <View style={styles.punchArea}>
          <Animated.View style={[
            styles.pulseRing,
            {
              borderColor: accentMid,
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]} />

          <View style={[styles.circleTrack, { borderColor: accentMid + '40' }]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity onPress={onPunch} activeOpacity={0.82}>
                <LinearGradient colors={punchColors} style={styles.punchBtn}>
                  <MaterialCommunityIcons
                    name={isPunchedIn ? 'hand-wave' : 'hand-pointing-up'}
                    size={32}
                    color="#fff"
                  />
                  <Text style={styles.punchLabel}>
                    {isPunchedIn ? 'PUNCH OUT' : 'PUNCH IN'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Location chip */}
        <View style={[
          styles.locationChip,
          { borderColor: isPunchedIn ? '#86efac' : '#e5e7eb' },
        ]}>
          <Ionicons
            name="location-sharp"
            size={12}
            color={isPunchedIn ? '#22c55e' : '#9ca3af'}
          />
          <Text style={[
            styles.locationText,
            { color: isPunchedIn ? '#16a34a' : '#9ca3af' },
          ]}>
            {isPunchedIn ? 'You are Punched In ✓' : 'Site Reached. Mark Your Attendance'}
          </Text>
        </View>
      </View>

      {/* ── Stats Panel ── */}
      <View style={styles.statsPanel}>
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statSep} />}
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: s.bg }]}>
                  <MaterialCommunityIcons name={s.icon} size={17} color={s.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

    </View>
  );
}

/* ─── Styles ─── */
const OUTER_BG = '#f1f3f5';   // light gray outer card
const PANEL_BG = '#ffffff';   // white inner panels
const BORDER = '#e2e4e9';
const TEXT = '#111827';
const MUTED = '#6b7280';
const SUBTLE = '#9ca3af';

const panelBase = {
  backgroundColor: PANEL_BG,
  marginHorizontal: 10,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderColor: BORDER,
} as const;

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: 30,
    backgroundColor: OUTER_BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 4,
    paddingVertical: 10,
  },

  /* Punch */
  punchPanel: {
    ...panelBase,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  punchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  pulseRing: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 2,
  },
  circleTrack: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 2,
    backgroundColor: OUTER_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punchBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  punchLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  /* Location */
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: OUTER_BG,
    borderWidth: 1,
  },
  locationText: { fontSize: 11.5, fontWeight: '600' },

  /* Stats */
  statsPanel: {
    ...panelBase,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: OUTER_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 6,
    gap: 5,
  },
  statSep: {
    width: 1,
    backgroundColor: BORDER,
    marginVertical: 10,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
  },
  statLabel: {
    fontSize: 10,
    color: SUBTLE,
    fontWeight: '500',
  },

});