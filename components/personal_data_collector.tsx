import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  GestureResponderEvent,
  Modal,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as Colors from "../colors";
import { capitalize, titleize } from "../utils/text_helpers";
import PhoneInput from "react-native-phone-number-input";
import * as Localization from "expo-localization";
import i18n from "i18n-js";

type PersonalDataCollectorProps = {
  onCancel: (event: GestureResponderEvent) => void;
  onConfirm: (phone: string) => void;
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

  const handleOnConfirm = (event: GestureResponderEvent) => {
    const checkValid = phoneInput.current?.isValidNumber(value);
    setValid(checkValid ? checkValid : false);
    setShowWarning(checkValid ? false : true);
    checkValid && onConfirm(formattedValue);
  };
  return (
    <Modal
      animationType={"slide"}
      transparent={false}
      visible={show}
      onRequestClose={() => {
        console.log("Modal has been closed.");
      }}
    >
      <View style={styles.modal}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {titleize(i18n.t("confirm_mobile_number"))}
          </Text>
        </View>
        <View style={{ flex: 2 }}>
          <TextInput></TextInput>
          <PhoneInput
            ref={phoneInput}
            defaultValue={value}
            defaultCode={Localization.locale.split("-")[1]}
            layout="first"
            onChangeText={(text) => {
              setShowWarning(false);
              setValue(text);
            }}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            withDarkTheme
            withShadow
            autoFocus
          />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 10,
            }}
          >
            {showWarning && (
              <Text style={styles.warning}>
                {capitalize(i18n.t("invalid_mobile_number"))}
              </Text>
            )}
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              onPress={(e) => {
                handleOnConfirm(e);
              }}
              style={[styles.buttonContainer, { marginTop: 40 }]}
            >
              <AntDesign name="check" size={18} color="#347AF0" />
              <Text style={styles.button}>{capitalize(i18n.t("confirm"))}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                onCancel(e);
              }}
              style={[styles.buttonContainer, { marginTop: 40 }]}
            >
              <Text style={[styles.button, { marginHorizontal: 18 }]}>
                &nbsp;
              </Text>
              <AntDesign name="close" size={18} color={Colors.RED_MONOCHROME} />
              <Text
                style={[
                  styles.button,
                  { marginLeft: 8, color: Colors.RED_MONOCHROME },
                ]}
              >
                {capitalize(i18n.t("cancel"))}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    marginBottom: 20,
  },
  modal: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.OFF_WHITE,
    paddingTop: 50,
    paddingRight: 5,
    paddingBottom: 30,
    paddingLeft: 5,
  },
  modalText: {
    color: "#3f2949",
    marginTop: 10,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginLeft: 8,
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#347AF0",
  },

  warning: {
    color: Colors.RED_MONOCHROME,
  },
});

export default PhoneVerifier;
