import AnimatedBlobs from '@/components/Auth/AnimatedBlobs';
import { InputField } from '@/components/common/InputField';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { addAttendanceAdmin, getAllEmployeesAdmin } from '../services/admin.service';

interface Employee {
  EmployeeId: number;
  FullName: string;
  EmployeeCode: string;
}

const attendanceSchema = Yup.object({
  employeeId: Yup.number().required('Employee is required').min(1, 'Employee is required'),
  checkInTime: Yup.date().required('Check-in time is required').typeError('Check-in time is required'),
  checkOutTime: Yup.date().nullable().optional(),
  remarks: Yup.string().trim().nullable().optional(),
  siteName: Yup.string().trim().required('Site name is required'),
});

const formatDateTime = (date: Date | null): string => {
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

export default function AddAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [showEmpModal, setShowEmpModal] = useState(false);

  const [employeeId, setEmployeeId] = useState(0);
  const [employeeLabel, setEmployeeLabel] = useState('');
  const defaultCheckIn = new Date(); defaultCheckIn.setHours(10, 0, 0, 0);
  const [checkInTime, setCheckInTime] = useState<Date | null>(defaultCheckIn);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [remarks, setRemarks] = useState('Added by Admin');
  const [siteName, setSiteName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // State for the two‑step datetime picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerTarget, setPickerTarget] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getAllEmployeesAdmin()
      .then((res) => setEmployees(res.data ?? res))
      .catch(() => {})
      .finally(() => setEmpLoading(false));
  }, []);

  const clearError = (key: string) =>
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  // Step 1: Show date picker
  const openDatePicker = (target: 'checkIn' | 'checkOut') => {
    const currentDate = target === 'checkIn' ? checkInTime : checkOutTime;
    setTempDate(currentDate || new Date());
    setPickerTarget(target);
    setPickerMode('date');
    setShowPicker(true);
  };

  // Step 2: After date is chosen, show time picker
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      // Keep the selected date, then show time picker
      setTempDate(selectedDate);
      setPickerMode('time');
      if (Platform.OS === 'ios') {
        // On iOS the picker stays on screen; just change mode
        setShowPicker(true);
      } else {
        // On Android we need to reopen with time mode
        setShowPicker(true);
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'set' && selectedTime) {
      // Combine the previously selected date with the new time
      const combined = new Date(tempDate);
      combined.setHours(selectedTime.getHours());
      combined.setMinutes(selectedTime.getMinutes());
      combined.setSeconds(0);
      if (pickerTarget === 'checkIn') {
        setCheckInTime(combined);
        clearError('checkInTime');
      } else {
        setCheckOutTime(combined);
        clearError('checkOutTime');
      }
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

  const handleSubmit = async () => {
    if (!checkInTime) {
      setErrors(prev => ({ ...prev, checkInTime: 'Check-in time is required' }));
      return;
    }
    const payload = {
      EmployeeId: employeeId,
      CheckInTime: formatDateTime(checkInTime),
      CheckOutTime: checkOutTime ? formatDateTime(checkOutTime) : '',
      Remarks: remarks.trim(),
      Address: siteName.trim(),
    };
    try {
      await attendanceSchema.validate(
        { employeeId, checkInTime, checkOutTime, remarks: remarks || null, siteName },
        { abortEarly: false }
      );
      setErrors({});
    } catch (err: any) {
      if (err.inner) {
        const e: Record<string, string> = {};
        err.inner.forEach((x: any) => { if (x.path) e[x.path] = x.message; });
        setErrors(e);
      }
      return;
    }
    setLoading(true);
    Keyboard.dismiss();
    try {
      const res = await addAttendanceAdmin(payload as any);
      if (res?.success && res?.statusCode === 201) {
        Alert.alert('Success', 'Attendance added successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      const data = error?.response?.data;
      Alert.alert('Error', data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: '#fff' }]}>
      <AnimatedBlobs />
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Attendance</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.cardSubtitle}>Record employee attendance</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Employee *</Text>
              <TouchableOpacity style={[styles.selector, errors.employeeId ? styles.selectorError : null]}
                onPress={() => setShowEmpModal(true)}>
                <Ionicons name="people-outline" size={20} color="#9ca3af" style={styles.selectorIcon} />
                <Text style={[styles.selectorText, !employeeLabel && { color: '#9ca3af' }]}>
                  {empLoading ? 'Loading employees...' : employeeLabel || 'Select employee'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
              {errors.employeeId ? <Text style={styles.errorText}>{errors.employeeId}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Check-In Time *</Text>
              <TouchableOpacity style={[styles.selector, errors.checkInTime ? styles.selectorError : null]}
                onPress={() => openDatePicker('checkIn')}>
                <Ionicons name="log-in-outline" size={20} color="#9ca3af" style={styles.selectorIcon} />
                <Text style={[styles.selectorText, !checkInTime && { color: '#9ca3af' }]}>
                  {checkInTime ? formatDateTime(checkInTime) : 'Select check-in time'}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
              </TouchableOpacity>
              {errors.checkInTime ? <Text style={styles.errorText}>{errors.checkInTime}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Check-Out Time <Text style={styles.optionalTag}>(Optional)</Text></Text>
              <TouchableOpacity style={[styles.selector, errors.checkOutTime ? styles.selectorError : null]}
                onPress={() => openDatePicker('checkOut')}>
                <Ionicons name="log-out-outline" size={20} color="#9ca3af" style={styles.selectorIcon} />
                <Text style={[styles.selectorText, !checkOutTime && { color: '#9ca3af' }]}>
                  {checkOutTime ? formatDateTime(checkOutTime) : 'Not checked out yet'}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
              </TouchableOpacity>
              {errors.checkOutTime ? <Text style={styles.errorText}>{errors.checkOutTime}</Text> : null}
            </View>

            <InputField label="Site Name" placeholder="e.g. Lucknow Office" value={siteName}
              onChangeText={(t) => { setSiteName(t); clearError('siteName'); }}
              iconName="location-outline" returnKeyType="next" error={errors.siteName} />

            <InputField label="Remarks (Optional)" placeholder="e.g. Added by Admin" value={remarks}
              onChangeText={(t) => { setRemarks(t); clearError('remarks'); }}
              iconName="chatbox-ellipses-outline" returnKeyType="done"
              onSubmitEditing={handleSubmit} multiline numberOfLines={3} error={errors.remarks} />

            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 12 }}>
              <TouchableOpacity activeOpacity={0.88}
                onPress={() => { animateButton(); handleSubmit(); }}
                disabled={loading} style={styles.saveButton}>
                <LinearGradient colors={['#9ca3af', '#4b5563']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.saveButtonText}>Submit Attendance</Text>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} message="Submitting attendance..." />

      {/* Native DateTime Picker – two‑step mode */}
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate}
          mode={pickerMode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}

      {/* Employee Modal */}
      <Modal visible={showEmpModal} transparent animationType="slide" onRequestClose={() => setShowEmpModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowEmpModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Employee</Text>
              <TouchableOpacity onPress={() => setShowEmpModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {employees.map((emp) => (
                <TouchableOpacity key={emp.EmployeeId}
                  style={[styles.empItem, employeeId === emp.EmployeeId && styles.empItemActive]}
                  onPress={() => {
                    setEmployeeId(emp.EmployeeId);
                    setEmployeeLabel(`${emp.FullName} (${emp.EmployeeCode})`);
                    clearError('employeeId');
                    setShowEmpModal(false);
                  }}>
                  <Text style={[styles.empItemText, employeeId === emp.EmployeeId && { color: '#fff' }]}>{emp.FullName}</Text>
                  <Text style={[styles.empItemCode, employeeId === emp.EmployeeId && { color: 'rgba(255,255,255,0.7)' }]}>{emp.EmployeeCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 },
  formCard: { backgroundColor: '#fff', borderRadius: 28, padding: 10, marginTop: 50 },
  cardSubtitle: { fontSize: 15, color: '#6b7280', marginBottom: 28, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#6b7280', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12 },
  selectorError: { borderColor: '#ef4444' },
  selectorIcon: { marginRight: 8 },
  selectorText: { flex: 1, fontSize: 15, color: '#111827' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 6 },
  saveButton: { borderRadius: 16, overflow: 'hidden', marginTop: 10, shadowColor: '#4b5563', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  gradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 28 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  optionalTag: { fontSize: 11, color: '#9ca3af', fontWeight: '400' },
  empItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6, backgroundColor: '#f9fafb' },
  empItemActive: { backgroundColor: '#4b5563' },
  empItemText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  empItemCode: { fontSize: 12, color: '#6b7280' },
});