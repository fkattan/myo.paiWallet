import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  GestureResponderEvent,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Platform
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as Colors from "../colors";
import { capitalize, titleize } from "../utils/text_helpers";
import PhoneInput from "react-native-phone-number-input";
import { CountryCode } from "react-native-country-picker-modal"
import * as Localization from "expo-localization";
import i18n from "i18n-js";


type PersonalDataCollectorProps = {
  onCancel: (event: GestureResponderEvent) => void;
  onConfirm: (data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => void;
  show?: boolean;
};

const PersonalDataCollector = ({
  onCancel,
  onConfirm,
  show = false,
}: PersonalDataCollectorProps) => {
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [valid, setValid] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [inputFocus, setInputFocus] = React.useState<string>("")

  const handleOnConfirm = (event: GestureResponderEvent) => {
    const checkValid =
      phoneInput.current?.isValidNumber(value) &&
      firstName.length > 0 &&
      lastName.length > 0;
    setValid(checkValid ? checkValid : false);
    setShowWarning(!checkValid);
    checkValid &&
      onConfirm({ firstName, lastName, phoneNumber: formattedValue });
  };

  return (
    <Modal
      animationType={"slide"}
      presentationStyle="fullScreen"
      transparent={false}
      visible={show}
    >
      <SafeAreaView style={styles.modal}>
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? "padding": "height"}>

          <ScrollView contentContainerStyle={{flexGrow: 1, width: Dimensions.get("screen").width}} keyboardShouldPersistTaps="handled">

            <View style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>

                <Text style={styles.title}>
                  {titleize(i18n.t("enter_account_details"))}
                </Text>
                <TouchableOpacity
                  onPress={(e) => onCancel(e) }
                  style={{position: 'absolute', right: 20}}
                >
                  <AntDesign name="closecircle" size={22} color={Colors.RED} />
                </TouchableOpacity>
            </View>

            <Image source={require('../assets/office.png')} resizeMode="contain" style={{ flex: 1, height: undefined, width: undefined}} />

            <View style={{ flex: 1, paddingHorizontal: 30, paddingTop:20, marginHorizontal: 10, backgroundColor: Colors.WHITE, borderTopLeftRadius:8, borderTopRightRadius:8 }}>
              <TextInput
                style={[styles.textInput, inputFocus === "first_name" && styles.textInputActive]}
                placeholder={capitalize(i18n.t("first_name"))}
                onChangeText={(text) => setFirstName(text)}
                onFocus={() => setInputFocus("first_name")}
                onBlur={() => setInputFocus("phone")}
                value={firstName}
                autoFocus
              />
              <TextInput
                style={[styles.textInput, inputFocus === "last_name" && styles.textInputActive]}
                placeholder={capitalize(i18n.t("last_name"))}
                onChangeText={(text) => setLastName(text)}
                onFocus={() => setInputFocus("last_name")}
                onBlur={() => setInputFocus("phone")}
                value={lastName}
              />
              <PhoneInput
                ref={phoneInput}
                defaultValue={value}
                defaultCode={Localization.locale.split("-")[1] as CountryCode}
                layout="first"
                onChangeText={(text) => {
                  setShowWarning(false);
                  setValue(text);
                }}
                onChangeFormattedText={(text) => {
                  setFormattedValue(text);
                }}
                placeholder={i18n.t("phone_number")}
                withDarkTheme
                withShadow={false}
                containerStyle={{width: '100%', marginTop: 10, backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderBottomColor: inputFocus === "phone" ? Colors.PRIMARY_BLUE : Colors.LIGHT_GRAY}}
                textContainerStyle={{backgroundColor: Colors.WHITE}}
              />
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 15,
                }}
              >
                {showWarning && (
                  <Text style={styles.warning}>
                    {capitalize(i18n.t("invalid_account_details"))}
                  </Text>
                )}
              </View>

              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20
                }}
              >
                <TouchableOpacity
                  onPress={ (e) => handleOnConfirm(e) }
                  style={[styles.buttonContainer, {backgroundColor: Colors.PRIMARY_BLUE}]}
                >
                  <Text style={[styles.buttonText, {color: Colors.WHITE}]}>{capitalize(i18n.t("save_personal_data"))}</Text>
                </TouchableOpacity>

              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Danger: bg: e63946, fg: f1faee
// Primary: bg: 1d3557 fg: f1faee
// Info: bg: a8dadc fg: 6c757d
// default: bg: e9ecef fg: 6c757d

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#347AF0",
  },

  modal: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.OFF_WHITE,
  },

  buttonContainer: {
    display: "flex",
    paddingHorizontal: 25,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: Colors.PRIMARY_BLUE,
  },

  textInput: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    height: 48,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },

  textInputActive: {
    borderBottomColor: Colors.PRIMARY_BLUE,
  },

  warning: {
    color: Colors.RED_MONOCHROME,
  },
});

export default PersonalDataCollector;
