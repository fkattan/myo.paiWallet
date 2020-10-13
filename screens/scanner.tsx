import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Vibration } from 'react-native';
import { BarCodeEvent, BarCodeScannedCallback, BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned:BarCodeScannedCallback = (params:BarCodeEvent):void => {

    if(scanned === true) return; 

    const { type, data } = params;
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);

    setScanned(true);

    Vibration.vibrate();
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
      <View style={{flex: 0.6}}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={[StyleSheet.absoluteFillObject, styles.container]}
        >
          <View style={styles.legendContainer}><Text style={styles.legend}>Scan QR Code</Text></View>
          <View style={styles.boundingBox} />
          <View style={{flex: 1}}/>
        </BarCodeScanner>
      </View>

      <View style={{flex: 0.4}}>
        {scanned ? (
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
        ):(
          <Button title={'Scanning'} disabled={true} onPress={() => {}} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },

  boundingBox: {
    flex: 2,
    alignSelf: 'center',
    borderRadius: 8,
    borderColor: 'orange', 
    borderWidth: 2, 
    width: '60%'
  },

  legendContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  legend: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 15
  }
})