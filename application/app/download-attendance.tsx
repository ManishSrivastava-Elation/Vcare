// app/(tabs)/download-attendance.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
  Alert, Keyboard, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AnimatedBlobs from '@/components/Auth/AnimatedBlobs';
import { downloadAttendanceFile } from '@/services/file.service';
import { getAllEmployeesAdmin } from '@/services/admin.service';
import { FilterTypeSelector, FilterType } from '@/components/report/FilterTypeSelector';
import { DateRangePicker } from '@/components/report/DateRangePicker';
import { EmployeeSelectorModal } from '@/components/report/EmployeeSelectorModal';

interface Employee {
  EmployeeId: number;
  FullName: string;
  EmployeeCode: string;
}

export default function DownloadAttendanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Filter
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [selectedEmpId, setSelectedEmpId] = useState(0);
  const [selectedEmpLabel, setSelectedEmpLabel] = useState('');
  const [showEmpModal, setShowEmpModal] = useState(false);

  // Dates
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'from' | 'to'>('from');

  // UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch employees
  useEffect(() => {
    getAllEmployeesAdmin()
      .then((res) => setEmployees(res.data ?? res))
      .catch(() => {})
      .finally(() => setEmpLoading(false));
  }, []);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const openDatePicker = (type: 'from' | 'to') => {
    setPickerType(type);
    setShowPicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const formatted = formatDate(selectedDate);
      if (pickerType === 'from') setFromDate(formatted);
      else setToDate(formatted);
    }
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (filterType === 'specific' && !selectedEmpId) newErrors.employeeId = 'Employee is required';
    if (!fromDate.trim()) newErrors.fromDate = 'From date is required';
    if (!toDate.trim()) newErrors.toDate = 'To date is required';
    if (fromDate && toDate && fromDate > toDate) newErrors.fromDate = '"From" date cannot be after "To" date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownload = async () => {
    if (!validate()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const params: any = { startDate: fromDate, endDate: toDate };
      if (filterType === 'specific') params.employeeId = selectedEmpId;
      await downloadAttendanceFile(params);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <AnimatedBlobs />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Attendance Report</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <FilterTypeSelector selectedType={filterType} onSelect={setFilterType} />

          {filterType === 'specific' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Employee *</Text>
              <TouchableOpacity
                style={[styles.selector, errors.employeeId && styles.selectorError]}
                onPress={() => setShowEmpModal(true)}
              >
                <Ionicons name="people-outline" size={20} color="#9ca3af" style={styles.selectorIcon} />
                <Text style={[styles.selectorText, !selectedEmpLabel && { color: '#9ca3af' }]}>
                  {empLoading ? 'Loading employees...' : selectedEmpLabel || 'Select employee'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
              {errors.employeeId && <Text style={styles.errorText}>{errors.employeeId}</Text>}
            </View>
          )}

          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            errors={errors}
            onPressFrom={() => openDatePicker('from')}
            onPressTo={() => openDatePicker('to')}
          />

          <TouchableOpacity activeOpacity={0.88} onPress={handleDownload} disabled={loading} style={styles.downloadButton}>
            <LinearGradient colors={['#9ca3af', '#4b5563']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.downloadButtonText}>Share Report</Text>
                  <Ionicons name="share-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}
      </KeyboardAvoidingView>

      <EmployeeSelectorModal
        visible={showEmpModal}
        employees={employees}
        loading={empLoading}
        selectedId={selectedEmpId}
        onSelect={(emp) => {
          setSelectedEmpId(emp.EmployeeId);
          setSelectedEmpLabel(`${emp.FullName} (${emp.EmployeeCode})`);
          clearError('employeeId');
        }}
        onClose={() => setShowEmpModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff', marginBottom: 25 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#6b7280', fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12 },
  selectorError: { borderColor: '#ef4444' },
  selectorIcon: { marginRight: 8 },
  selectorText: { flex: 1, fontSize: 15, color: '#111827' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 6 },
  downloadButton: { borderRadius: 16, overflow: 'hidden', marginTop: 16, shadowColor: '#4b5563', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  gradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  downloadButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});