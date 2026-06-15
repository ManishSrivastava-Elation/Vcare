// AdminEmployee.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllEmployeesAdmin } from '../../services/admin.service';
import LoadingOverlay from '../../components/common/LoadingOverlay';

// ========================= Types =========================
interface Employee {
  EmployeeId: number;
  CompanyId: number;
  CompanyName: string;
  EmployeeCode: string;
  FullName: string;
  MobileNo: string;
  Email: string;
  IsActive: number;
  CreatedAt: string;
}

// Helper to get initials from first and last name
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  // First letter of first name + first letter of last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ========================= Main Screen =========================
const AdminEmployee: React.FC = () => {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchEmployees = async () => {
        try {
          setLoading(true);
          const response = await getAllEmployeesAdmin();
          setEmployees(response.data);
          setError(null);
        } catch (err) {
          console.error('Failed to fetch employees:', err);
          setError('Unable to load employees. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }, [])
  );

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.card}>
      {/* Top area: Avatar + Name + Code */}
      <View style={styles.topArea}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.FullName)}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{item.FullName}</Text>
          <Text style={styles.code}>{item.EmployeeCode}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Contact row: Mobile (left) and Email (right) */}
      <View style={styles.contactRow}>
        <View style={styles.contactLeft}>
          <Ionicons name="call-outline" size={16} color="#6b7280" />
          <Text style={styles.contactText}>{item.MobileNo}</Text>
        </View>
        <View style={styles.contactRight}>
          <Ionicons name="mail-outline" size={16} color="#6b7280" />
          <Text style={styles.contactText}>{item.Email}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Loading Employees..." />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.heading}>Employees</Text>
        <TouchableOpacity
          onPress={() => router.push('/add-emp' as any)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6b6d71', '#4b5563']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            <Text style={styles.addText}>Add Employee</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => window.location.reload()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Employee List */}
      {!loading && !error && (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.EmployeeId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminEmployee;

// ========================= Styles =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4b5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  code: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  contactText: {
    fontSize: 13,
    color: '#374151',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryText: {
    color: '#4b5563',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});