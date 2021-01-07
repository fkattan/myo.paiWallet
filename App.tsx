import "react-native-gesture-handler";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { connectActionSheet } from "@expo/react-native-action-sheet";

import { AppProvider } from "./app_context";
import Main from "./screens/main";

import * as Localization from "expo-localization";
import i18n from "i18n-js";
import en from "./locales/en";
import es from "./locales/es";

import { LogBox, Platform } from "react-native";

import { firebaseInit } from "./firebase_init";

firebaseInit();

// Ignore "setting a timer ..." warning on Android
if (Platform.OS === "android") {
  LogBox.ignoreLogs(["Setting a timer"]);
}

i18n.translations = {
  en: en,
  es: es,
};

i18n.locale = Localization.locale;
i18n.fallbacks = true;

// TODO: ONLY FOR DEBUG
i18n.locale = Localization.locale;

function AppContent() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Main />
      </NavigationContainer>
    </AppProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    FugazOne: require("./assets/fonts/FugazOne-Regular.ttf"),
    Montserrat: require("./assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("./assets/fonts/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) return null;

  const ConnectedApp = connectActionSheet(AppContent);
  return (
    <ActionSheetProvider>
      <ConnectedApp />
    </ActionSheetProvider>
  );
}
