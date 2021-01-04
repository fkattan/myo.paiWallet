import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import * as Cellular from "expo-cellular";
import "@ethersproject/shims";
import { ethers } from "ethers";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  ListRenderItem,
  ListRenderItemInfo,
} from "react-native";
import * as Contacts from "expo-contacts";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { getPotentialFullNumbers } from "../../utils/phone_helpers";

import { formatCurrency } from "../../utils/currency_helpers";

import Button from "../../components/button";
import i18n from "i18n-js";
import { titleize, capitalize } from "../../utils/text_helpers";
import { usePayflowContext } from "./payflow_context";

import * as Colors from "../../colors";

type EnterRecipientProps = {
  route: any;
  navigation: any;
};

// Upon entry, show empty recipient input; scan icon,
// a contact-search box, and a list of contacts sort by last transfer date.
// User can select from list, search a contact, or scan a QR.

const EnterRecipient = ({ route, navigation }: EnterRecipientProps) => {
  const [recipientValue, setRecipientValue] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(true);
  const [hasFocus, setFocus] = useState<boolean>(false);

  const [useContactsGranted, setUseContactsGranted] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts.ContactResponse>();
  const [recipientName, setRecipientName] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [payflowState, payflowDispatch] = usePayflowContext();
  const { amount, recipient } = payflowState;

  useEffect(() => {
    Contacts.requestPermissionsAsync().then(
      (response: Contacts.PermissionResponse) => {
        if (response.status === Contacts.PermissionStatus.GRANTED) {
          setUseContactsGranted(true);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (recipient === undefined) return;

    setRecipientValue(recipient);
    setSearchQuery(recipient);
  }, [recipient]);

  useEffect(() => {
    if (recipientValue && recipientValue.length > 0) {
      if (ethers.utils.isAddress(recipientValue)) {
        setDisabled(false);
      } else {
        console.log("Setting search query", recipientValue);
        setSearchQuery(recipientValue);
      }
    } else {
      setDisabled(true);
    }
  }, [recipientValue]);

  useEffect(() => {
    if (!useContactsGranted) return;
    if (searchQuery.length >= 3) {
      console.log("Searching Contacts", searchQuery);

      Contacts.getContactsAsync({
        name: searchQuery,
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.ImageAvailable,
          Contacts.Fields.Image,
        ],
      }).then((value: Contacts.ContactResponse) => {
        setContacts(value);
      });
    } else {
      setContacts(undefined);
    }
  }, [searchQuery]);

  const onEnterMessage = () => {
    payflowDispatch({ type: "set_recipient", payload: recipientValue });
    navigation.navigate("enter_message");
  };

  const onQRScan = () => {
    navigation.navigate("scan");
  };

  const onContactPicked = (item: Contacts.Contact) => {
    console.log("Picked contact", item);
    console.log("isoCountry  code", Cellular.isoCountryCode);
    const numbers = getPotentialFullNumbers(
      item.phoneNumbers.map(n => n.digits),
      Cellular.isoCountryCode
    );
    console.log("NUMBERS", numbers);
  };

  const renderContact: ListRenderItem<Contacts.Contact> = ({
    item,
  }): ReactElement => {
    //console.log("Contact item:", item);
    if (!item || !item.phoneNumbers) return <View />;

    return (
      <TouchableOpacity
        onPress={() => onContactPicked(item)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          marginHorizontal: 10,
        }}
      >
        {item.imageAvailable && item.image ? (
          <Image
            source={item.image}
            style={{ width: 64, height: 64, borderRadius: 32 }}
          />
        ) : (
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.LIGHT_GRAY,
              width: 64,
              height: 64,
              borderRadius: 32,
            }}
          >
            <Ionicons name="ios-person" size={48} color={Colors.MEDIUM_GRAY} />
          </View>
        )}
        <Text style={{ marginTop: 8, width: 84, textAlign: "center" }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.LIGHT_GRAY, Colors.WHITE]}
      locations={[0, 0.5]}
    >
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          flex: 0.25,
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Text style={styles.amountLegend}>
          {capitalize(i18n.t("amount_to_send"))}:{" "}
          {formatCurrency(amount || "0", 2, { prefix: "$" })}
        </Text>
      </View>

      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View
            style={[
              styles.inputTextContainer,
              { borderBottomColor: hasFocus ? "#347AF0" : "#CFD2D8" },
            ]}
          >
            <TextInput
              multiline
              value={recipientValue}
              onChangeText={(text: string) => setRecipientValue(text)}
              style={styles.inputField}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
            />
            <TouchableOpacity onPress={onQRScan}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={24}
                color="black"
                style={styles.inputIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {contacts && (
        <View
          style={{
            flex: 0.75,
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <FlatList
            horizontal={true}
            data={contacts.data}
            renderItem={renderContact}
          />
        </View>
      )}

      <View style={{ flex: 2 }}>
        <Button
          title={titleize(i18n.t("continue"))}
          onPress={onEnterMessage}
          category="primary"
          disabled={disabled}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  inputTextContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    padding: 5,
  },

  inputField: {
    flex: 1,
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    padding: 8,
    borderTopRightRadius: 3,
    borderTopLeftRadius: 3,
  },

  inputIcon: {
    paddingVertical: 8,
  },

  amountLegend: {
    fontFamily: "Montserrat-Bold",
    fontSize: 24,
    color: "#3783F5",
  },
});

export default EnterRecipient;
