import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Barcode from 'react-native-barcode-svg';
import * as Brightness from 'expo-brightness';
import { generateStudentQRData } from '../utils/qr.util';

interface CardScreenProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    tcKn: string;
    isEligible?: boolean;
    statusReason?: string;
    revokedNote?: string;
  };
}

export const CardScreen: React.FC<CardScreenProps> = ({ user }) => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentTime, setCurrentTime] = useState('');
  const [codeType, setCodeType] = useState<'QR' | 'BARCODE'>('QR');

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

  // 2. Dinamik Kod Oluşturma ve 60sn Yenileme
  const refreshQR = () => {
    const newQR = generateStudentQRData(user.id);
    setQrCodeData(newQR);
    setTimeLeft(60);
  };

  useEffect(() => {
    refreshQR();

    const clockInterval = setInterval(() => {
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
    }, 100);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQR();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(timerInterval);
    };
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

      {user.isEligible === false ? (
        <View style={styles.disabledContainer}>
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Genç Kartınız Pasif Durumda</Text>
            <Text style={styles.warningReason}>{user.revokedNote || user.statusReason || 'Şartları sağlamıyorsunuz.'}</Text>
            <Text style={styles.warningHelp}>
              Bilgilerinizde bir hata olduğunu düşünüyorsanız lütfen E-Devlet üzerindeki kayıtlarınızı kontrol ediniz.
            </Text>
          </View>
        </View>
      ) : (
        <>
          {/* Geçiş Butonları */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, codeType === 'QR' && styles.activeBtn]}
              onPress={() => setCodeType('QR')}>
              <Text style={codeType === 'QR' ? styles.activeText : styles.inactiveText}>QR Kod</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, codeType === 'BARCODE' && styles.activeBtn]}
              onPress={() => setCodeType('BARCODE')}>
              <Text style={codeType === 'BARCODE' ? styles.activeText : styles.inactiveText}>Çizgi Barkod</Text>
            </TouchableOpacity>
          </View>

          {/* QR / Barkod Kart Alanı */}
          <View style={styles.qrCard}>
            <View style={styles.securityBar}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTimeText}>CANLI DOĞRULAMA: {currentTime}</Text>
            </View>

            <View style={styles.qrContainer}>
              {qrCodeData ? (
                codeType === 'QR' ? (
                  <QRCode value={qrCodeData} size={Dimensions.get('window').width * 0.55} color="#0f172a" />
                ) : (
                  <Barcode 
                    value={user.tcKn ? user.tcKn : "11111111110"} 
                    format="CODE128" 
                    maxWidth={260} 
                    height={90} 
                    singleBarWidth={2}
                    lineColor="#0f172a"
                    backgroundColor="#ffffff"
                  />
                )
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff', padding: 20, justifyContent: 'center' },
  header: { marginBottom: 20, alignItems: 'center' },
  headerBadge: { color: '#0ea5e9', fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  userName: { fontSize: 26, fontWeight: 'bold', color: '#0369a1', marginTop: 4 },
  tcKn: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e0f2fe', borderRadius: 12, padding: 4, marginBottom: 24, marginHorizontal: 20, borderWidth: 1, borderColor: '#bae6fd' },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeBtn: { backgroundColor: '#ffffff', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  activeText: { color: '#0369a1', fontWeight: 'bold' },
  inactiveText: { color: '#0ea5e9', fontWeight: 'bold' },

  qrCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: '#e0f2fe' },
  securityBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: '#dcfce3' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  liveTimeText: { fontSize: 12, fontWeight: 'bold', color: '#16a34a' },
  qrContainer: { padding: 16, backgroundColor: '#ffffff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, minHeight: 120, justifyContent: 'center', alignItems: 'center', width: '100%' },
  timerContainer: { marginTop: 24 },
  timerText: { fontSize: 13, color: '#64748b' },
  secondsText: { fontWeight: 'bold', color: '#0ea5e9' },
  refreshButton: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#f0f9ff', borderRadius: 12 },
  refreshButtonText: { color: '#0ea5e9', fontWeight: '700', fontSize: 14 },

  disabledContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 10, marginTop: 20 },
  warningBox: { backgroundColor: '#fef2f2', borderColor: '#fca5a5', borderWidth: 1, padding: 24, borderRadius: 24, alignItems: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
  warningTitle: { fontSize: 18, fontWeight: 'bold', color: '#991b1b', marginBottom: 12 },
  warningReason: { fontSize: 16, color: '#b91c1c', textAlign: 'center', fontWeight: '600', marginBottom: 16 },
  warningHelp: { fontSize: 13, color: '#7f1d1d', textAlign: 'center', opacity: 0.9, lineHeight: 18 },
});
