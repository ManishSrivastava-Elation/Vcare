import { store, persistor } from '@/store/store';
import type { RootState } from '@/store/store';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

function AuthGuard() {
  const token = useSelector((state: RootState) => state.auth.token);
  const role = useSelector((state: RootState) => state.auth.role);
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;

    const inTabs = segments[0] === '(tabs)';
    const inAdminTabs = segments[0] === '(admin-tabs)';
    const inAuth = segments[0] === 'login';
    const inProtected = inTabs || inAdminTabs;

    if (!token) {
      if (!inAuth) router.replace('/login');
      return;
    }

    // Allow any root-level screen for logged-in users (add-emp, etc.)
    if (!inProtected && !inAuth) return;

    // Logged in — redirect to correct dashboard
    if (role === 'admin') {
      if (!inAdminTabs) router.replace('/(admin-tabs)');
    } else {
      if (!inTabs) router.replace('/(tabs)');
    }
  }, [token, role, segments, navState?.key]);

  return null;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AuthGuard />
        <StatusBar style="dark" backgroundColor="#f0f0f0" />
        <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin-tabs)" />
          <Stack.Screen name="add-emp" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
