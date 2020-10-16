import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AppProvider } from './app_context';
import Main from './screens/main';

export default function App() {

  return (
    <AppProvider>
      <NavigationContainer>
          <Main />
      </NavigationContainer>
    </AppProvider>
  );
}