import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>📷 Kamera İzni Var mı?</Text>
          <Text style={styles.permissionSub}>
            Esnaf QR kodlarını okuyabilmek ve ödeme işlemlerini tamamlayabilmek için kamera iznine ihtiyaç duyulmaktadır.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.btnText}>İzin Ver & Başlat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLastScannedData(data);
    setLoading(true);

    try {
      // Send scanned QR code to Node.js Express API
      const response = await fetch('http://10.0.2.2:3000/api/qr/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: data, userId: 'user-demo-123' }),
      });
      const resData = await response.json();

      Alert.alert(
        '✅ Başarılı İşlem!',
        `QR Kodu: ${data}\n${resData.message || 'Ödeme başarıyla tamamlandı.'}`,
        [{ text: 'Tamam', onPress: () => setScanned(false) }]
      );
    } catch (error) {
      Alert.alert(
        'ℹ️ QR Kod Taranma Başarılı',
        `Okunan QR: ${data}\n(Backend bağlantısı yerel IP veya emulator ile test edilebilir)`,
        [{ text: 'Tamam', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📱 Esnaf & GIS Mobil</Text>
        <Text style={styles.headerSub}>React Native Expo Camera & QR</Text>
      </View>

      {/* Scanner View / Overlay */}
      <View style={styles.scannerWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
        <View style={styles.overlayFrame}>
          <View style={[styles.corner, styles.topL]} />
          <View style={[styles.corner, styles.topR]} />
          <View style={[styles.corner, styles.bottomL]} />
          <View style={[styles.corner, styles.bottomR]} />
        </View>
      </View>

      {/* Bottom Info Sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.infoTitle}>
          {scanned ? '⏳ İşlem Doğrulanıyor...' : 'QR Kodu Kare İçine Hizalayın'}
        </Text>

        {loading && <ActivityIndicator color="#6366f1" size="large" style={{ marginVertical: 10 }} />}

        {lastScannedData && (
          <Text style={styles.scannedCodeText}>Son Kod: {lastScannedData}</Text>
        )}

        {scanned && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setScanned(false)}>
            <Text style={styles.secondaryBtnText}>Tekrar Tara</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 12,
    color: '#818cf8',
    marginTop: 4,
  },
  scannerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  overlayFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    width: 30,
    height: 30,
    borderColor: '#34d399',
    position: 'absolute',
  },
  topL: { borderTopWidth: 4, borderLeftWidth: 4, top: 0, left: 0 },
  topR: { borderTopWidth: 4, borderRightWidth: 4, top: 0, right: 0 },
  bottomL: { borderBottomWidth: 4, borderLeftWidth: 4, bottom: 0, left: 0 },
  bottomR: { borderBottomWidth: 4, borderRightWidth: 4, bottom: 0, right: 0 },
  bottomSheet: {
    padding: 24,
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  scannedCodeText: {
    fontSize: 12,
    color: '#34d399',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  permissionSub: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  secondaryBtn: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtnText: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
});
