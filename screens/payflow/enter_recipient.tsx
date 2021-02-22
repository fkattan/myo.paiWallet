import React, { ReactElement, useEffect, useState } from "react";
import * as Cellular from "expo-cellular";
import "@ethersproject/shims";
import { ethers } from "ethers";
import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  ListRenderItem,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import * as Contacts from "expo-contacts";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { getPotentialFullNumbers } from "../../utils/phone_helpers";
import { findDataForNumbers } from "../../services/data_service";
import { formatCurrency } from "../../utils/currency_helpers";

import Button from "../../components/button";
import i18n from "i18n-js";
import { titleize, capitalize } from "../../utils/text_helpers";
import { usePayflowContext } from "./payflow_context";
import InvitationSender from "../../components/invitation_sender";

import * as Colors from "../../colors";
import { Platform } from "react-native";

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

  const [disabled, setDisabled] = useState<boolean>(true);
  const [hasFocus, setFocus] = useState<boolean>(false);
  const [showInvitation, setShowInvitation] = useState<Contacts.Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [useContactsGranted, setUseContactsGranted] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts.ContactResponse>();

  const [searchQuery, setSearchQuery] = useState<string|undefined>(undefined);

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

    setRecipientInput(recipient.name ? recipient.name : recipient.address);
    setRecipientAddress(recipient.address);
    setDisabled(false);
  }, [recipient]);

  useEffect(() => {
    if (!recipientInput) return; 

    if(!ethers.utils.isAddress(recipientInput)) {
      setSearchQuery(recipientInput)
    } else {
      setSearchQuery(undefined);
    }
  }, [recipientInput]);

  useEffect(() => {
    if (!useContactsGranted) return;
    
    if (searchQuery && searchQuery.length >= 3) {
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
  }, [searchQuery, useContactsGranted]);

  const onContinue = () => {
    if(!recipientAddress || !ethers.utils.isAddress(recipientAddress)) return;

    payflowDispatch({
      type: "set_recipient",
      payload: { name: recipientInput, address: recipientAddress },
    });
    navigation.navigate("enter_message");
  };

  const onQRScan = () => {
    navigation.navigate("scan");
  };

  const onContactPicked = (item: Contacts.Contact) => {
    if(item.phoneNumbers === undefined) return; 

    setIsLoading(true);

    const numbers = getPotentialFullNumbers(
      item.phoneNumbers.map((n) => n.digits),
      Cellular.isoCountryCode
    );

    //given the numbers, we have to find one with a wallet address mapping
    findDataForNumbers(numbers)
    .then((matches) => {
      if (!matches || !matches.length) {
        //no  match found...should invite  the user
        setShowInvitation(item);
      } else if (matches.length > 1) {
        //more  than one match is found, we should ask  the user to choose ??
        //let's display a modal with two
        alert("More than one match is found.");
      } else {
        //clean  case...just one match...safe to continue
        //TODO: decide  on what  to  do  if  the name   in  the addressbook doesn't match
        //what is found associated  with the  wallet address
        setContacts({ data: [item], hasPreviousPage: false, hasNextPage: false });
        setRecipientAddress(matches[0].walletAddress);
        setRecipientInput(item.name);
        setDisabled(false);
      }
    })
    .finally(() => setIsLoading(false));
  };

  const renderContact: ListRenderItem<Contacts.Contact> = ({ item, }): ReactElement => {
    if (!item || !item.phoneNumbers) return <View />;

    return (
      <View style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginRight: 8}}>
        <TouchableOpacity
          onPress={() => onContactPicked(item)}
          style={{
            display: "flex",
            alignSelf: 'stretch',
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            marginHorizontal: 10,
            paddingHorizontal: 8,
            paddingVertical: 12,
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
      </View>
    );
  };

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

            {contacts && contacts.data.length === 0 && ( 
              <View style={{display: 'flex', alignItems: 'center'}}>
                <MaterialCommunityIcons name="account-off" size={42} color={Colors.DARK_GRAY} style={styles.emptyIcon} />
                <Text style={styles.emptyLegend}>{titleize(i18n.t("recipient_not_found"))}</Text>
              </View>
            )}

            {contacts && contacts.data.length > 0 && (
              <FlatList
                keyboardShouldPersistTaps="handled"
                style={{padding: 12, borderRadius: 12}}
                horizontal={true}
                data={contacts.data}
                renderItem={renderContact}
              />
            )}

            {!contacts && (
              <View style={{display: 'flex', alignItems: 'center'}}>
                <MaterialCommunityIcons name="account-heart" size={42} color={Colors.DARK_GRAY} style={styles.emptyIcon} />
                <Text style={styles.emptyLegend}>{titleize(i18n.t("recent_recipients"))}</Text>
              </View>
            )}

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

  emptyIcon: {
    marginBottom: 8,
  },

  emptyLegend: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: Colors.DARK_GRAY,
  }
});

export default EnterRecipient;
