import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { CardScreen } from '../screens/CardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MerchantScannerScreen } from '../screens/MerchantScannerScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';

const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  user: any;
  onLogout: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ user, onLogout }) => {
  // Admin Akışı
  if (user.role === 'ADMIN') {
    return <AdminDashboardScreen user={user} onLogout={onLogout} />;
  }

  // Esnaf Akışı
  if (user.role === 'MERCHANT') {
    return <MerchantScannerScreen user={user} onLogout={onLogout} />;
  }

  // Öğrenci Akışı (Varsayılan)
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen
        name="Discover"
        options={{ tabBarLabel: '📍 Keşfet' }}
      >
        {() => <DiscoverScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Card"
        options={{ tabBarLabel: '💳 Kartım' }}
      >
        {() => <CardScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{ tabBarLabel: '👤 Profil' }}
      >
        {() => <ProfileScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
