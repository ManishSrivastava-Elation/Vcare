// components/Home/Header.tsx
import { clearStoredAuthData } from '@/services/auth.service';
import { logout } from '@/store/authSlice';
import { AppDispatch, RootState } from '@/store/store';
import { getData } from '@/utils/asyncStorage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const DEFAULT_AVATAR =
  'https://plus.unsplash.com/premium_photo-1677252438411-9a930d7a5168?w=600&auto=format&fit=crop&q=60';

interface HeaderProps {
  greeting: string;
}

export default function Header({ greeting }: HeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const userFromRedux = useSelector((state: RootState) => state.auth.user);
  const role = useSelector((state: RootState) => state.auth.role);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    setMenuVisible(false);
    await clearStoredAuthData();
    dispatch(logout());
    router.replace('/login');
  };

  const handleUpdatePassword = () => {
    setMenuVisible(false);
    router.push(role === 'admin' ? '/(admin-tabs)/update-password' : '/(tabs)/update-password');
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      const stored = await getData('userInfo');
      setUserInfo(stored);
    };

    loadStoredUser();
  }, [userFromRedux]);

  const displayName =
    typeof userFromRedux === 'string' && userFromRedux
      ? userFromRedux
      : userInfo && typeof userInfo === 'object'
      ? userInfo.FullName
      : userInfo || 'User';

  return (
    <View style={styles.header}>
      <View style={styles.avatarRow}>
        <View style={styles.avatarWrapper}>
          <LinearGradient colors={['#374151', '#6b7280']} style={styles.avatarRing}>
            <Image source={{ uri: DEFAULT_AVATAR }} style={styles.avatar} />
          </LinearGradient>
          <View style={styles.onlineDot} />
        </View>
        <View>
          <Text style={styles.greetingSmall}>{greeting} ✨</Text>
          <Text style={styles.greeting}>
            Hi, <Text style={styles.greetingBold}>{displayName}</Text>
          </Text>
        </View>
      </View>

      {/* Dropdown button */}
      <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
        <Ionicons name="chevron-down-outline" size={20} color="#374151" />
      </TouchableOpacity>

      {/* Custom dropdown modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleUpdatePassword}>
                <Ionicons name="key-outline" size={18} color="#374151" />
                <Text style={styles.dropdownText}>Update Password</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                <Text style={[styles.dropdownText, { color: '#dc2626' }]}>Logout</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrapper: { position: 'relative' },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  greetingSmall: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '500',
  },
  greeting: { color: '#6b7280', fontSize: 20, fontWeight: '400' },
  greetingBold: { color: '#111827', fontWeight: '800' },
  menuBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: 90, // Adjust based on your header height
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});