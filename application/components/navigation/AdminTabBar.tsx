import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ADMIN_TAB_CONFIG = [
  { name: 'index',      label: 'Home',       icon: 'home-variant'   },
  { name: 'employee',   label: 'Employee',   icon: 'account-group'  },
  { name: 'attendance', label: 'Attendance', icon: 'calendar-check' },
  { name: 'expense',    label: 'Expense',    icon: 'receipt'        },
] as const;

function TabItem({ tab, isFocused, onPress, routeKey }: {
  tab: (typeof ADMIN_TAB_CONFIG)[number];
  isFocused: boolean;
  onPress: () => void;
  routeKey: string;
}) {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;
  const slideAnim = useRef(new Animated.Value(isFocused ? 0 : 6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: isFocused ? 1.05 : 0.92, useNativeDriver: true, friction: 7, tension: 140 }),
      Animated.spring(slideAnim, { toValue: isFocused ? 0 : 6, useNativeDriver: true, friction: 7, tension: 140 }),
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity key={routeKey} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
      <Animated.View style={[styles.iconWrap, isFocused && styles.iconWrapActive, { transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }]}>
        <MaterialCommunityIcons
          name={tab.icon as any}
          size={22}
          color={isFocused ? '#ffffff' : '#9ca3af'}
        />
      </Animated.View>
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

export default function AdminTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const tab = ADMIN_TAB_CONFIG.find((t) => t.name === route.name);
          if (!tab) return null;
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return <TabItem key={route.key} routeKey={route.key} tab={tab} isFocused={isFocused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 8,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: {
    width: 48, height: 36, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#4b5563',
    shadowColor: '#4b5563',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  tabLabelActive: { color: '#1f2937', fontWeight: '800' },
});
