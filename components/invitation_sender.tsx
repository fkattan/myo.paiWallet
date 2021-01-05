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

type InvitationSenderProps = {
  show: boolean;
  contact: any;
  onCancel: (event: GestureResponderEvent) => void;
  onDone: () => void;
};

const InvitationSender = ({
  onCancel,
  onDone,
  contact,
  show = false,
}: InvitationSenderProps) => {
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
          <Text style={styles.title}>Send Invitation</Text>
        </View>
        <View style={{ flex: 3 }}></View>

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
              onDone();
            }}
            style={[styles.buttonContainer, { marginTop: 40 }]}
          >
            <AntDesign name="check" size={18} color="#347AF0" />
            <Text style={styles.button}>Done</Text>
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

export default InvitationSender;
