import AnimatedBlobs from '@/components/Auth/AnimatedBlobs';
import ErrorMessage from '@/components/Auth/ErrorMessage';
import FormInput from '@/components/Auth/FormInput';
import LoginButton from '@/components/Auth/LoginButton';
import { updatePassword } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';

const schema = Yup.object({
  newPassword: Yup.string().min(6, 'Minimum 6 characters').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your password'),
});

export default function UpdatePasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    try {
      await schema.validate(form, { abortEarly: false });
      setErrors({});
      setLoading(true);
      await updatePassword(form.newPassword, form.confirmPassword);
      Alert.alert('Success', 'Password updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => { if (e.path) newErrors[e.path] = e.message; });
        setErrors(newErrors);
        return;
      }
      const apiRes = err?.response?.data;
      if (apiRes?.error && Array.isArray(apiRes.error)) {
        const newErrors: Record<string, string> = {};
        apiRes.error.forEach((e: any) => { if (e.field) newErrors[e.field] = e.message; });
        setErrors(newErrors);
      } else {
        Alert.alert('Error', apiRes?.message || err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <AnimatedBlobs />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inner, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#374151" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Password 🔐</Text>
          <Text style={styles.cardSubtitle}>Enter your new password</Text>

          <FormInput
            label="New Password"
            placeholder="Enter new password"
            value={form.newPassword}
            onChangeText={(t) => handleChange('newPassword', t)}
            iconName="lock-open-outline"
            secureTextEntry
            error={errors.newPassword}
          />
          <ErrorMessage message={errors.newPassword} />

          <FormInput
            label="Confirm Password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChangeText={(t) => handleChange('confirmPassword', t)}
            iconName="checkmark-circle-outline"
            secureTextEntry
            error={errors.confirmPassword}
          />
          <ErrorMessage message={errors.confirmPassword} />

          <LoginButton loading={loading} onPress={handleSubmit} label="Update Password" />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 42,
    height: 42,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: { color: '#111827', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { color: '#9ca3af', fontSize: 14, marginBottom: 28 },
});
