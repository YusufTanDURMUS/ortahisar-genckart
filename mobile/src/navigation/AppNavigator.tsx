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
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#0ea5e9', // ortahisar-blue
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
