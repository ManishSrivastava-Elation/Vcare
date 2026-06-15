import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Dimensions, ActivityIndicator, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { checkOutAttendanceAdmin, updateAttendanceStatus } from '../../services/admin.service';
import ConfirmModal from '../common/ConfirmModal';
import LoadingOverlay from '../common/LoadingOverlay';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isToday = (date: Date) => {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
};

const STATUS_COLOR = {
  approved: '#22c55e',
  pending: '#f59e0b',
  rejected: '#ef4444',
};

const STATUS_ICON = {
  approved: 'check-circle',
  pending: 'clock-outline',
  rejected: 'close-circle',
};

const ALL_STATUSES: ('approved' | 'pending' | 'rejected')[] = ['approved', 'pending', 'rejected'];

export interface DayCardPunch {
  checkIn: string;
  checkOut?: string | null;
  address?: string;
  dynamicAddress?: string;
  checkInImg?: string;
  checkOutImg?: string;
  status?: 'approved' | 'rejected' | 'pending';
  attendanceId?: number;
  remark?: string;
}

export interface DayCardProps {
  date: Date;
  punches?: DayCardPunch[];
  // admin mode
  employeeName?: string;
  employeeCode?: string;
  // user mode: status badge
  statusLabel?: string;
  statusIcon?: string;
  statusColor?: string;
  // border color override (if not derived from active punch)
  borderColor?: string;
  // approval status (from DB)
  status?: 'approved' | 'rejected' | 'pending';
  onStatusUpdated?: () => void;
}

function StatusDropdown({ current, attendanceId, onUpdated }: {
  current: 'approved' | 'pending' | 'rejected';
  attendanceId: number;
  onUpdated: (newStatus: 'approved' | 'rejected' | 'pending') => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0, w: 0 });
  const [confirmStatus, setConfirmStatus] = useState<'approved' | 'pending' | 'rejected' | null>(null);
  const badgeRef = React.useRef<View>(null);
  const color = STATUS_COLOR[current] || '#6b7280';

  const handleOpen = () => {
    badgeRef.current?.measure((_fx, _fy, w, h, px, py) => {
      setDropPos({ x: px, y: py + h + 4, w });
      setOpen(true);
    });
  };

  const handleSelect = (status: 'approved' | 'pending' | 'rejected') => {
    if (status === current) { setOpen(false); return; }
    setOpen(false);
    setConfirmStatus(status);
  };

  const handleConfirm = async () => {
    if (!confirmStatus) return;
    try {
      setLoading(true);
      await updateAttendanceStatus(attendanceId, confirmStatus as any);
      onUpdated(confirmStatus);
    } catch {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
      setConfirmStatus(null);
    }
  };

  return (
    <View>
      <TouchableOpacity
        ref={badgeRef}
        style={[styles.dropdownBadge, { backgroundColor: color + '20' }]}
        onPress={handleOpen}
        disabled={loading}
      >
        <MaterialCommunityIcons name={STATUS_ICON[current] as any} size={12} color={color} />
        <Text style={[styles.dropdownText, { color }]}>
          {current.charAt(0).toUpperCase() + current.slice(1)}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={10} color={color} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.dropdown, { top: dropPos.y, right: Dimensions.get('window').width - dropPos.x - dropPos.w }]}>
            {ALL_STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.dropdownItem, s === current && styles.dropdownItemActive]}
                onPress={() => handleSelect(s)}
              >
                <MaterialCommunityIcons name={STATUS_ICON[s] as any} size={13} color={STATUS_COLOR[s]} />
                <Text style={[styles.dropdownItemText, { color: STATUS_COLOR[s] }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmModal
        visible={!!confirmStatus}
        title="Change Status?"
        message={`Mark this attendance as ${confirmStatus ? confirmStatus.charAt(0).toUpperCase() + confirmStatus.slice(1) : ''}?`}
        confirmText={loading ? 'Updating...' : 'Confirm'}
        confirmColor={confirmStatus ? STATUS_COLOR[confirmStatus] : '#4b5563'}
        icon={confirmStatus ? STATUS_ICON[confirmStatus] : 'help-circle'}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmStatus(null)}
      />
    </View>
  );
}

const PunchDetail: React.FC<{
  punch: DayCardPunch;
  color: string;
  isAdmin?: boolean;
  onUpdated?: (status: 'approved' | 'rejected' | 'pending') => void;
  employeeName?: string;
  employeeCode?: string;
}> = ({ punch, color, isAdmin, onUpdated, employeeName, employeeCode }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [checkOutModalVisible, setCheckOutModalVisible] = useState(false);
  const defaultCheckOut = new Date();
  defaultCheckOut.setHours(18, 0, 0, 0);
  const [checkOutTime, setCheckOutTime] = useState<Date>(defaultCheckOut);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const formatDateTime = (date: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  const openCheckOutModal = () => {
    const defaultTime = new Date();
    defaultTime.setHours(18, 0, 0, 0);
    setCheckOutTime(defaultTime);
    setCheckOutModalVisible(true);
  };

  const openDateTimePicker = () => {
    setTempDate(checkOutTime);
    setPickerMode('date');
    setShowPicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      setTempDate(selectedDate);
      setPickerMode('time');
      setShowPicker(true);
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selectedTime) {
      const combined = new Date(tempDate);
      combined.setHours(selectedTime.getHours());
      combined.setMinutes(selectedTime.getMinutes());
      combined.setSeconds(0);
      setCheckOutTime(combined);
    }
    setShowPicker(false);
  };

  const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (pickerMode === 'date') {
      onDateChange(event, selectedDate);
    } else {
      onTimeChange(event, selectedDate);
    }
  };

  const [checkOutLoading, setCheckOutLoading] = useState(false);

  const handleCheckOutSubmit = async () => {
    if (!punch.attendanceId) return;
    try {
      setCheckOutLoading(true);
      const res = await checkOutAttendanceAdmin(punch.attendanceId, formatDateTime(checkOutTime));
      if (res?.success) {
        setCheckOutModalVisible(false);
        onUpdated?.('approved');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setCheckOutLoading(false);
    }
  };

  return (
    <View style={styles.expandedPunchCard}>
      <View style={styles.punchHeader}>
        <View style={{ flex: 1 }}>
          {punch.address ? <Text style={styles.expandedAddress} numberOfLines={1}>🏢 {punch.address}</Text> : null}
          {punch.dynamicAddress ? <Text style={styles.expandedDynamicAddress}>📡 {punch.dynamicAddress}</Text> : null}
          {punch.remark ? <Text style={styles.expandedRemark} numberOfLines={1}>💬 {punch.remark}</Text> : null}
        </View>

        {isAdmin && punch.attendanceId ? (
          <StatusDropdown
            current={punch.status || 'pending'}
            attendanceId={punch.attendanceId}
            onUpdated={(s) => onUpdated?.(s as any)}
          />
        ) : !isAdmin && punch.status ? (
          <View style={[styles.statusInfo, punch.status === 'approved' ? styles.approvedStatus : punch.status === 'rejected' ? styles.rejectedStatus : styles.pendingStatus]}>
            <MaterialCommunityIcons
              name={STATUS_ICON[punch.status] as any || 'clock-outline'}
              size={14}
              color={STATUS_COLOR[punch.status] || '#f59e0b'}
            />
            <Text style={[styles.statusInfoText, { color: STATUS_COLOR[punch.status] || '#f59e0b' }]}>
              {punch.status.charAt(0).toUpperCase() + punch.status.slice(1)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.expandedTimeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Check‑in</Text>
          <Text style={styles.timeValue}>{punch.checkIn}</Text>
        </View>
        <View style={styles.timeBlock}>
          {punch.checkOut ? (
            <>
              <Text style={styles.timeLabel}>Check‑out</Text>
              <Text style={styles.timeValue}>{punch.checkOut}</Text>
            </>
          ) : (
            <>
              <View style={styles.activeRow}>
                <Text style={styles.activeBadge}>● Active</Text>
                {isAdmin && (
                  <TouchableOpacity style={styles.checkOutBtn} onPress={openCheckOutModal}>
                    <Text style={styles.checkOutBtnText}>Check Out</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>

      {(punch.checkInImg || punch.checkOutImg) && (
        <View style={styles.expandedImageRow}>
          {punch.checkInImg && (
            <TouchableOpacity style={styles.expandedImageBtn} onPress={() => { setSelectedImage(punch.checkInImg!); setModalVisible(true); }}>
              <Ionicons name="camera-outline" size={16} color={color} />
              <Text style={[styles.expandedImageText, { color }]}>Check‑in Photo</Text>
            </TouchableOpacity>
          )}
          {punch.checkOutImg && (
            <TouchableOpacity style={styles.expandedImageBtn} onPress={() => { setSelectedImage(punch.checkOutImg!); setModalVisible(true); }}>
              <Ionicons name="camera-outline" size={16} color={color} />
              <Text style={[styles.expandedImageText, { color }]}>Check‑out Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />}
        </View>
      </Modal>

      <LoadingOverlay visible={checkOutLoading} message="Processing checkout..." />

      <Modal visible={checkOutModalVisible} transparent animationType="slide">
        <View style={styles.checkOutModalOverlay}>
          <View style={styles.checkOutModalContent}>
            <Text style={styles.checkOutModalTitle}>Check-Out Time</Text>
            <TouchableOpacity style={styles.dateTimeSelector} onPress={openDateTimePicker}>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text style={styles.dateTimeText}>{formatDateTime(checkOutTime)}</Text>
            </TouchableOpacity>
            <View style={styles.checkOutModalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCheckOutModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCheckOutSubmit} disabled={checkOutLoading}>
                {checkOutLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.submitBtnText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showPicker && (
        <DateTimePicker
          value={tempDate}
          mode={pickerMode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
    </View>
  );
};

const DayCard: React.FC<DayCardProps> = ({
  date, punches: initialPunches = [],
  employeeName, employeeCode,
  statusLabel, statusIcon, statusColor,
  borderColor: borderColorProp,
  status: initialStatus, onStatusUpdated,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [punches, setPunches] = useState(initialPunches);
  const [status, setStatus] = useState(initialStatus);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPunchId, setSelectedPunchId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setPunches(initialPunches);
    setStatus(initialStatus);
  }, [initialPunches, initialStatus]);

  const handleStatusPress = (attendanceId: number, nextStatus: 'approved' | 'rejected') => {
    setSelectedPunchId(attendanceId);
    setNewStatus(nextStatus);
    setModalVisible(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedPunchId || !newStatus) return;
    try {
      setLoading(true);
      await updateAttendanceStatus(selectedPunchId, newStatus);

      // Update local state
      const updatedPunches = punches.map(p =>
        p.attendanceId === selectedPunchId ? { ...p, status: newStatus } : p
      );
      setPunches(updatedPunches);

      // If all punches are same or just first one, update top status
      if (updatedPunches.length > 0) {
        setStatus(updatedPunches[0].status);
      }

      setModalVisible(false);
      onStatusUpdated?.();
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasActive = punches.some(p => !p.checkOut);
  const borderColor = borderColorProp ?? (
    status === 'approved' ? '#22c55e' :
      status === 'rejected' ? '#ef4444' :
        status === 'pending' ? '#f59e0b' :
          (hasActive ? '#22C55E' : '#3B82F6')
  );
  const punchesCount = punches.length;
  const today = isToday(date);
  const expandable = punchesCount > 0;
  const isAdminMode = !!(employeeName || employeeCode);

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <TouchableOpacity
        style={styles.cardMain}
        onPress={() => expandable && setExpanded(e => !e)}
        activeOpacity={expandable ? 0.7 : 1}
      >
        <View style={[styles.dateBlock, { backgroundColor: borderColor + '22' }]}>
          <Text style={[styles.dateNum, { color: borderColor }]}>{date.getDate()}</Text>
          <Text style={[styles.dateDow, { color: borderColor }]}>{DAYS[date.getDay()]}</Text>
        </View>

        <View style={styles.cardInfo}>
          {isAdminMode ? (
            <View style={styles.userRow}>
              {employeeName && <Text style={styles.userName} numberOfLines={1}>{employeeName}</Text>}
              {employeeCode && <Text style={styles.empCode}>{employeeCode}</Text>}
            </View>
          ) : (
            <Text style={styles.monthYear}>{MONTH_SHORT[date.getMonth()]} {date.getFullYear()}</Text>
          )}

          {today && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}

          {punchesCount > 0 ? (
            <View style={styles.punchCountBadge}>
              <MaterialCommunityIcons name="clock-outline" size={12} color={borderColor} />
              <Text style={[styles.punchCountText, { color: borderColor }]}>
                {punchesCount} {punchesCount === 1 ? 'punch' : 'punches'}
              </Text>
            </View>
          ) : statusLabel === 'Absent' ? (
            <Text style={styles.subText}>No check-in recorded</Text>
          ) : statusLabel === 'N/A' || statusLabel === 'Holiday' ? (
            <Text style={styles.subText}>{statusLabel === 'Holiday' ? 'Public Holiday' : 'Weekend / Off'}</Text>
          ) : null}
        </View>

        <View style={styles.rightCol}>
          {statusLabel && statusIcon && (
            <View style={[styles.statusBadge, { backgroundColor: (statusColor ?? borderColor) + '20' }]}>
              <MaterialCommunityIcons name={statusIcon as any} size={14} color={statusColor ?? borderColor} />
              <Text style={[styles.statusBadgeText, { color: statusColor ?? borderColor }]}>{statusLabel}</Text>
            </View>
          )}
          {expandable && (
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={borderColor} />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContainer}>
          {punches.map((p, i) => (
            <PunchDetail
              key={i}
              punch={p}
              color={borderColor}
              isAdmin={isAdminMode}
              employeeName={employeeName}
              employeeCode={employeeCode}
              onUpdated={(newStatus) => {
                const newPunches = punches.map(item =>
                  item.attendanceId === p.attendanceId ? { ...item, status: newStatus as any } : item
                );
                setPunches(newPunches);
                if (newPunches.length > 0) setStatus(newPunches[0].status);
                onStatusUpdated?.();
              }}
            />
          ))}
        </View>
      )}

      <ConfirmModal
        visible={modalVisible}
        title="Update Status"
        message={`Do you want to ${newStatus} this attendance?`}
        confirmText={newStatus === 'approved' ? 'Approve' : 'Reject'}
        confirmColor={newStatus === 'approved' ? '#16a34a' : '#dc2626'}
        icon={newStatus === 'approved' ? 'check-decagram' : 'close-octagon'}
        loading={loading}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
};

export default DayCard;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18, borderWidth: 1, borderColor: '#f3f4f6',
    borderLeftWidth: 4, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10 },
  dateBlock: { width: 44, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateNum: { fontSize: 20, fontWeight: '800' },
  dateDow: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  cardInfo: { flex: 1, gap: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 12, fontWeight: '600', color: '#374151' },
  empCode: { fontSize: 10, color: '#6b7280', fontWeight: '500' },
  monthYear: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  todayBadge: {
    backgroundColor: '#e0e7ff', borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2,
  },
  todayText: { color: '#4338ca', fontSize: 9, fontWeight: '700' },
  punchCountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  punchCountText: { fontSize: 11, fontWeight: '600' },
  subText: { color: Colors.whiteFaint, fontSize: 11, marginTop: 2 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  approvalBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 12, marginTop: 4,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  approvalText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.2 },
  approvedBg: { backgroundColor: '#f0fdf4' },
  rejectedBg: { backgroundColor: '#fef2f2' },
  pendingBg: { backgroundColor: '#fffbeb' },
  dropdownBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  dropdownText: { fontSize: 10, fontWeight: '700' },
  dropdownOverlay: { flex: 1 },
  dropdown: {
    position: 'absolute', backgroundColor: '#fff', borderRadius: 12, padding: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 20,
    borderWidth: 1, borderColor: '#f0f0f0', minWidth: 140,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  dropdownItemActive: { backgroundColor: '#f3f4f6' },
  dropdownItemText: { fontSize: 13, fontWeight: '600' },
  punchHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0, gap: 10 },
  statusInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 20,
  },
  approvedStatus: { backgroundColor: '#f0fdf4' },
  rejectedStatus: { backgroundColor: '#fef2f2' },
  pendingStatus: { backgroundColor: '#fffbeb' },
  statusInfoText: { fontSize: 10, fontWeight: '700' },
  expandedContainer: {
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb', paddingHorizontal: 10, paddingBottom: 10,
  },
  expandedPunchCard: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 9, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  expandedAddress: { fontSize: 12, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  expandedDynamicAddress: { fontSize: 10, color: '#6b7280', marginBottom: 2 },
  expandedRemark: { fontSize: 10, color: '#6366f1', fontStyle: 'italic', marginBottom: 6 },
  expandedTimeRow: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 2 },
  timeValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  activeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  activeBadge: { fontSize: 10, color: '#22c55e', fontWeight: '600' },
  checkOutBtn: { backgroundColor: '#dc2626', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  checkOutBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  expandedImageRow: { flexDirection: 'row', gap: 16, marginTop: 0 },
  expandedImageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expandedImageText: { fontSize: 12, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 8 },
  modalImage: { width, height: height * 0.8 },
  checkOutModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  checkOutModalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '85%', maxWidth: 400 },
  checkOutModalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  dateTimeSelector: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  dateTimeText: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '600' },
  checkOutModalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#374151', fontSize: 14, fontWeight: '700' },
  submitBtn: { flex: 1, backgroundColor: '#ef4444', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
