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
      transparent={false}
      visible={show}
      onRequestClose={() => {
        console.log("Modal has been closed.");
      }}
    >
      <View style={styles.modal}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {titleize(i18n.t("enter_account_details"))}
          </Text>
        </View>
        <View style={{ flex: 3 }}>
          <TextInput
            style={styles.textInput}
            placeholder={capitalize(i18n.t("first_name"))}
            onChangeText={(text) => setFirstName(text)}
            value={firstName}
            autoFocus
          />
          <TextInput
            style={styles.textInput}
            placeholder={capitalize(i18n.t("last_name"))}
            onChangeText={(text) => setLastName(text)}
            value={lastName}
          />
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
                {capitalize(i18n.t("invalid_account_details"))}
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
    marginBottom: 10,
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
  textInput: {
    marginBottom: 5,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#F8F9F9",
    height: 50,
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    shadowColor: "rgba(0,0,0,0.4)",
    shadowOffset: {
      width: 1,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },

  warning: {
    color: Colors.RED_MONOCHROME,
  },
});

export default PersonalDataCollector;
