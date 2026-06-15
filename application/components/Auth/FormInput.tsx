import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  iconName,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = secureTextEntry && !showPassword;

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <View style={styles.inputIconBg}>
          <Ionicons name={iconName} size={16} color="#6b7280" />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#c0c0c0"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9ca3af" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#374151', fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 54,
  },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  input: { flex: 1, color: '#111827', fontSize: 15 },
  inputIconBg: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  eyeBtn: { padding: 6 },
});