import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
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

  // 1. QR Kod Üret ve Her 60 Saniyede Bir Yenile
  const refreshQR = () => {
    const newQR = generateStudentQRData(user.id);
    setQrCodeData(newQR);
    setTimeLeft(60);
  };

  useEffect(() => {
    refreshQR(); // Ekran ilk açıldığında QR üret

    // Her saniye çalışan timer (Geri sayım ve Canlı Saat)
    const interval = setInterval(() => {
      // Canlı Akar Saat (SS Engelleme Güvenliği)
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

      // Geri Sayım
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
      {/* Üst Bilgi Kartı */}
      <View style={styles.header}>
        <Text style={styles.headerBadge}>ORTAHİSAR BELEDİYESİ</Text>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.tcKn}>TC: {user.tcKn ? user.tcKn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2') : '***'}</Text>
      </View>

      {/* QR Kod / Güvenlik Kartı */}
      <View style={styles.qrCard}>
        {/* Güvenlik Bandı (Canlı Akan Saat) */}
        <View style={styles.securityBar}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTimeText}>CANLI DOĞRULAMA: {currentTime}</Text>
        </View>

        {/* QR Kod */}
        <View style={styles.qrContainer}>
          {qrCodeData ? (
            <QRCode value={qrCodeData} size={Dimensions.get('window').width * 0.55} color="#0f172a" />
          ) : null}
        </View>

        {/* Geri Sayım Bilgisi */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            QR Kodun Yenilenmesine <Text style={styles.secondsText}>{timeLeft}</Text> saniye kaldı
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshQR}>
          <Text style={styles.refreshButtonText}>🔄 Şimdi Yenile</Text>
        </TouchableOpacity>
      </View>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerBadge: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  tcKn: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  securityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  liveTimeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timerContainer: {
    marginTop: 20,
  },
  timerText: {
    fontSize: 13,
    color: '#64748b',
  },
  secondsText: {
    fontWeight: 'bold',
    color: '#0284c7',
  },
  refreshButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  refreshButtonText: {
    color: '#0284c7',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 30,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
