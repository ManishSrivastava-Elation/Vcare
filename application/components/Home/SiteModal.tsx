import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SiteModalProps {
  visible: boolean;
  onSubmit: (site: string) => void;
  onClose: () => void;
}

export default function SiteModal({ visible, onSubmit, onClose }: SiteModalProps) {
  const [site, setSite] = useState('');

  const handleSubmit = () => {
    if (!site.trim()) return;
    onSubmit(site.trim());
    setSite('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Site</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Which Site?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter site name"
            placeholderTextColor="#9ca3af"
            value={site}
            onChangeText={setSite}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.submitBtn, !site.trim() && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={!site.trim()}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 17, fontWeight: '800', color: '#111827' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e4e9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#4b5563',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#d1d5db' },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.4 },
});
