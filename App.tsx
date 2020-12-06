import 'react-native-gesture-handler';

import "@ethersproject/shims"

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {useFonts} from 'expo-font';

import { AppProvider } from './app_context';
import Main from './screens/main';

import { LogBox, Platform } from 'react-native';

// Ignore "setting a timer ..." warning on Android
if(Platform.OS === 'android' ) {
  LogBox.ignoreLogs(["Setting a timer"])
}

export default function App() {

  const [fontsLoaded] = useFonts({
      'FugazOne': require('./assets/fonts/FugazOne-Regular.ttf'),
      'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
      'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf')
  });

  if(!fontsLoaded) return null;

  return (
    <AppProvider>
      <NavigationContainer>
          <Main />
      </NavigationContainer>
    </AppProvider>
  );
}