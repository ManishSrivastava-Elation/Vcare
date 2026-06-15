import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import CustomTabBar from '@/components/navigation/CustomTabBar';

export default function TabLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#f0f0f0" />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // Background color matches the purple theme
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Home' }}
        />
        <Tabs.Screen
          name="attendance"
          options={{ title: 'Attendance' }}
        />
        <Tabs.Screen
          name="expense"
          options={{ title: 'Expense' }}
        />
        <Tabs.Screen
          name="update-password"
          options={{ href: null, headerShown: false }}
        />
      </Tabs>
    </>
  );
}