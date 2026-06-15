// components/report/EmployeeSelectorModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Employee {
  EmployeeId: number;
  FullName: string;
  EmployeeCode: string;
}

interface Props {
  visible: boolean;
  employees: Employee[];
  loading: boolean;
  selectedId: number;
  onSelect: (emp: Employee) => void;
  onClose: () => void;
}

export const EmployeeSelectorModal = ({
  visible, employees, loading, selectedId, onSelect, onClose,
}: Props) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Select Employee</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 360 }}>
          {loading ? (
            <Text style={{ padding: 16, textAlign: 'center' }}>Loading...</Text>
          ) : (
            employees.map((emp) => (
              <TouchableOpacity
                key={emp.EmployeeId}
                style={[styles.empItem, selectedId === emp.EmployeeId && styles.empItemActive]}
                onPress={() => { onSelect(emp); onClose(); }}
              >
                <Text style={[styles.empItemText, selectedId === emp.EmployeeId && { color: '#fff' }]}>
                  {emp.FullName}
                </Text>
                <Text style={[styles.empItemCode, selectedId === emp.EmployeeId && { color: 'rgba(255,255,255,0.7)' }]}>
                  {emp.EmployeeCode}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
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