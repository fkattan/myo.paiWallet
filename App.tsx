import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import ethers from 'ethers';

import { AppProvider } from './app_context';
import Main from './screens/main';

export default function App() {

  const provider = new ethers.providers.JsonRpcProvider("https://ropsten.infurac.com");
  
  return (
    <AppProvider>
      <NavigationContainer>
          <Main />
      </NavigationContainer>
    </AppProvider>
  );
}