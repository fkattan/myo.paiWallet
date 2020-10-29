import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Vibration, Dimensions, Platform } from 'react-native';
import { BarCodeEvent, BarCodeScannedCallback, BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import * as Svg from 'react-native-svg';


type ScannerParams = {
  navigation:any,
  route: any
}


export default function ScanQR({route, navigation}:ScannerParams) {

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [canvas, setCanvas] = useState<{width:any, height:any}>();

  const BUTTON_COLOR = Platform.OS === 'ios' ? '#fff' : '#FF0000';


  // Fetch permission to use camera if needed
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

  }, []);

  // Clean Scan State on Focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        setScanned(false);
    });

    return unsubscribe;
  }, [navigation]);


  // If scan is an ethereum address; then proceed to payment screen with that receiver
  // TODO: Map Addresses to names in custom ethereum ENS on L2.
  const handleBarCodeScanned:BarCodeScannedCallback = (params:BarCodeEvent):void => {

    if(scanned === true) return; // Prevent multiple scans 

    const { type, data } = params;

    if(data.startsWith("ethereum:")) {
      setScanned(true);
      Vibration.vibrate();
      navigation.navigate("pay", {recipient: data.replace(/^ethereum:/i, "").trim()});
    } else {
      setScanned(false);
    }
  };

  const setCanvasDimension = ({nativeEvent: { layout }}:any) => {
    setCanvas({width: layout.width, height: layout.height});
  };

  const renderTargetArea = () => {

    if(!canvas) return "";

    const centerX = canvas.width / 2
    const centerY = canvas.height / 3
    const size = 112;
    const stroke = scanned ? "#00FF00AF" : "#FFFFFFAF";
    const strokeWidth = 4;

    const strokeCenter = scanned ? "#00FF00AF" : "#FFFFFFAF";
    const strokeWidthCenter = 3;

    return(
      <>
        <Svg.Line
          x1={centerX-size}
          y1={centerY-size}
          x2={centerX-size + 10}
          y2={centerY-size}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Svg.Line
          x1={centerX-size}
          y1={centerY-size}
          x2={centerX-size}
          y2={centerY-size + 10}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Svg.Line
          x1={centerX+size}
          y1={centerY-size}
          x2={centerX+size - 10}
          y2={centerY-size}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Svg.Line
          x1={centerX+size}
          y1={centerY-size}
          x2={centerX+size}
          y2={centerY-size + 10}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Svg.Line
          x1={centerX+size}
          y1={centerY+size}
          x2={centerX+size}
          y2={centerY+size - 10}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Svg.Line
          x1={centerX+size}
          y1={centerY+size}
          x2={centerX+size - 10}
          y2={centerY+size}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Svg.Line
          x1={centerX-size}
          y1={centerY+size}
          x2={centerX-size}
          y2={centerY+size - 10}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Svg.Line
          x1={centerX-size}
          y1={centerY+size}
          x2={centerX-size + 10}
          y2={centerY+size}
          stroke={stroke}
          strokeWidth={strokeWidth}
            strokeLinecap="round"
        />

          <Svg.Line
            x1={centerX - 12}
            y1={centerY}
            x2={centerX - 8}
            y2={centerY}
            stroke={strokeCenter}
            strokeWidth={strokeWidthCenter}
          />
          <Svg.Line
            x1={centerX + 12}
            y1={centerY}
            x2={centerX + 8}
            y2={centerY}
            stroke={strokeCenter}
            strokeWidth={strokeWidthCenter}
          />

          <Svg.Line
            x1={centerX}
            y1={centerY - 12}
            x2={centerX}
            y2={centerY - 8}
            stroke={strokeCenter}
            strokeWidth={strokeWidthCenter}
          />

          <Svg.Line
            x1={centerX}
            y1={centerY + 12}
            x2={centerX}
            y2={centerY + 8}
            stroke={strokeCenter}
            strokeWidth={strokeWidthCenter}
          />
      </>

    );

  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onLayout={setCanvasDimension}
        onBarCodeScanned={handleBarCodeScanned}
        style={{
          width: Dimensions.get('screen').width,
          height: Dimensions.get('screen').height}}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />           
      {canvas && (
        <Svg.Svg height={canvas.height} width={canvas.width} style={styles.svg}>

          {renderTargetArea()}

        </Svg.Svg>
      )}

      <View style={styles.toolbar}>
        <Text style={styles.labelText}>Scan QR to Continue</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center' 
  },

  labelText: {
    fontSize: 22, 
    color: "#FFFFFF"
  },

  svg: {
    position: 'absolute',
  },
})