import AnimatedBlobs from '@/components/Auth/AnimatedBlobs';
import { InputField } from '@/components/common/InputField';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { createEmployee } from '../services/auth.service';

// Validation schema
export const employeeSchema = Yup.object({
  employeeCode: Yup.string()
    .trim()
    .min(3, "Employee code must be at least 3 characters")
    .max(20, "Employee code cannot exceed 20 characters")
    .matches(/^[A-Za-z0-9_-]+$/, "Only letters, numbers, _ and - allowed")
    .required("Employee code is required"),

  fullName: Yup.string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .matches(/^[A-Za-z\s]+$/, "Only alphabets and spaces allowed")
    .required("Full name is required"),

  mobileNo: Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number")
    .required("Mobile number is required"),

  email: Yup.string()
    .trim()
    .lowercase()
    .email("Invalid email format")
    .max(100, "Email too long")
    .required("Email is required"),

  password: Yup.string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password too long")
    .matches(/[A-Z]/, "At least one uppercase letter required")
    .matches(/[a-z]/, "At least one lowercase letter required")
    .matches(/[0-9]/, "At least one number required")
    .matches(/[@$!%*?&]/, "At least one special character required")
    .required("Password is required"),
});

const DEFAULT_COMPANY_ID = 1;

export default function AddEmployeeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Form state
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  // Refs
  const employeeCodeRef = useRef<TextInput>(null);
  const fullNameRef = useRef<TextInput>(null);
  const mobileNoRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const clearError = (key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const resetForm = () => {
    setEmployeeCode('');
    setFullName('');
    setMobileNo('');
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    try {
      await employeeSchema.validate(
        { employeeCode, fullName, mobileNo, email, password },
        { abortEarly: false }
      );
      setErrors({});
    } catch (err: any) {
      // Vibration.vibrate(100);
      if (err.inner) {
        const newErrors: any = {};
        err.inner.forEach((e: any) => {
          if (e.path) newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      }
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const data = await createEmployee({
        CompanyId: DEFAULT_COMPANY_ID,
        EmployeeCode: employeeCode,
        FullName: fullName,
        MobileNo: mobileNo,
        Email: email,
        Password: password,
      });

      if (data?.success && data?.statusCode === 201) {
        // Vibration.vibrate(50);
        Alert.alert('Success', 'Employee added successfully!', [
          { text: 'OK', onPress: () => { resetForm(); router.back(); } },
        ]);
      }
    } catch (error: any) {
      const data = error?.response?.data;

      if (data?.statusCode === 409) {
        // e.g. Email already exists
        setErrors({ email: data.message });
      } else if (data?.statusCode === 400 && Array.isArray(data?.error)) {
        // Validation errors from API — map field names to form keys
        const fieldMap: Record<string, string> = {
          EmployeeCode: 'employeeCode',
          FullName: 'fullName',
          MobileNo: 'mobileNo',
          Email: 'email',
          Password: 'password',
        };
        const apiErrors: Record<string, string> = {};
        data.error.forEach((e: { field: string; message: string }) => {
          const key = fieldMap[e.field] ?? e.field;
          apiErrors[key] = e.message;
        });
        setErrors(apiErrors);
      } else {
        Alert.alert('Error', data?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: '#ffffff' }]}>
      <AnimatedBlobs />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Employee</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <Text style={styles.cardSubtitle}>Register a new team member</Text>

            <InputField
              label="Employee Code"
              placeholder="e.g. EMP101"
              value={employeeCode}
              onChangeText={(text) => {
                setEmployeeCode(text);
                clearError('employeeCode');
              }}
              iconName="id-card-outline"
              returnKeyType="next"
              onSubmitEditing={() => fullNameRef.current?.focus()}
              error={errors.employeeCode}
              ref={employeeCodeRef}
            />

            <InputField
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearError('fullName');
              }}
              iconName="person-outline"
              returnKeyType="next"
              onSubmitEditing={() => mobileNoRef.current?.focus()}
              error={errors.fullName}
              ref={fullNameRef}
            />

            <InputField
              label="Mobile Number"
              placeholder="10 digit number"
              value={mobileNo}
              onChangeText={(text) => {
                setMobileNo(text);
                clearError('mobileNo');
              }}
              iconName="call-outline"
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.mobileNo}
              ref={mobileNoRef}
            />

            <InputField
              label="Email Address"
              placeholder="e.g. rahul@company.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError('email');
              }}
              iconName="mail-outline"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.email}
              ref={emailRef}
            />

            <InputField
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError('password');
              }}
              iconName="lock-closed-outline"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              error={errors.password}
              ref={passwordRef}
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 12 }}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  animateButton();
                  handleSubmit();
                }}
                disabled={loading}
                style={styles.saveButton}
              >
                <LinearGradient
                  colors={['#9ca3af', '#4b5563']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.saveButtonText}>Register Employee</Text>
                      <Ionicons name="person-add-outline" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingTop: 10,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 28,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#4b5563',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});