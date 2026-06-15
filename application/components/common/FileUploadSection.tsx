import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface FileUploadSectionProps {
  billFile: { uri: string; name: string; type: string } | null;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onPickDocument: () => void;
  onClearFile: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  billFile,
  onPickCamera,
  onPickGallery,
  onPickDocument,
  onClearFile,
}) => {
  return (
    <View style={styles.fileUploadSection}>
      <Text style={styles.inputLabel}>Upload Bill File</Text>
      <View style={styles.filePickerRow}>
        <TouchableOpacity onPress={onPickCamera} style={styles.filePickerBtn}>
          <Ionicons name="camera" size={20} color={Colors.white} />
          <Text style={styles.filePickerText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPickGallery} style={styles.filePickerBtn}>
          <Ionicons name="images" size={20} color={Colors.white} />
          <Text style={styles.filePickerText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPickDocument} style={styles.filePickerBtn}>
          <Ionicons name="document-text" size={20} color={Colors.white} />
          <Text style={styles.filePickerText}>Document</Text>
        </TouchableOpacity>
      </View>
      {billFile && (
        <View style={styles.selectedFileContainer}>
          <Text style={styles.selectedFileName} numberOfLines={1}>
            📎 {billFile.name}
          </Text>
          <TouchableOpacity onPress={onClearFile}>
            <Ionicons name="close-circle" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fileUploadSection: {
    marginBottom: 20,
  },
  inputLabel: {
    color: Colors.whiteMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  filePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
    marginTop: 6,
  },
  filePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  filePickerText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  selectedFileName: {
    color: Colors.whiteMuted,
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
});