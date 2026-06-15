// components/Attendance/DateRangeModal.tsx
import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { fmtDate } from '../../utils/attendanceHelpers';
import MiniCalendar from './MiniCalendar';

interface DateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  pickingEnd: boolean;
  pickerYear: number;
  pickerMonth: number;
  onPickerYearMonthChange: (y: number, m: number) => void;
  onDayPress: (date: Date) => void;
  onClearRange: () => void;
  onApply: () => void;
  today: Date;
  onThisMonth: () => void;
  onLast7Days: () => void;
  onLast30Days: () => void;
}

export default function DateRangeModal({
  visible, onClose, rangeStart, rangeEnd, pickingEnd,
  pickerYear, pickerMonth, onPickerYearMonthChange,
  onDayPress, onClearRange, onApply, today,
  onThisMonth, onLast7Days, onLast30Days,
}: DateRangeModalProps) {

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
          <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.modalInner}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Date Range</Text>
                <Text style={styles.modalSubtitle}>
                  {!rangeStart
                    ? 'Tap a start date'
                    : pickingEnd
                      ? 'Now tap an end date'
                      : `${fmtDate(rangeStart)}  →  ${rangeEnd ? fmtDate(rangeEnd) : '...'}`}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={Colors.whiteMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.chipRow}>
              <View style={[styles.chip, !pickingEnd && styles.chipActive]}>
                <MaterialCommunityIcons name="calendar-start" size={14} color={!pickingEnd ? Colors.white : Colors.whiteFaint} />
                <Text style={[styles.chipText, !pickingEnd && styles.chipTextActive]}>
                  {rangeStart ? fmtDate(rangeStart) : 'Start Date'}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color={Colors.whiteFaint} style={{ marginHorizontal: 6 }} />
              <View style={[styles.chip, pickingEnd && styles.chipActive]}>
                <MaterialCommunityIcons name="calendar-end" size={14} color={pickingEnd ? Colors.white : Colors.whiteFaint} />
                <Text style={[styles.chipText, pickingEnd && styles.chipTextActive]}>
                  {rangeEnd ? fmtDate(rangeEnd) : 'End Date'}
                </Text>
              </View>
            </View>

            <MiniCalendar
              year={pickerYear}
              month={pickerMonth}
              onYearMonthChange={onPickerYearMonthChange}
              selectedStart={rangeStart}
              selectedEnd={rangeEnd}
              onDayPress={onDayPress}
              pickingEnd={pickingEnd}
            />

            <View style={styles.presetRow}>
              <TouchableOpacity style={styles.presetBtn} onPress={onThisMonth}>
                <Text style={styles.presetText}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn} onPress={onLast7Days}>
                <Text style={styles.presetText}>Last 7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetBtn} onPress={onLast30Days}>
                <Text style={styles.presetText}>Last 30 Days</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onApply}
              disabled={!rangeStart || !rangeEnd}
              activeOpacity={0.85}
              style={[styles.applyBtn, (!rangeStart || !rangeEnd) && { opacity: 0.4 }]}
            >
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.applyBtnInner}>
                <Text style={styles.applyBtnText}>Apply Range</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  modalInner: { padding: 20, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  modalSubtitle: { color: Colors.accent, fontSize: 12, marginTop: 3 },
  modalCloseBtn: { padding: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10 },
  chipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  chipText: { color: Colors.whiteFaint, fontSize: 11, fontWeight: '600', flex: 1 },
  chipTextActive: { color: '#ffffff' },
  presetRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 16 },
  presetBtn: { flex: 1, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  presetText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
  applyBtn: { borderRadius: 18, overflow: 'hidden' },
  applyBtnInner: { paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.primary },
  applyBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
});