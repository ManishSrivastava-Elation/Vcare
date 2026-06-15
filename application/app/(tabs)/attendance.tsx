import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import getFullImageUrl from '@/services/image.service';

import MonthNavigator from '../../components/common/MonthNavigator';
import DateRangeModal from '../../components/Attendance/DateRangeModal';
import RangeSummary from '../../components/Attendance/RangeSummary';
import StatCard from '../../components/common/StatCard';
import DayCard from '../../components/Attendance/DayCard';
import { PunchRecord } from '../../constants/AttendanceStatusTypes';
import { STATUS_CFG } from '../../utils/attendanceHelpers';
import { AttendanceApiRecord, getAttendance } from '../../services/attendance.service';
import {
  buildAttendanceStatusMap,
  fmtDate,
  generateAttendance,
  parseAttendanceRecords,
  toDateObj,
} from '../../utils/attendanceHelpers';
import { extractTime, showFormatTime, extractISTDateParts, convertToIST, getISTDate } from '../../utils/timeHelpers';



export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const today = getISTDate();

  // Month view state
  const [viewYear, setViewYear] = useState(today.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(today.getUTCMonth());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive'>('all');


  // Date range state
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());

  // Data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceApiRecord[]>([]);

  const attendanceByDate = useMemo(() => parseAttendanceRecords(attendanceRecords), [attendanceRecords]);
  const attendance = useMemo(() => buildAttendanceStatusMap(viewYear, viewMonth, attendanceRecords), [viewYear, viewMonth, attendanceRecords]);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const isCurrentMonth = viewYear === today.getUTCFullYear() && viewMonth === today.getUTCMonth();
  const isFutureMonth = viewYear > today.getUTCFullYear() || (viewYear === today.getUTCFullYear() && viewMonth > today.getUTCMonth());

  const loadAttendance = useCallback(async () => {
    try {
      const response = await getAttendance({ year: viewYear, month: viewMonth + 1 });
      if (response?.data) {
        setAttendanceRecords(response.data);
      }
    } catch (error) {
      console.error('Failed to load attendance records:', error);
    }
  }, [viewYear, viewMonth]);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [loadAttendance])
  );

  const monthCounts = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0, all = 0;
    attendanceRecords.forEach(r => {
      const { year: recYear, month: recMonth } = extractISTDateParts(r.CheckInTime || r.CreatedAt);
      if (recYear === viewYear && recMonth === viewMonth) {
        all++;
        if (r.Status === 'pending') pending++;
        if (r.Status === 'approved') approved++;
        if (r.Status === 'rejected') rejected++;
      }
    });
    return { pending, approved, rejected, all };
  }, [attendanceRecords, viewYear, viewMonth]);

  const getPunches = (year: number, month: number, day: number): PunchRecord[] | undefined =>
    attendanceByDate[`${year}-${month}-${day}`]?.punches;

  const listDays = useMemo(() => {
    const dayMap: Record<number, { date: Date; punches: PunchRecord[] }> = {};
    
    attendanceRecords.forEach(r => {
      const { year, month, day: d } = extractISTDateParts(r.CheckInTime || r.CreatedAt);
      if (year === viewYear && month === viewMonth) {
        if (!dayMap[d]) {
          dayMap[d] = { date: toDateObj(viewYear, viewMonth, d), punches: [] };
        }
        dayMap[d].punches.push({
          site: r.DynamicAddress || r.Address || r.CompanyName || "Office",
          checkIn: r.CheckInTime ? extractTime(r.CheckInTime) : extractTime(r.CreatedAt),
          checkOut: r.CheckOutTime ? extractTime(r.CheckOutTime) : null,
          status: r.Status,
          address: r.Address,
          dynamicAddress: r.DynamicAddress,
          checkInImg: getFullImageUrl(r.CheckInSelfieUrl ?? undefined),
          checkOutImg: r.CheckOutSelfieUrl ? getFullImageUrl(r.CheckOutSelfieUrl) : undefined,
          remarks: r.Remarks,
        });
      }
    });

    return Object.entries(dayMap)
      .map(([d, val]) => {
        const dayNum = parseInt(d);
        
        // If 'all', keep everything
        if (filter === 'all' || filter === 'active' || filter === 'inactive') {
          return { day: dayNum, ...val };
        }

        // Filter punches within the day
        const matchingPunches = val.punches.filter(p => p.status === filter);
        if (matchingPunches.length === 0) return null;

        return { day: dayNum, ...val, punches: matchingPunches };
      })
      .filter((item): item is any => item !== null)
      .sort((a, b) => b.day - a.day);
  }, [attendanceRecords, viewYear, viewMonth, filter]);

  // Range logic
  const rangeDays = useMemo(() => {
    if (!rangeStart || !rangeEnd) return [];
    const days: { date: Date; status: any; punches: any[] }[] = [];
    const cur = new Date(rangeStart);
    while (cur <= rangeEnd) {
      const y = cur.getFullYear(), m = cur.getMonth(), d = cur.getDate();
      const key = `${y}-${m}-${d}`;
      const dayData = attendanceByDate[key];
      const status = dayData?.status ?? generateAttendance(y, m)[d] ?? 'na';
      const punches = dayData?.punches ?? [];
      
      days.push({ date: new Date(cur), status, punches });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [rangeStart, rangeEnd, attendanceByDate]);

  const rangeCounts = useMemo(() => {
    let present = 0, absent = 0, na = 0;
    rangeDays.forEach(({ status }) => {
      if (status === 'present' || status === 'halfday' || status === 'late') present++;
      else if (status === 'absent') absent++;
      else na++;
    });
    return { present, absent, na };
  }, [rangeDays]);

  const filteredRangeDays = useMemo(() =>
    rangeDays
      .map(item => {
        // If 'all', keep everything
        if (filter === 'all' || filter === 'active' || filter === 'inactive') {
          return item;
        }

        // Filter punches within the day
        const matchingPunches = item.punches.filter((p: any) => p.status === filter);
        if (matchingPunches.length === 0) return null;

        return { ...item, punches: matchingPunches };
      })
      .filter((item): item is any => item !== null)
      .reverse(),
  [rangeDays, filter]);

  const rangeActive = !!(rangeStart && rangeEnd);

  // Handlers
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isFutureMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const openPicker = () => {
    setPickerYear(today.getFullYear());
    setPickerMonth(today.getMonth());
    setPickingEnd(false);
    setShowRangePicker(true);
  };

  const handlePickerDay = useCallback((d: Date) => {
    if (!pickingEnd) {
      setRangeStart(d);
      setRangeEnd(null);
      setPickingEnd(true);
    } else {
      if (rangeStart && d < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(d);
      } else {
        setRangeEnd(d);
      }
      setPickingEnd(false);
    }
  }, [pickingEnd, rangeStart]);

  const applyRange = () => {
    if (rangeStart && rangeEnd) setShowRangePicker(false);
  };
  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setPickingEnd(false);
  };

  const selectThisMonth = () => {
    setRangeStart(new Date(today.getFullYear(), today.getMonth(), 1));
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
  };
  const selectLast7Days = () => {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    setRangeStart(start);
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
  };
  const selectLast30Days = () => {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    setRangeStart(start);
    setRangeEnd(today);
    setPickingEnd(false);
    setShowRangePicker(false);
  };

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Attendance</Text>
          <TouchableOpacity
            onPress={openPicker}
            style={[styles.rangeTrigger, rangeActive && styles.rangeTriggerActive]}
          >
            <MaterialCommunityIcons
              name="calendar-range"
              size={18}
              color={rangeActive ? Colors.white : Colors.accent}
            />
            <Text style={[styles.rangeTriggerText, rangeActive && { color: Colors.white }]}>
              {rangeActive
                ? `${fmtDate(rangeStart!)} → ${fmtDate(rangeEnd!)}`
                : 'Date Range'}
            </Text>
            {rangeActive && (
              <TouchableOpacity onPress={clearRange} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color="rgba(0,0,0,0.4)" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Range Summary */}
        {rangeActive && (
          <RangeSummary
            counts={rangeCounts}
            startDate={rangeStart!}
            endDate={rangeEnd!}
            onClear={clearRange}
          />
        )}

        {/* Month Navigator & Calendar (only if no range active) */}
        {!rangeActive && (
          <>
            <MonthNavigator
              month={viewMonth}
              year={viewYear}
              onPrev={prevMonth}
              onNext={nextMonth}
              disableNext={isFutureMonth}
            />

            <View style={styles.statsRow}>
              <StatCard label="All" count={monthCounts.all} color={Colors.accent}
                icon="calendar-check" active={filter === 'all'} onPress={() => setFilter('all')} />
              <StatCard label="Pending" count={monthCounts.pending} color="#d97706"
                icon="clock-fast" active={filter === 'pending'} onPress={() => setFilter('pending')} />
              <StatCard label="Approved" count={monthCounts.approved} color={Colors.present}
                icon="check-circle" active={filter === 'approved'} onPress={() => setFilter('approved')} />
              <StatCard label="Rejected" count={monthCounts.rejected} color="#dc2626"
                icon="close-octagon" active={filter === 'rejected'} onPress={() => setFilter('rejected')} />
            </View>
          </>
        )}

        {/* List Title */}
        <Text style={styles.listTitle}>
          {rangeActive ? `${filteredRangeDays.length} Records` : 'Daily Records'}
        </Text>

        {/* Attendance List */}
        <View style={styles.list}>
          {(rangeActive ? filteredRangeDays : listDays).map((item: any, i) => {
            return (
              <DayCard
                key={i}
                date={item.date}
                punches={item.punches}
                status={item.punches[0]?.status} // Show status of the first punch (usually they have one or they are all same)
              />
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Range Modal */}
      <DateRangeModal
        visible={showRangePicker}
        onClose={() => setShowRangePicker(false)}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        pickingEnd={pickingEnd}
        pickerYear={pickerYear}
        pickerMonth={pickerMonth}
        onPickerYearMonthChange={(y, m) => { setPickerYear(y); setPickerMonth(m); }}
        onDayPress={handlePickerDay}
        onClearRange={clearRange}
        onApply={applyRange}
        today={today}
        onThisMonth={selectThisMonth}
        onLast7Days={selectLast7Days}
        onLast30Days={selectLast30Days}
      />
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  headerTitle: { color: Colors.white, fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  rangeTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    maxWidth: width - 160,
  },
  rangeTriggerActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  rangeTriggerText: { color: Colors.accent, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  list: { gap: 12 },
  listTitle: { color: Colors.whiteMuted, fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },
});