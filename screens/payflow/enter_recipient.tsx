import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import * as Contacts from "expo-contacts";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { formatCurrency } from "../../utils/currency_helpers";

import Button from "../../components/button";
import i18n from "i18n-js";
import { titleize, capitalize } from "../../utils/text_helpers";
import { usePayflowContext } from "./payflow_context";
import InvitationSender from "../../components/invitation_sender";

import * as Colors from "../../colors";
import { Platform } from "react-native";

import ContactList from "../../components/contact_list";

type EnterRecipientProps = {
  route: any;
  navigation: any;
};

// Upon entry, show empty recipient input; scan icon,
// a contact-search box, and a list of contacts sort by last transfer date.
// User can select from list, search a contact, or scan a QR.

const EnterRecipient = ({ route, navigation }: EnterRecipientProps) => {
  const [recipientInput, setRecipientInput] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string|undefined>(undefined);
  const [recipientId, setRecipientId] = useState<string|undefined>(undefined);

  const [disabled, setDisabled] = useState<boolean>(true);
  const [hasFocus, setFocus] = useState<boolean>(false);
  const [showInvitation, setShowInvitation] = useState<Contacts.Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string|undefined>(undefined);

  const [payflowState, payflowDispatch] = usePayflowContext();
  const { amount, recipient } = payflowState;

  useEffect(() => {
    if (recipient === undefined) return;

    setRecipientInput(recipient.name ? recipient.name : recipient.address);
    setRecipientAddress(recipient.address);
    setDisabled(false);
  }, [recipient]);

  // If input text is not an address, update search query to find posible name matches
  useEffect(() => {
    if(recipientInput === undefined) return; 
    
    if(ethers.utils.isAddress(recipientInput)) {
      setSearchQuery(undefined);
      setDisabled(false);
      setRecipientAddress(recipientInput);
      return;
    }

    setSearchQuery(recipientInput);

  }, [recipientInput]);

  const onContinue = () => {
    if(!recipientAddress || !ethers.utils.isAddress(recipientAddress)) return;

    payflowDispatch({
      type: "set_recipient",
      payload: { id: recipientId, name: recipientId ? recipientInput : "",  address: recipientAddress },

    });
    navigation.navigate("enter_message");
  };

  const onQRScan = () => {
    navigation.navigate("scan");
  };

  const onContact = (contact:Contacts.Contact, address:string) => {
        setRecipientAddress(address);
        setRecipientId(contact.id);
        setRecipientInput(contact.name);
        setDisabled(false);
  }

  const onContactNotFound = (contact:Contacts.Contact) => {
    console.log("TODO: Show Invitation");
  }

  return (
    <LinearGradient style={styles.container} colors={[Colors.LIGHT_GRAY, Colors.WHITE]} locations={[0, 0.7]} >

      <StatusBar barStyle="dark-content" />
      
      <View style={{ display: 'flex', justifyContent: "flex-end", alignItems: "center", width: "100%" }} >
        <Text style={styles.amountLegend}>
          {capitalize(i18n.t("amount_to_send"))}:{" "}
          {formatCurrency(amount || "0", 2, { prefix: "$" })}
        </Text>
      </View>

      <InvitationSender
        show={!!showInvitation}
        contact={showInvitation}
        onCancel={() => setShowInvitation(null)}
        onDone={() => {
          setShowInvitation(null);
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{width: '100%', flex: 1, justifyContent: 'flex-end'}} >
          <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}>
              <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-end'}} keyboardShouldPersistTaps="handled">
                <View style={[ styles.inputTextContainer, { borderBottomColor: hasFocus ? "#347AF0" : "#CFD2D8" }]} >
                  <TextInput
                    multiline
                    value={recipientInput}
                    onChangeText={(text: string) => {
                      setRecipientInput(text);
                    }}
                    onKeyPress={() => { setDisabled(true); setRecipientAddress(undefined)}}
                    style={ethers.utils.isAddress(recipientInput) ? styles.inputFieldAddress : styles.inputField}
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
              </ScrollView>
          </View>

          <View style={{ display: 'flex', justifyContent: "center", alignItems: "center", backgroundColor: Colors.OFF_WHITE, borderRadius: 8, minHeight: 150}}>
            <ContactList 
              searchQuery={searchQuery} 
              onContact={onContact} 
              onContactNotFound={onContactNotFound}
              onLoading={setIsLoading} />
          </View>

        <View style={{ flex: 3, justifyContent: 'flex-start' }}>
          <Button
            loading={isLoading}
            title={titleize(i18n.t("continue"))}
            onPress={onContinue}
            category="primary"
            disabled={disabled}
          />
        </View>
      </KeyboardAvoidingView>
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
    marginRight: 10,
    borderTopRightRadius: 3,
    borderTopLeftRadius: 3,
  },

  inputFieldAddress: {
    flex: 1,
    fontFamily: "Montserrat-Bold",
    fontSize: 14,
    textAlign: 'center',
    padding: 0,
    marginRight: 10,
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
