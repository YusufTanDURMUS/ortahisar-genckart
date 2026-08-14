import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface LoginScreenProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen Kullanıcı Adı ve Şifrenizi giriniz.');
      return;
    }

    setLoading(true);

    try {
      let endpoint = `${API_BASE_URL}/auth/student-login`;
      let requestBody: any = { identifier, password };

      if (identifier.includes('@')) {
        // Try merchant first
        endpoint = `${API_BASE_URL}/auth/merchant-login`;
        requestBody = { email: identifier, password };
      }

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      let json = await response.json();

      // If merchant failed with unauthorized, try admin
      if (identifier.includes('@') && json.status === 'FAILED' && json.message === 'Yetkisiz giriş.') {
        endpoint = `${API_BASE_URL}/auth/admin-login`;
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        json = await response.json();
      }

      if (json.status === 'SUCCESS') {
        const { token, user } = json.data;
        // Oturumu cihaza kaydet
        await AsyncStorage.setItem('user_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        onLoginSuccess(token, user);
      } else {
        Alert.alert('Giriş Başarısız', json.message || 'Genç Kart kaydınız bulunamadı.');
      }
    } catch (error) {
      Alert.alert('Bağlantı Hatası', 'Belediye sunucusuna bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.badge}>TRABZON / ORTAHİSAR BELEDİYESİ</Text>
        <Text style={styles.title}>Genç Kart Mobil</Text>
        <Text style={styles.subtitle}>E-Devlet onaylı Genç Kart hesabınızla hemen giriş yapın.</Text>

        <TextInput
          style={styles.input}
          placeholder="TC, Telefon veya E-posta"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType={identifier.includes('@') ? 'email-address' : 'default'}
          value={identifier}
          onChangeText={setIdentifier}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => Linking.openURL('https://onlineislemler.trabzonortahisar.bel.tr/omis/?_gl=1*nhy6tn*_ga*MTI2ODczMDc3MC4xNzg2MzQ4NDU2*_ga_PYJE9NBWR5*czE3ODY2OTIyMzAkbzYkZzEkdDE3ODY2OTIyNTAkajQwJGwwJGgw#/login')}
        >
          <Text style={styles.linkText}>Hesabınız yok mu? İnternet Şubesinden Kayıt Olun</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155' },
  badge: { color: '#38bdf8', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 20, marginTop: 2 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#ffffff', marginBottom: 12, borderWidth: 1, borderColor: '#334155', fontSize: 15 },
  button: { backgroundColor: '#0284c7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  linkButton: { marginTop: 16, alignItems: 'center', padding: 8 },
  linkText: { color: '#38bdf8', fontSize: 14, fontWeight: '600' },
});
