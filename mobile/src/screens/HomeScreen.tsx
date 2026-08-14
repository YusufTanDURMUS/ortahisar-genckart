import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
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

  // 1. Ekran Parlaklığını Otomatik %100 Yapma Modülü
  useEffect(() => {
    let initialBrightness = 0.5;

    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          initialBrightness = await Brightness.getBrightnessAsync();
          // Ekran parlaklığını maksimuma çıkar (Kamera kolay okusun)
          await Brightness.setBrightnessAsync(1.0);
        }
      } catch (err) {
        console.log('Parlaklık izni alınamadı');
      }
    })();

    // Kullanıcı bu ekrandan çıkınca parlaklığı eski haline döndür
    return () => {
      Brightness.setBrightnessAsync(initialBrightness).catch(() => {});
    };
  }, []);

  // 2. Dinamik QR Kod Oluşturma ve 60sn Yenileme
  const refreshQR = () => {
    const newQR = generateStudentQRData(user.id);
    setQrCodeData(newQR);
    setTimeLeft(60);
  };

  useEffect(() => {
    refreshQR();

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(
        now.getMilliseconds() / 10
      )
        .toString()
        .padStart(2, '0')}`;
      setCurrentTime(timeStr);

      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQR();
          return 60;
        }
        return prev - 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerBadge}>ORTAHİSAR BELEDİYESİ</Text>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.tcKn}>TC: {user.tcKn ? user.tcKn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2') : ''}</Text>
      </View>

      {/* QR Kart Alanı */}
      <View style={styles.qrCard}>
        <View style={styles.securityBar}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTimeText}>CANLI DOĞRULAMA: {currentTime}</Text>
        </View>

        <View style={styles.qrContainer}>
          {qrCodeData ? (
            <QRCode value={qrCodeData} size={Dimensions.get('window').width * 0.55} color="#0f172a" />
          ) : null}
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Yenilenmesine <Text style={styles.secondsText}>{timeLeft}</Text> saniye kaldı
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshQR}>
          <Text style={styles.refreshButtonText}>🔄 Şimdi Yenile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff', padding: 20, justifyContent: 'center' }, // sky-50
  header: { marginBottom: 30, alignItems: 'center' },
  headerBadge: { color: '#0ea5e9', fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  userName: { fontSize: 26, fontWeight: 'bold', color: '#0369a1', marginTop: 4 }, // ortahisar-blue-dark
  tcKn: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
  qrCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: '#e0f2fe' },
  securityBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#dcfce3' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  liveTimeText: { fontSize: 12, fontWeight: 'bold', color: '#16a34a' },
  qrContainer: { padding: 16, backgroundColor: '#ffffff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  timerContainer: { marginTop: 24 },
  timerText: { fontSize: 13, color: '#64748b' },
  secondsText: { fontWeight: 'bold', color: '#0ea5e9' },
  refreshButton: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f9ff', borderRadius: 12 },
  refreshButtonText: { color: '#0ea5e9', fontWeight: '700', fontSize: 14 },
  logoutButton: { marginTop: 40, alignSelf: 'center', padding: 12 },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
