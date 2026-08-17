import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any, role: 'student' | 'merchant') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [tcKn, setTcKn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!tcKn.trim() || !password) {
      setError('Lütfen TC Kimlik Numarası ve Şifrenizi girin.');
      return;
    }

    if (tcKn.trim().length !== 11) {
      setError('TC Kimlik Numarası 11 haneli olmalıdır.');
      return;
    }

    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          identifier: tcKn.trim(),
          tcKn: tcKn.trim(),
          password: password,
        }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        const studentUser = data.data.student || data.data.user;
        const authToken = data.data.token;

        await AsyncStorage.setItem('user_token', authToken);
        await AsyncStorage.setItem('user_data', JSON.stringify(studentUser));

        onLoginSuccess(authToken, studentUser, 'student');
      } else {
        setError(data.message || 'Giriş bilgileri hatalı. Lütfen kontrol edin.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Sunucu yanıt vermedi (Zaman aşımı). Bilgisayar ve telefonunuzun aynı Wi-Fi ağına bağlı olduğundan emin olun.');
      } else {
        setError('Sunucuya bağlanılamadı. Bilgisayarınız ve telefonunuzun aynı Wi-Fi ağına bağlı olduğundan emin olun.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background glow orbs */}
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Login Card */}
        <View style={styles.card}>
          
          {/* Logo with Glow */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.badgeText}>TRABZON ORTAHİSAR BELEDİYESİ</Text>
          <Text style={styles.cardTitle}>Genç Kart Portalı</Text>
          <Text style={styles.subtitle}>
            Boztepe’den Ganita’ya Gençliğin Şehri Trabzon
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* TC Kimlik No Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TC KİMLİK NUMARASI</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="11 haneli TC kimlik no"
                placeholderTextColor="#94a3b8"
                value={tcKn}
                onChangeText={setTcKn}
                keyboardType="numeric"
                maxLength={11}
                autoCapitalize="none"
              />
              {tcKn.length === 11 && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </View>
          </View>

          {/* Şifre Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ŞİFRE</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Gizle' : 'Göster'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Giriş Yapılıyor...' : 'Genç Kart’a Giriş Yap'}
            </Text>
          </TouchableOpacity>

          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Gençlik Hizmetleri · v2.2</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          © 2026 Trabzon Ortahisar Belediyesi · Akıllı Şehir
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 16 },

  glowOrbTop: { position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(56, 189, 248, 0.25)' },
  glowOrbBottom: { position: 'absolute', bottom: -80, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(20, 184, 166, 0.2)' },

  // Card
  card: { width: '100%', maxWidth: 380, backgroundColor: '#ffffff', borderRadius: 28, padding: 26, borderWidth: 1, borderColor: '#e0f2fe', shadowColor: '#0284c7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 6, alignItems: 'center' },

  // Logo
  logoWrapper: { position: 'relative', marginBottom: 14, alignItems: 'center', justifyContent: 'center' },
  logoGlow: { position: 'absolute', width: 104, height: 104, borderRadius: 52, backgroundColor: 'rgba(56, 189, 248, 0.25)' },
  logoContainer: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#ffffff', padding: 2, borderWidth: 2, borderColor: '#38bdf8', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  logoImage: { width: '100%', height: '100%' },

  badgeText: { color: '#0369a1', fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 18, textAlign: 'center' },

  // Error
  errorBox: { width: '100%', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, padding: 10, marginBottom: 14 },
  errorText: { color: '#dc2626', fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Inputs
  inputGroup: { width: '100%', marginBottom: 14 },
  label: { fontSize: 9, fontWeight: '800', color: '#475569', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  inputWrapper: { position: 'relative', width: '100%', justifyContent: 'center' },
  input: { width: '100%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a', fontWeight: '500' },
  checkIcon: { position: 'absolute', right: 14, color: '#10b981', fontSize: 15, fontWeight: 'bold' },
  eyeBtn: { position: 'absolute', right: 12, paddingHorizontal: 6, paddingVertical: 4 },
  eyeText: { color: '#0284c7', fontSize: 11, fontWeight: '700' },

  // Button
  loginBtn: { width: '100%', backgroundColor: '#0284c7', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 10, shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  // Status
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  statusText: { fontSize: 11, color: '#64748b', fontWeight: '600' },

  footer: { marginTop: 24, fontSize: 11, color: '#64748b', textAlign: 'center' },
});
