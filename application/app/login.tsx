import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { login as apiLogin } from '@/services/auth.service';
import { loginSuccess } from '@/store/authSlice';
import type { AppDispatch } from '@/store/store';

import AnimatedBlobs from '@/components/Auth/AnimatedBlobs';
import ErrorMessage from '@/components/Auth/ErrorMessage';
import FormInput from '@/components/Auth/FormInput';
import LoginButton from '@/components/Auth/LoginButton';
import LogoHeader from '@/components/Auth/LogoHeader';
import { storeData, storeToken } from '@/utils/asyncStorage';

const schema = Yup.object({
  mobileNo: Yup.string()
    .required('Mobile number is required')
    .min(10, 'Mobile number must be at least 10 digits')
    .max(10, 'Mobile number cannot exceed 10 digits')
    .matches(/^\d+$/, 'Only digits allowed'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ mobileNo?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleLogin = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    try {
      await schema.validate({ mobileNo, password }, { abortEarly: false });
      setErrors({});
      setLoading(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // API call – returns { token, user: { FullName, MobileNo, EmployeeId } }
      const result = await apiLogin({ mobileNo: mobileNo.trim(), password });
      
      const { token, user } = result;

      dispatch(loginSuccess({ token, user: user.FullName, role: user.Role }));
      await storeToken(token);
      await storeData('userInfo', user);
      
      router.replace(user.Role === 'admin' ? '/(admin-tabs)' : '/(tabs)');
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      
      if (err instanceof Yup.ValidationError) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path === 'mobileNo') newErrors.mobileNo = e.message;
          if (e.path === 'password') newErrors.password = e.message;
        });
        setErrors(newErrors);
        return;
      }

      if (err.name === 'TimeoutError' || err.message?.includes('timed out')) {
        Alert.alert('Connection Slow', 'Server is not responding. Please try again later.');
        return;
      }

      const apiResponse = err?.response?.data;
      if (apiResponse?.error && Array.isArray(apiResponse.error)) {
        const newErrors: any = {};
        apiResponse.error.forEach((e: any) => {
          const field = e.field?.toLowerCase();
          if (field === 'mobileno') newErrors.mobileNo = e.message;
          if (field === 'password') newErrors.password = e.message;
        });
        if (Object.keys(newErrors).length) {
          setErrors(newErrors);
        } else {
          Alert.alert('Login Failed', apiResponse.message || 'Invalid credentials');
        }
      } else if (apiResponse?.message) {
        Alert.alert('Login Failed', apiResponse.message);
      } else if (err.message?.includes('Network error')) {
        Alert.alert('Network Error', 'Cannot reach server. Check your API URL or internet.');
      } else {
        Alert.alert('Login Failed', err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <View style={styles.root}>
      <AnimatedBlobs />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inner, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 }]}
      >
        <LogoHeader />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back 👋</Text>
          <Text style={styles.cardSubtitle}>Sign in with your mobile number</Text>

          <FormInput
            label="Mobile Number"
            placeholder="9876543210"
            value={mobileNo}
            onChangeText={(t) => {
              setMobileNo(t);
              if (errors.mobileNo) setErrors({ ...errors, mobileNo: undefined });
            }}
            iconName="call-outline"
            error={errors.mobileNo}
          />
          <ErrorMessage message={errors.mobileNo} />

          <FormInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            iconName="lock-closed-outline"
            secureTextEntry
            error={errors.password}
          />
          <ErrorMessage message={errors.password} />

          <LoginButton loading={loading} onPress={handleLogin} />
        </View>

        <Text style={styles.footerText}>Secure · Private · Reliable</Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa' },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
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
  footerText: { textAlign: 'center', color: '#d1d5db', fontSize: 12, marginTop: 28, letterSpacing: 0.5 },
});