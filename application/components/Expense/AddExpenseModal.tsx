// components/Expense/AddExpenseModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as yup from 'yup';
import { Colors } from '../../constants/colors';
import { FormInput } from '../common/FormInput';
import { OptionInput } from '../common/OptionInput';
import { FileUploadSection } from '../common/FileUploadSection';
import { getExpenseTypes } from '../../services/expense.service';

const validationSchema = yup.object().shape({
  type: yup.string().required('Expense type is required'),
  description: yup.string().trim().min(3, 'Description must be at least 3 characters').required('Description is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be greater than 0').required('Amount is required'),
});

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExpense: (data: {
    type: string;
    description: string;
    amount: number;
    hasBill: boolean;
    billFile: { uri: string; name: string; type: string } | null;
  }) => void;
}

export default function AddExpenseModal({ visible, onClose, onAddExpense }: AddExpenseModalProps) {
  const [newExpense, setNewExpense] = useState({ type: '', description: '', amount: '' });
  const [hasBill, setHasBill] = useState(false);
  const [billFile, setBillFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ type?: string; description?: string; amount?: string }>({});
  const [expenseTypeOptions, setExpenseTypeOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          Alert.alert('Permission required', 'Camera and gallery access needed for bill uploads.');
        }
        try {
          const res = await getExpenseTypes();
          const options = (res.data ?? []).map((t: { id: number; name: string }) => ({
            label: t.name,
            value: t.name,
          }));
          setExpenseTypeOptions(options);
        } catch {
          // fallback to empty
        }
      })();
    }
  }, [visible]);

  const resetForm = () => {
    setNewExpense({ type: '', description: '', amount: '' });
    setHasBill(false);
    setBillFile(null);
    setFieldErrors({});
  };

  const pickFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBillFile({
          uri: asset.uri,
          name: asset.fileName || 'camera_photo.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setBillFile({
          uri: asset.uri,
          name: asset.fileName || 'gallery_image.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.assets && result.assets[0]) {
        const doc = result.assets[0];
        setBillFile({
          uri: doc.uri,
          name: doc.name,
          type: doc.mimeType || 'application/octet-stream',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    try {
      const validatedData = await validationSchema.validate({
        type: newExpense.type,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
      }, { abortEarly: false });

      onAddExpense({
        type: validatedData.type,
        description: validatedData.description,
        amount: validatedData.amount,
        hasBill,
        billFile,
      });
      resetForm();
      onClose();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: { type?: string; description?: string; amount?: string } = {};
        error.inner.forEach(err => {
          if (err.path === 'type') errors.type = err.message;
          if (err.path === 'description') errors.description = err.message;
          if (err.path === 'amount') errors.amount = err.message;
        });
        setFieldErrors(errors);
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient colors={['#ffffff', '#f3f4f6']} style={styles.modalBox}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Add Expense</Text>

            <OptionInput
              label="Type of Expense"
              options={expenseTypeOptions}
              selectedValue={newExpense.type}
              onSelect={(value) => {
                setNewExpense(prev => ({ ...prev, type: value }));
                if (fieldErrors.type) setFieldErrors(prev => ({ ...prev, type: undefined }));
              }}
              error={fieldErrors.type}
            />

            <FormInput
              label="Description"
              value={newExpense.description}
              onChangeText={(text) => {
                setNewExpense(prev => ({ ...prev, description: text }));
                if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: undefined }));
              }}
              error={fieldErrors.description}
              placeholder="Add details (e.g., client meeting, project name)"
              multiline
              numberOfLines={3}
            />

            <FormInput
              label="Amount / Cost (₹)"
              value={newExpense.amount}
              onChangeText={(text) => {
                setNewExpense(prev => ({ ...prev, amount: text }));
                if (fieldErrors.amount) setFieldErrors(prev => ({ ...prev, amount: undefined }));
              }}
              error={fieldErrors.amount}
              placeholder="e.g., 249.99"
              keyboardType="numeric"
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={() => setHasBill(!hasBill)} style={styles.checkbox}>
                {hasBill ? (
                  <Ionicons name="checkbox-outline" size={24} color={Colors.accent} />
                ) : (
                  <Ionicons name="square-outline" size={24} color={Colors.whiteMuted} />
                )}
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

            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={handleClose} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.modalAddBtn}>
                <Text style={styles.modalAddText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 28,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  modalCancelText: {
    color: Colors.whiteMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  modalAddBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalAddText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});