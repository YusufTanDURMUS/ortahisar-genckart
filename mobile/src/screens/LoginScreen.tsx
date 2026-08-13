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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface LoginScreenProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [tcKn, setTcKn] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!tcKn || !birthYear || !phoneNumber) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tcKn,
          birthYear: Number(birthYear),
          phoneNumber,
        }),
      });

      const json = await response.json();

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
          placeholder="TC Kimlik Numarası"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          maxLength={11}
          value={tcKn}
          onChangeText={setTcKn}
        />

        <TextInput
          style={styles.input}
          placeholder="Doğum Yılı (Örn: 2003)"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          maxLength={4}
          value={birthYear}
          onChangeText={setBirthYear}
        />

        <TextInput
          style={styles.input}
          placeholder="Telefon Numarası (05XX...)"
          placeholderTextColor="#64748b"
          keyboardType="phone-pad"
          maxLength={11}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Genç Kartımı Getir</Text>
          )}
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
});
