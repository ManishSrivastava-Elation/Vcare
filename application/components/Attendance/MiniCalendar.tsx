// components/Attendance/MiniCalendar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { DAY_LABELS, MONTH_SHORT, toDateObj } from '../../utils/attendanceHelpers';

const CELL_W = Math.floor((Dimensions.get('window').width - 40 - 40) / 7);

interface MiniCalendarProps {
  year: number;
  month: number;
  onYearMonthChange: (y: number, m: number) => void;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  onDayPress: (d: Date) => void;
  pickingEnd: boolean;
}

export default function MiniCalendar({
  year, month, onYearMonthChange, selectedStart, selectedEnd, onDayPress, pickingEnd,
}: MiniCalendarProps) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevM = () => {
    if (month === 0) onYearMonthChange(year - 1, 11);
    else onYearMonthChange(year, month - 1);
  };
  const nextM = () => {
    const atToday = year === today.getFullYear() && month === today.getMonth();
    if (atToday) return;
    if (month === 11) onYearMonthChange(year + 1, 0);
    else onYearMonthChange(year, month + 1);
  };
  const atMax = year === today.getFullYear() && month === today.getMonth();

  return (
    <View>
      <View style={mpStyles.nav}>
        <TouchableOpacity onPress={prevM} style={mpStyles.navBtn}>
          <Ionicons name="chevron-back" size={16} color={Colors.accent} />
        </TouchableOpacity>
        <Text style={mpStyles.navTitle}>{MONTH_SHORT[month]} {year}</Text>
        <TouchableOpacity onPress={nextM} style={[mpStyles.navBtn, atMax && { opacity: 0.3 }]} disabled={atMax}>
          <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={mpStyles.dayRow}>
        {DAY_LABELS.map(d => (
          <Text key={d} style={[mpStyles.dayHdr, (d === 'Sun' || d === 'Sat') && { color: Colors.accent }]}>{d}</Text>
        ))}
      </View>

      <View style={mpStyles.grid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`e${idx}`} style={mpStyles.cell} />;

          const thisDate = toDateObj(year, month, day);
          const isFuture = thisDate > today;
          const isStart = selectedStart && thisDate.getTime() === selectedStart.getTime();
          const isEnd = selectedEnd && thisDate.getTime() === selectedEnd.getTime();
          const inRange = selectedStart && selectedEnd && thisDate > selectedStart && thisDate < selectedEnd;

          return (
            <TouchableOpacity
              key={day}
              style={[
                mpStyles.cell,
                inRange && mpStyles.cellInRange,
                (isStart || isEnd) && mpStyles.cellSelected,
              ]}
              onPress={() => !isFuture && onDayPress(thisDate)}
              activeOpacity={0.7}
              disabled={isFuture}
            >
              <Text style={[
                mpStyles.cellText,
                isFuture && { opacity: 0.25 },
                (isStart || isEnd) && { color: '#ffffff', fontWeight: '800' },
                inRange && { color: Colors.accent },
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const mpStyles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { padding: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10 },
  navTitle: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayHdr: { width: CELL_W, textAlign: 'center', fontSize: 10, fontWeight: '700', color: Colors.whiteFaint },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_W, height: CELL_W + 2, alignItems: 'center', justifyContent: 'center' },
  cellInRange: { backgroundColor: 'rgba(107,114,128,0.12)' },
  cellSelected: { backgroundColor: Colors.primary, borderRadius: 8 },
  cellText: { color: Colors.whiteMuted, fontSize: 12, fontWeight: '600' },
});