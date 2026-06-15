import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AdminTabBar from '@/components/navigation/AdminTabBar';

export default function AdminLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f0f0f0" />
      <Tabs
        tabBar={(props) => <AdminTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Dashboard' }}
        />
        <Tabs.Screen
          name="employee"
          options={{ title: 'Employee' }}
        />
        <Tabs.Screen name="attendance" options={{ title: 'Attendance' }} />
        <Tabs.Screen name="expense" options={{ title: 'Expense' }} />
        <Tabs.Screen name="update-password" options={{ href: null }} />
      </Tabs>
    </>
  );
}
