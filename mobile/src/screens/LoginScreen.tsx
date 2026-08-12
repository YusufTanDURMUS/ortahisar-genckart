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
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    setLoading(true);

    try {
      // Backend API İsteği
      const response = await fetch('http://localhost:3000/api/v1/auth/student-login', {
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
        onLoginSuccess(json.data.token, json.data.user);
      } else {
        Alert.alert('Hata', json.message || 'Giriş başarısız.');
      }
    } catch (error) {
      // Fallback for Android emulator (10.0.2.2)
      try {
        const responseEmu = await fetch('http://10.0.2.2:3000/api/v1/auth/student-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tcKn,
            birthYear: Number(birthYear),
            phoneNumber,
          }),
        });
        const jsonEmu = await responseEmu.json();
        if (jsonEmu.status === 'SUCCESS') {
          onLoginSuccess(jsonEmu.data.token, jsonEmu.data.user);
          return;
        }
      } catch (e) {}

      Alert.alert('Bağlantı Hatası', 'API sunucusuna erişilemedi.');
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
        <Text style={styles.subtitle}>
          E-Devlet onaylı Genç Kart hesabınızla giriş yapın.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="TC Kimlik Numarası"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          maxLength={11}
          value={tcKn}
          onChangeText={setTcKn}
        />

        <TextInput
          style={styles.input}
          placeholder="Doğum Yılı (Örn: 2003)"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          maxLength={4}
          value={birthYear}
          onChangeText={setBirthYear}
        />

        <TextInput
          style={styles.input}
          placeholder="Telefon Numarası (05XX...)"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          maxLength={11}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
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
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  badge: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    marginBottom: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
