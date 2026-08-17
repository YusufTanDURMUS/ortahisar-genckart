import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
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
    schoolName?: string;
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
          await Brightness.setBrightnessAsync(1.0);
        }
      } catch (err) {
        console.log('Parlaklık izni alınamadı');
      }
    })();

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerBadge}>TRABZON ORTAHİSAR BELEDİYESİ</Text>
        <Text style={styles.userName}>
          {user.firstName} <Text style={styles.userNameAccent}>{user.lastName}</Text>
        </Text>
        <View style={styles.tcBadge}>
          <Text style={styles.tcKn}>
            TC: {user.tcKn ? user.tcKn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2') : ''}
          </Text>
        </View>
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
              onPress={() => setCodeType('QR')}
              activeOpacity={0.8}
            >
              <Text style={codeType === 'QR' ? styles.activeText : styles.inactiveText}>📱 QR Kod</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, codeType === 'BARCODE' && styles.activeBtn]}
              onPress={() => setCodeType('BARCODE')}
              activeOpacity={0.8}
            >
              <Text style={codeType === 'BARCODE' ? styles.activeText : styles.inactiveText}>🏷️ Çizgi Barkod</Text>
            </TouchableOpacity>
          </View>

          {/* QR / Barkod Kart Alanı */}
          <View style={styles.qrCard}>
            <View style={styles.securityBar}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTimeText}>CANLI DOĞRULAMA · {currentTime}</Text>
            </View>

            <View style={styles.qrContainer}>
              {qrCodeData ? (
                codeType === 'QR' ? (
                  <QRCode value={qrCodeData} size={Dimensions.get('window').width * 0.52} color="#0f172a" backgroundColor="#ffffff" />
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
                Kodun yenilenmesine <Text style={styles.secondsText}>{timeLeft}</Text> saniye kaldı
              </Text>
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={refreshQR} activeOpacity={0.8}>
              <Text style={styles.refreshButtonText}>🔄 Şimdi Yenile</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Info Note */}
          <Text style={styles.bottomNote}>
            🌊 Anlaşmalı Ortahisar esnaflarında ödeme yaparken kodu gösteriniz.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff', padding: 20, justifyContent: 'center' },
  
  header: { marginBottom: 16, alignItems: 'center', zIndex: 1 },
  logoBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff', padding: 2, borderWidth: 2, borderColor: '#38bdf8', alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: '#0284c7', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  logoImg: { width: '100%', height: '100%' },
  headerBadge: { color: '#0369a1', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  userNameAccent: { color: '#0284c7' },
  tcBadge: { backgroundColor: '#e0f2fe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#bae6fd', marginTop: 6 },
  tcKn: { fontSize: 12, color: '#0369a1', fontWeight: '700', fontVariant: ['tabular-nums'] },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, padding: 4, marginBottom: 18, marginHorizontal: 20, borderWidth: 1, borderColor: '#e2e8f0', zIndex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeBtn: { backgroundColor: '#0284c7', shadowColor: '#0284c7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  activeText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  inactiveText: { color: '#64748b', fontWeight: '700', fontSize: 13 },

  qrCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 22, alignItems: 'center', shadowColor: '#0284c7', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6, borderWidth: 1, borderColor: '#e0f2fe', zIndex: 1 },
  securityBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginBottom: 18, borderWidth: 1, borderColor: '#bbf7d0' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a', marginRight: 8 },
  liveTimeText: { fontSize: 11, fontWeight: '800', color: '#15803d', letterSpacing: 0.8 },
  qrContainer: { padding: 14, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, minHeight: 120, justifyContent: 'center', alignItems: 'center', width: '100%' },
  timerContainer: { marginTop: 18 },
  timerText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  secondsText: { fontWeight: '800', color: '#0284c7' },
  refreshButton: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 22, backgroundColor: '#f0f9ff', borderRadius: 14, borderWidth: 1, borderColor: '#bae6fd' },
  refreshButtonText: { color: '#0369a1', fontWeight: '800', fontSize: 13 },

  bottomNote: { marginTop: 16, fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: '500' },

  disabledContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 10, marginTop: 20, zIndex: 1 },
  warningBox: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 24, borderRadius: 24, alignItems: 'center' },
  warningTitle: { fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 },
  warningReason: { fontSize: 16, color: '#ef4444', textAlign: 'center', fontWeight: '600', marginBottom: 16 },
  warningHelp: { fontSize: 13, color: '#f87171', textAlign: 'center', opacity: 0.9, lineHeight: 18 },
});
