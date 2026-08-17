import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Uygulama açılınca kayıtlı oturumu hatırla
  useEffect(() => {
    const checkSavedSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('user_token');
        const savedUser = await AsyncStorage.getItem('user_data');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUserData(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Oturum okunamadı', e);
      } finally {
        setLoading(false);
      }
    };

    checkSavedSession();
  }, []);

  const handleLoginSuccess = (authToken: string, user: any) => {
    setToken(authToken);
    setUserData(user);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_data');
    setToken(null);
    setUserData(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />
      {token && userData ? (
        <NavigationContainer>
          <AppNavigator user={userData} onLogout={handleLogout} />
        </NavigationContainer>
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  loadingContainer: { flex: 1, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' },
});

