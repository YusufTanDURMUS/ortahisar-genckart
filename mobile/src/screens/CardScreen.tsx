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
      {/* Background glowing orbs simulation */}
      <View style={styles.glowOrbTop} />
      <View style={styles.glowOrbBottom} />

      <View style={styles.header}>
        <Text style={styles.headerBadge}>ORTAHİSAR BELEDİYESİ</Text>
        <Text style={styles.userName}>
          {user.firstName} <Text style={styles.userNameAccent}>{user.lastName}</Text>
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
                  <QRCode value={qrCodeData} size={Dimensions.get('window').width * 0.55} color="#060b11" backgroundColor="#ffffff" />
                ) : (
                  <Barcode 
                    value={user.tcKn ? user.tcKn : "11111111110"} 
                    format="CODE128" 
                    maxWidth={260} 
                    height={90} 
                    singleBarWidth={2}
                    lineColor="#060b11"
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
  container: { flex: 1, backgroundColor: '#f0f7ff', padding: 20, justifyContent: 'center' },
  glowOrbTop: { display: 'none', position: 'absolute', top: 0, left: 0, width: 0, height: 0 },
  glowOrbBottom: { display: 'none', position: 'absolute', bottom: 0, right: 0, width: 0, height: 0 },
  header: { marginBottom: 20, alignItems: 'center', zIndex: 1 },
  headerBadge: { color: '#1a7ec8', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  userName: { fontSize: 28, fontWeight: '900', color: '#1e3a5f', marginTop: 4 },
  userNameAccent: { color: '#1a7ec8' },
  tcKn: { fontSize: 14, color: '#64748b', marginTop: 8, fontWeight: '500', backgroundColor: '#e8f4fd', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#c2ddf0' },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, padding: 4, marginBottom: 24, marginHorizontal: 20, borderWidth: 1, borderColor: '#c2ddf0', zIndex: 1 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeBtn: { backgroundColor: '#1a7ec8', shadowColor: '#1a7ec8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  activeText: { color: '#ffffff', fontWeight: 'bold' },
  inactiveText: { color: '#94a3b8', fontWeight: 'bold' },

  qrCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#1a7ec8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6, borderWidth: 1, borderColor: '#c2ddf0', zIndex: 1 },
  securityBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f4fd', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#c2ddf0' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  liveTimeText: { fontSize: 12, fontWeight: 'bold', color: '#1a7ec8', letterSpacing: 1 },
  qrContainer: { padding: 16, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 2, borderColor: '#e8f4fd', shadowColor: '#1a7ec8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, minHeight: 120, justifyContent: 'center', alignItems: 'center', width: '100%' },
  timerContainer: { marginTop: 24 },
  timerText: { fontSize: 13, color: '#64748b' },
  secondsText: { fontWeight: 'bold', color: '#1a7ec8' },
  refreshButton: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#e8f4fd', borderRadius: 16, borderWidth: 1.5, borderColor: '#c2ddf0' },
  refreshButtonText: { color: '#1a7ec8', fontWeight: '700', fontSize: 14 },

  disabledContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 10, marginTop: 20, zIndex: 1 },
  warningBox: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 24, borderRadius: 24, alignItems: 'center' },
  warningTitle: { fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 },
  warningReason: { fontSize: 16, color: '#ef4444', textAlign: 'center', fontWeight: '600', marginBottom: 16 },
  warningHelp: { fontSize: 13, color: '#f87171', textAlign: 'center', opacity: 0.9, lineHeight: 18 },
});

