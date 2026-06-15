import DayCard, { DayCardPunch } from '@/components/Attendance/DayCard';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import MonthNavigator from '@/components/common/MonthNavigator';
import StatCard from '@/components/common/StatCard';
import getFullImageUrl from '@/services/image.service';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { getAllAttendanceAdmin } from '../../services/admin.service';
import { formatTime } from '../../utils/timeHelpers';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

interface PunchRecord {
  checkInTime: string;
  checkOutTime?: string;
  checkInTimeFormatted: string;
  checkOutTimeFormatted?: string;
  address: string;
  dynamicAddress: string;
  checkInLat: string;
  checkInLong: string;
  checkOutLat?: string;
  checkOutLong?: string;
  checkInImg: string;
  checkOutImg?: string;
  status: 'approved' | 'rejected' | 'pending';
  attendanceId: number;
  remark?: string;
}

interface AttendanceItem {
  date: Date;
  employeeName: string;
  employeeCode: string;
  companyName: string;
  punches: PunchRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────


const extractDateFromISO = (isoString: string): Date => {
  // Split the ISO string to get just the date part
  const datePart = isoString.split('T')[0]; // "2026-05-02"
  const [year, month, day] = datePart.split('-').map(Number);
  // Create date at UTC midnight to avoid timezone shifts
  return new Date(Date.UTC(year, month - 1, day));
};

const hasActivePunch = (punches: PunchRecord[]): boolean => punches.some(p => !p.checkOutTime);

const getItemFilterStatus = (item: AttendanceItem): FilterType => {
  if (item.punches.some(p => p.status === 'pending')) return 'pending';
  if (item.punches.some(p => p.status === 'rejected')) return 'rejected';
  return hasActivePunch(item.punches) ? 'active' : 'inactive';
};

// ─── Transform API data ────────────────────────────────────────────────────

interface ApiAttendanceRecord {
  AttendanceId: number;
  CompanyId: number;
  EmployeeId: number;
  CheckInTime: string;
  CheckOutTime: string;
  CheckInLatitude: string;
  CheckInLongitude: string;
  CheckOutLatitude: string;
  CheckOutLongitude: string;
  CheckInSelfieUrl: string;
  CheckOutSelfieUrl: string;
  IsWithinGeoFence: number;
  Remarks: string;
  CreatedAt: string;
  DynamicAddress: string;
  LocationSource: string;
  AccuracyMeters: string;
  FaceVerified: number;
  ImageTimestamp: string;
  DeviceInfo: string;
  LocalId: string;
  Address: string;
  CompanyName: string;
  EmployeeName: string;
  EmployeeCode: string;
  MobileNo: string;
  Status: string;
}

const transformApiData = (apiRecords: ApiAttendanceRecord[]): AttendanceItem[] => {
  const grouped = new Map<string, {
    date: Date;
    employeeName: string;
    employeeCode: string;
    companyName: string;
    punches: PunchRecord[];
  }>();

  for (const record of apiRecords) {
    // ✅ FIXED: Extract date from CheckInTime without timezone conversion
    const checkInDate = extractDateFromISO(record.CheckInTime);
    const dateStr = record.CheckInTime.split('T')[0]; // "2026-05-02"
    const dateKey = `${record.EmployeeCode}_${dateStr}`;

    const punch: PunchRecord = {
      checkInTime: record.CheckInTime,
      checkOutTime: record.CheckOutTime || undefined,
      checkInTimeFormatted: formatTime(record.CheckInTime),
      checkOutTimeFormatted: record.CheckOutTime ? formatTime(record.CheckOutTime) : undefined,
      address: record.Address,
      dynamicAddress: record.DynamicAddress,
      checkInLat: record.CheckInLatitude,
      checkInLong: record.CheckInLongitude,
      checkOutLat: record.CheckOutLatitude || undefined,
      checkOutLong: record.CheckOutLongitude || undefined,
      checkInImg: getFullImageUrl(record.CheckInSelfieUrl),
      checkOutImg: record.CheckOutSelfieUrl ? getFullImageUrl(record.CheckOutSelfieUrl) : undefined,
      status: record.Status as any,
      attendanceId: record.AttendanceId,
      remark: record.Remarks,
    };

    if (grouped.has(dateKey)) {
      grouped.get(dateKey)!.punches.push(punch);
    } else {
      grouped.set(dateKey, {
        date: checkInDate,
        employeeName: record.EmployeeName,
        employeeCode: record.EmployeeCode,
        companyName: record.CompanyName,
        punches: [punch],
      });
    }
  }

  const result: AttendanceItem[] = [];
  for (const [, value] of grouped) {
    // Sort punches descending – latest check‑in first
    value.punches.sort((a, b) => b.checkInTime.localeCompare(a.checkInTime));
    result.push({
      date: value.date,
      employeeName: value.employeeName,
      employeeCode: value.employeeCode,
      companyName: value.companyName,
      punches: value.punches,
    });
  }
  // Sort overall by date descending
  result.sort((a, b) => b.date.getTime() - a.date.getTime());
  return result;
};

// ─── Main Screen ─────────────────────────────────────────────────────────

const AttendanceListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = new Date();

  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [filter, setFilter] = useState<FilterType>('pending');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllAttendanceAdmin();
      const apiRecords = response.data as ApiAttendanceRecord[];
      const transformed = transformApiData(apiRecords);
      setAttendanceData(transformed);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const monthFiltered = useMemo(() => {
    return attendanceData.filter(item => {
      const itemYear = item.date.getUTCFullYear();  // ✅ Use UTC methods
      const itemMonth = item.date.getUTCMonth();    // ✅ Use UTC methods
      return itemYear === viewYear && itemMonth === viewMonth;
    });
  }, [attendanceData, viewYear, viewMonth]);

  const statusFiltered = useMemo(() => {
    return monthFiltered
      .map(item => {
        // If 'all', 'active', or 'inactive', keep all punches
        if (filter === 'all' || filter === 'active' || filter === 'inactive') return item;

        // Otherwise, filter punches inside the item
        const matchingPunches = item.punches.filter(p => p.status === filter);
        if (matchingPunches.length === 0) return null;

        return { ...item, punches: matchingPunches };
      })
      .filter((item): item is AttendanceItem => item !== null);
  }, [monthFiltered, filter]);

  const sortedData = useMemo(() => {
    return [...statusFiltered].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [statusFiltered]);

  const counts = useMemo(() => {
    let all = 0, pending = 0, approved = 0, rejected = 0;
    monthFiltered.forEach(item => {
      all++;
      if (item.punches.some(p => p.status === 'pending')) pending++;
      if (item.punches.some(p => p.status === 'approved')) approved++;
      if (item.punches.some(p => p.status === 'rejected')) rejected++;
    });
    return { all, pending, approved, rejected };
  }, [monthFiltered]);

  const uniqueEmployeesCount = useMemo(() => {
    const codes = new Set(attendanceData.map(d => d.employeeCode));
    return codes.size;
  }, [attendanceData]);

  const prevMonth = () => {
    let newMonth = viewMonth - 1;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const nextMonth = () => {
    let newMonth = viewMonth + 1;
    let newYear = viewYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    const isFuture = newYear > today.getFullYear() || (newYear === today.getFullYear() && newMonth > today.getMonth());
    if (isFuture) return;
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const isFutureMonth = () => {
    return viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  };

  if (loading) {
    return (
      <LoadingOverlay visible={true} message="Loading Attendance..." />
    );
  }

  return (
    <LinearGradient colors={['#f8f9fa', '#f1f3f5', '#e9ecef']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Attendance</Text>
            <Text style={styles.headerSub}>All Employees</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

            <TouchableOpacity onPress={() => router.push('/add-attendance' as any)} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6b6d71', '#4b5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                <Text style={styles.addText}>Add</Text>
                <Ionicons name="add" size={16} color="#fff" style={{ marginLeft: 2 }} />
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/download-attendance' as any)} activeOpacity={0.8}>
              <LinearGradient
                colors={['#6b6d71', '#4b5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                <Text style={styles.addText}>Share Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>
        <MonthNavigator
          month={viewMonth}
          year={viewYear}
          onPrev={prevMonth}
          onNext={nextMonth}
          disableNext={isFutureMonth()}
        />

        <View style={styles.statsRow}>
          <StatCard label="Pending" count={counts.pending} color="#d97706" icon="clock-fast" active={filter === 'pending'} onPress={() => setFilter('pending')} />
          <StatCard label="Approved" count={counts.approved} color="#22c55e" icon="check-circle" active={filter === 'approved'} onPress={() => setFilter('approved')} />
          <StatCard label="Rejected" count={counts.rejected} color="#dc2626" icon="close-octagon" active={filter === 'rejected'} onPress={() => setFilter('rejected')} />
          <StatCard label="All" count={counts.all} color={Colors.accent ?? '#6366f1'} icon="calendar-check" active={filter === 'all'} onPress={() => setFilter('all')} />
        </View>

        <Text style={styles.listTitle}>{sortedData.length} Records</Text>

        {sortedData.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={Colors.whiteFaint ?? '#9ca3af'} />
            <Text style={styles.emptyText}>No records found for this month</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedData.map((item, i) => (
              <DayCard
                key={i}
                date={item.date}
                punches={item.punches.map((p): DayCardPunch => ({
                  checkIn: p.checkInTimeFormatted,
                  checkOut: p.checkOutTimeFormatted,
                  address: p.address,
                  dynamicAddress: p.dynamicAddress,
                  checkInImg: p.checkInImg,
                  checkOutImg: p.checkOutImg,
                  status: p.status,
                  attendanceId: p.attendanceId,
                  remark: p.remark,
                }))}
                employeeName={item.employeeName}
                employeeCode={item.employeeCode}
                status={item.punches[0]?.status}
                onStatusUpdated={fetchData}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
};

export default AttendanceListScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 15,
  },
  headerTitle: { color: Colors.white ?? '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  headerSub: { color: Colors.whiteMuted ?? 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 },
  empCountText: { color: Colors.accent ?? '#6b7280', fontSize: 11, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  addText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  listTitle: {
    color: Colors.whiteMuted ?? 'rgba(255,255,255,0.55)',
    fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3,
  },
  list: { gap: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { color: Colors.whiteFaint ?? '#9ca3af', fontSize: 14 },
});