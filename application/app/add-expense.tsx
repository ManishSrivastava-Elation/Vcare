import AnimatedBlobs from '@/components/Auth/AnimatedBlobs';
import { InputField } from '@/components/common/InputField';
import { FileUploadSection } from '@/components/common/FileUploadSection';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { getAllEmployeesAdmin } from '../services/admin.service';
import { getExpenseTypes, addExpenseAdmin } from '../services/expense.service';

interface Employee {
  EmployeeId: number;
  FullName: string;
  EmployeeCode: string;
}

interface ExpenseType {
  id: number;
  name: string;
}

const expenseSchema = Yup.object({
  employeeId: Yup.number().required('Employee is required').min(1, 'Employee is required'),
  expenseType: Yup.string().trim().required('Expense type is required'),
  description: Yup.string().trim().min(3, 'Description must be at least 3 characters').required('Description is required'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .required('Amount is required'),
});

export default function AddExpenseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const [employeeId, setEmployeeId] = useState(0);
  const [employeeLabel, setEmployeeLabel] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [expenseTypeLabel, setExpenseTypeLabel] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [hasBill, setHasBill] = useState(false);
  const [billFile, setBillFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getAllEmployeesAdmin()
      .then((res) => setEmployees(res.data ?? res))
      .catch(() => { })
      .finally(() => setEmpLoading(false));

    getExpenseTypes()
      .then((res) => setExpenseTypes(res.data ?? []))
      .catch(() => { });

    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const clearError = (key: string) =>
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const pickFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const a = result.assets[0];
        const ext = a.uri.split('.').pop() || 'jpg';
        setBillFile({
          uri: a.uri,
          name: a.fileName || `photo_${Date.now()}.${ext}`,
          type: a.mimeType || 'image/jpeg',
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const a = result.assets[0];
        const ext = a.uri.split('.').pop() || 'jpg';
        setBillFile({
          uri: a.uri,
          name: a.fileName || `image_${Date.now()}.${ext}`,
          type: a.mimeType || 'image/jpeg',
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.assets && result.assets[0]) {
        const d = result.assets[0];
        setBillFile({
          uri: d.uri,
          name: d.name || `doc_${Date.now()}`,
          type: d.mimeType || 'application/octet-stream',
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    try {
      await expenseSchema.validate(
        { employeeId, expenseType, description, amount: parseFloat(amount) },
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
    try {
      const res = await addExpenseAdmin({
        employeeId,
        expenseType,
        description: description.trim(),
        amount: parseFloat(amount),
        hasBill,
        billFile: hasBill ? billFile : null,
      });
      console.log('Add Expense Response:', res);
      Alert.alert('Success', 'Expense added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const data = error?.response?.data;
      Alert.alert('Error', data?.message ?? error?.message ?? 'Something went wrong. Please try again.');
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
          <Text style={styles.headerTitle}>Add Expense</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.cardSubtitle}>Record employee expense</Text>

            {/* Employee */}
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

            {/* Expense Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expense Type *</Text>
              <TouchableOpacity style={[styles.selector, errors.expenseType ? styles.selectorError : null]}
                onPress={() => setShowTypeModal(true)}>
                <Ionicons name="pricetag-outline" size={20} color="#9ca3af" style={styles.selectorIcon} />
                <Text style={[styles.selectorText, !expenseTypeLabel && { color: '#9ca3af' }]}>
                  {expenseTypeLabel || 'Select expense type'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
              {errors.expenseType ? <Text style={styles.errorText}>{errors.expenseType}</Text> : null}
            </View>

            <InputField
              label="Description"
              placeholder="e.g. Client meeting, travel, etc."
              value={description}
              onChangeText={(t) => { setDescription(t); clearError('description'); }}
              iconName="document-text-outline"
              multiline
              numberOfLines={3}
              error={errors.description}
            />

            <InputField
              label="Amount (₹)"
              placeholder="e.g. 249.99"
              value={amount}
              onChangeText={(t) => { setAmount(t); clearError('amount'); }}
              iconName="cash-outline"
              keyboardType="numeric"
              returnKeyType="done"
              error={errors.amount}
            />

            {/* Has Bill */}
            <View style={styles.inputGroup}>
              <TouchableOpacity onPress={() => { setHasBill(v => !v); if (hasBill) setBillFile(null); }}
                style={styles.checkboxRow}>
                <Ionicons
                  name={hasBill ? 'checkbox-outline' : 'square-outline'}
                  size={24}
                  color={hasBill ? '#4b5563' : '#9ca3af'}
                />
                <Text style={styles.checkboxLabel}>Has Bill?</Text>
              </TouchableOpacity>
            </View>

            {hasBill && (
              <FileUploadSection
                billFile={billFile}
                onPickCamera={pickFromCamera}
                onPickGallery={pickFromGallery}
                onPickDocument={pickDocument}
                onClearFile={() => setBillFile(null)}
              />
            )}

            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 12 }}>
              <TouchableOpacity activeOpacity={0.88}
                onPress={() => { animateButton(); handleSubmit(); }}
                disabled={loading} style={styles.saveButton}>
                <LinearGradient colors={['#9ca3af', '#4b5563']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.saveButtonText}>Submit Expense</Text>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

      {/* Expense Type Modal */}
      <Modal visible={showTypeModal} transparent animationType="slide" onRequestClose={() => setShowTypeModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowTypeModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Expense Type</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {expenseTypes.map((et) => (
                <TouchableOpacity key={et.id}
                  style={[styles.empItem, expenseType === et.name && styles.empItemActive]}
                  onPress={() => {
                    setExpenseType(et.name);
                    setExpenseTypeLabel(et.name);
                    clearError('expenseType');
                    setShowTypeModal(false);
                  }}>
                  <Text style={[styles.empItemText, expenseType === et.name && { color: '#fff' }]}>{et.name}</Text>
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxLabel: { fontSize: 15, color: '#374151', fontWeight: '500' },
  saveButton: { borderRadius: 16, overflow: 'hidden', marginTop: 10, shadowColor: '#4b5563', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  gradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 28 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  empItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6, backgroundColor: '#f9fafb' },
  empItemActive: { backgroundColor: '#4b5563' },
  empItemText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  empItemCode: { fontSize: 12, color: '#6b7280' },
});
