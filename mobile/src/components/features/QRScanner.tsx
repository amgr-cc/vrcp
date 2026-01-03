import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import GenericModal from '../layout/GenericModal';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (data: string) => void;
}
export default function QRScanner({ open, setOpen, onSuccess }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // 3. スキャン完了時の処理
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    // URLかどうか簡易チェックして開く、または処理する
    if (onSuccess) {
      onSuccess(data);
    }
    setScanned(false);
  };

  return (
    <GenericModal
      open={open}
      onClose={() => setOpen(false)}
      showCloseButton={true}
      size="full"
    >
      {
        !permission || !permission.granted ? (
          <View style={styles.container}>
            <Text style={{ textAlign: 'center', marginBottom: 10 }}>
              カメラの使用許可が必要です
            </Text>
            <Button onPress={requestPermission} title="許可する" />
          </View>
        ) : (
          <View style={styles.container}>
            <CameraView
              style={styles.cameraview}
              // QRコードのみを対象にする（誤検知防止・高速化）
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              // scannedがtrueの間はイベントを発火させない
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* 画面上のガイド枠（ただのデザインです） */}
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.text}>枠内にQRコードを合わせてください</Text>
            </View>

            {/* スキャン済みの場合にリセットボタンを表示 */}
            {scanned && (
              <View style={styles.footer}>
                <Button title={"もう一度スキャン"} onPress={() => setScanned(false)} />
              </View>
            )}
          </View>
        )
      }
    </GenericModal>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    backgroundColor: '#000',
    borderColor: 'red', borderWidth: 1,
  },
  cameraview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  text: {
    color: 'white',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  }
});
