// components/Attendance/AttendanceCalendar.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { DAY_LABELS, STATUS_CFG } from '../../utils/attendanceHelpers';
import { AttendanceStatus } from '../../constants/AttendanceStatusTypes'; 

const CAL_CELL = Math.floor((Dimensions.get('window').width - 40 - 32) / 7);

interface AttendanceCalendarProps {
  year: number;
  month: number;
  attendance: Record<number, AttendanceStatus>;
  filter: 'all' | 'present' | 'absent' | 'na';
  isCurrentMonth: boolean;
  today: Date;
}

export default function AttendanceCalendar({ year, month, attendance, filter, isCurrentMonth, today }: AttendanceCalendarProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const calendarCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.calendarCard}>
      <View style={styles.dayHeaderRow}>
        {DAY_LABELS.map(d => (
          <Text key={d} style={[styles.dayHeader, (d === 'Sun' || d === 'Sat') && styles.dayHeaderWeekend]}>{d}</Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {calendarCells.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={styles.calCell} />;
          const status = attendance[day];
          const isToday = isCurrentMonth && day === today.getDate();
          const isFutureD = isCurrentMonth && day > today.getDate();
          const cfg = status && STATUS_CFG[status];
          const dimmed = filter !== 'all' && status !== null && (
            (filter === 'present' && status !== 'present') ||
            (filter === 'absent' && status !== 'absent') ||
            (filter === 'na' && status !== 'na' && status !== 'holiday')
          );
          return (
            <View key={day} style={[styles.calCell, isToday && styles.calCellToday, dimmed && styles.calCellDimmed]}>
              <Text style={[styles.calDayNum, isToday && styles.calDayNumToday, isFutureD && { color: Colors.whiteFaint }]}>{day}</Text>
              {!isFutureD && status && <View style={[styles.calDot, { backgroundColor: cfg ? cfg.color : 'transparent' }]} />}
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        {(['present', 'absent', 'holiday', 'na'] as const).map(k => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_CFG[k].color }]} />
            <Text style={styles.legendLabel}>{STATUS_CFG[k].label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: { backgroundColor: Colors.cardBg, borderRadius: 24, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: Colors.border },
  dayHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { width: CAL_CELL, textAlign: 'center', fontSize: 11, fontWeight: '700', color: Colors.whiteFaint, letterSpacing: 0.3 },
  dayHeaderWeekend: { color: Colors.accent },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: CAL_CELL, height: CAL_CELL + 4, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  calCellToday: { backgroundColor: 'rgba(107,114,128,0.15)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(107,114,128,0.4)' },
  calCellDimmed: { opacity: 0.22 },
  calDayNum: { color: Colors.whiteMuted, fontSize: 13, fontWeight: '600' },
  calDayNumToday: { color: Colors.white, fontWeight: '800' },
  calDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.divider },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: Colors.whiteFaint, fontSize: 11, fontWeight: '500' },
});