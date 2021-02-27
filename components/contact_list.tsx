import React, { ReactElement, useEffect, useState } from "react";
import { FlatList, View, Text, ListRenderItem, TouchableOpacity, Image, StyleSheet } from "react-native";

import i18n from "i18n-js";

import * as Contacts from "expo-contacts";
import * as Cellular from "expo-cellular";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import { titleize } from "../utils/text_helpers";
import { getPotentialFullNumbers } from "../utils/phone_helpers";
import { findDataForNumbers, retrieveRecentContacts } from "../services/data_service";

import * as Colors from "../colors";

type ContactListProps = {
    searchQuery:string|undefined;
    onContact:(contact:Contacts.Contact, address:string)=>void;
    onContactNotFound:(arg0:Contacts.Contact)=>void;
    onLoading?:(arg0:boolean)=>void;
}

const ContactList = ({searchQuery, onContact, onContactNotFound, onLoading}:ContactListProps) => {

  const [useContactsGranted, setUseContactsGranted] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contacts.ContactResponse>();

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
    if (!useContactsGranted) return;
    
    if(!searchQuery) {
        retrieveRecentContacts()
        .then((v:Array<Contacts.Contact>) => {
            setContacts({data: v, hasNextPage: false, hasPreviousPage: false});
        });

        return;
    }

    if (searchQuery && searchQuery.length >= 3) {
      Contacts.getContactsAsync({
        name: searchQuery,
        fields: [
            Contacts.Fields.ID,
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

  const onContactSelected = (item: Contacts.Contact) => {

    if(!item.phoneNumbers) return;

    const numbers = getPotentialFullNumbers(
      item.phoneNumbers.map((n:any) => n.digits),
      Cellular.isoCountryCode
    );

    onLoading && onLoading(true)

    //given the numbers, we have to find one with a wallet address mapping
    findDataForNumbers(numbers)
    .then((matches) => {
      if (!matches || !matches.length) {
        //no  match found...should invite  the user
        onContactNotFound(item);

    //more  than one match is found, we should ask  the user to choose ??
    //let's display a modal with two
      } else if (matches.length > 1) {
        console.warn("More than one match is found.");

    //Just one match, safe to continue
    //TODO: decide  on what  to  do  if  the name   in  the addressbook doesn't match
    //what is found associated  with the  wallet address
      } else {
        setContacts({ data: [item], hasPreviousPage: false, hasNextPage: false });
        onContact(item, matches[0].walletAddress);
      }
    })
    .catch(error => console.error(JSON.stringify(error)))
    .finally(() => onLoading && onLoading(false));
  };

  const renderContact: ListRenderItem<Contacts.Contact> = ({ item, }): ReactElement => {
    if (!item || !item.phoneNumbers) return <View />;

    return (
      <View style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', marginRight: 8}}>
        <TouchableOpacity
          onPress={() => onContactSelected(item)}
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
    <>
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
    </>
  )

}

const styles = StyleSheet.create({
  
    emptyIcon: {
      marginBottom: 8,
    },
  
    emptyLegend: {
      fontFamily: "Montserrat-Bold",
      fontSize: 18,
      color: Colors.DARK_GRAY,
    }
  });
  
  export default ContactList;
