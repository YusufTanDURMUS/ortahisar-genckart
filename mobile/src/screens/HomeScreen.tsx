import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';
import { generateStudentQRData } from '../utils/qr.util';

interface HomeScreenProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    tcKn: string;
  };
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, onLogout }) => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    let initialBrightness = 0.5;
    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          initialBrightness = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1.0);
        }
      } catch { /* ignore */ }
    })();
    return () => { Brightness.setBrightnessAsync(initialBrightness).catch(() => {}); };
  }, []);

  const refreshQR = () => {
    setQrCodeData(generateStudentQRData(user.id));
    setTimeLeft(60);
  };

  useEffect(() => {
    refreshQR();
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
      setTimeLeft((prev) => {
        if (prev <= 1) { refreshQR(); return 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glow orbs */}
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header with circular logo */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerBadge}>ORTAHİSAR BELEDİYESİ</Text>
          <Text style={styles.userName}>
            {user.firstName} <Text style={styles.userNameAccent}>{user.lastName}</Text>
          </Text>
          <View style={styles.tcBadge}>
            <Text style={styles.tcText}>
              TC: {user.tcKn ? user.tcKn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2') : ''}
            </Text>
          </View>
        </View>

        {/* QR Card */}
        <View style={styles.qrCard}>
          <View style={styles.securityBar}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTimeText}>CANLI DOĞRULAMA · {currentTime}</Text>
          </View>

          <View style={styles.qrContainer}>
            {qrCodeData ? (
              <QRCode
                value={qrCodeData}
                size={Dimensions.get('window').width * 0.54}
                color="#060b11"
                backgroundColor="#ffffff"
              />
            ) : null}
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Yenilenmesine <Text style={styles.secondsText}>{timeLeft}</Text> saniye kaldı
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={refreshQR} activeOpacity={0.8}>
            <Text style={styles.refreshButtonText}>🔄 Şimdi Yenile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060d13' },
  content: { padding: 20, paddingTop: 48, paddingBottom: 40, alignItems: 'center' },

  glowOrbTop: { position: 'absolute', top: -100, left: -60, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(6, 182, 212, 0.1)' },
  glowOrbBottom: { position: 'absolute', bottom: -100, right: -60, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(20, 184, 166, 0.1)' },

  header: { marginBottom: 20, alignItems: 'center' },
  logoBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff', padding: 1, borderWidth: 2, borderColor: 'rgba(34, 211, 238, 0.8)', shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 12, elevation: 8, marginBottom: 10, overflow: 'hidden' },
  logoImg: { width: '100%', height: '100%' },
  headerBadge: { color: '#22d3ee', fontSize: 11, fontWeight: '800', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 4 },
  userName: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  userNameAccent: { color: '#22d3ee' },
  tcBadge: { marginTop: 8, backgroundColor: '#0e1720', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  tcText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  qrCard: { width: '100%', maxWidth: 380, backgroundColor: 'rgba(14, 23, 32, 0.95)', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  securityBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.12)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.25)' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10b981', marginRight: 8 },
  liveTimeText: { fontSize: 11, fontWeight: '800', color: '#10b981', letterSpacing: 1 },
  qrContainer: { padding: 16, backgroundColor: '#ffffff', borderRadius: 20, shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  timerContainer: { marginTop: 20 },
  timerText: { fontSize: 13, color: '#94a3b8' },
  secondsText: { fontWeight: 'bold', color: '#22d3ee' },
  refreshButton: { marginTop: 14, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#070d14', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' },
  refreshButtonText: { color: '#22d3ee', fontWeight: '700', fontSize: 13 },

  logoutButton: { marginTop: 28, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)' },
  logoutText: { color: '#f87171', fontSize: 14, fontWeight: '700' },
});
