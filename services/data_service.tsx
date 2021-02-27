import * as firebase from "firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ethers } from "ethers";
import { Receiver } from "../app_context";
import { Contacts } from "expo";

/**
 * retrieves the personal data for the current user
 */
export const readPersonalData = async () => {
  const firstName = await AsyncStorage.getItem("user.first_name");
  const lastName = await AsyncStorage.getItem("user.last_name");
  const phoneNumber = await AsyncStorage.getItem("user.phone_number");
  const image = await AsyncStorage.getItem("user.image");
  return { firstName, lastName, phoneNumber, image };
};

/**
 * finds the list of personal data mappings given the list of phone numbers
 */
export const findDataForNumbers = async (phoneNumbers: Array<string>) => {
  const promises: Promise<any>[] = [];
  phoneNumbers.forEach((pnumber) => {
    const hashedPhone = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(pnumber)
    );
    const promise = firebase
      .database()
      .ref("phone-numbers/" + hashedPhone)
      .once("value");
    promises.push(promise);
  });

  const snapshots = await Promise.all(promises);
  return snapshots.map((s) => s.val()).filter((s) => !!s);
};

/**
 * stores the profile image in local storage..
 */
export const storeProfileImage = async (image: string) => {
  AsyncStorage.setItem("user.image", image);
};

/**
 * removes the profile image from local storage..
 */
export const removeProfileImage = async () => {
  AsyncStorage.removeItem("user.image");
};
/**
 * TODO: think about what to return and how to deal with exceptions
 * stores the hashed phone number to {wallet address, firstName, lastName} in the datastore (firebase)
 * @param phoneNumber phone number
 * @param firstName first name
 * @param lastName last name
 * @param address wallet address
 */
export const storePersonalData = (
  data: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
  },
  address: string
): void => {
  const hashedPhone = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(data.phoneNumber)
  );
  try {
    firebase
      .database()
      .ref("phone-numbers/" + hashedPhone)
      .set({
        walletAddress: address,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .then(() => {
        AsyncStorage.setItem("user.first_name", data.firstName);
        AsyncStorage.setItem("user.last_name", data.lastName);
        AsyncStorage.setItem("user.phone_number", data.phoneNumber);
      });
  } catch (error) {
      console.log("FIREBASE DB ERROR:", error);
  }
};

/**
 * removes  the phone number-to-{firstName, lastName, wallet address, image} mapping
 * @param phone phone number
 */
export const removePersonalData = (phone: string | undefined): void => {
  if (phone === undefined) return;

  const hashedPhone = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(phone));
  try {
    firebase
      .database()
      .ref("phone-numbers/" + hashedPhone)
      .remove()
      .then(() => {
        AsyncStorage.removeItem("user.first_name");
        AsyncStorage.removeItem("user.last_name");
        AsyncStorage.removeItem("user.phone_number");
      });
  } catch (error) {
    console.log("FIREBASE DB ERROR:", error);
  }
};


export const storeRecentContact= (receiver:Contacts.Contact) => {
  AsyncStorage.getItem("recent_contacts")
  .then((value:string|null) => {

    // if we do not have any contact stored, create new array.
    const contacts:Array<Contacts.Contact> = value ? JSON.parse(value) : [];

    // Remove from Array of Recent Contact if already there
    const index = contacts.findIndex((v:Contacts.Contact) => v.ID === receiver.ID)
    if(index !== -1) contacts.splice(index, 1);

    // Add to begining of Array
    contacts.unshift(receiver)

    // Limit to last 5 contacts
    if(contacts.length > 5) contacts.pop();

    AsyncStorage.setItem("recent_contact", JSON.stringify(contacts))
    .catch(error => console.warn("Can't store recent contacts", JSON.stringify(error)))
  })
};

export const retrieveRecentContacts:()=>Promise<Array<Contacts.Contact>> = async () => {
  return AsyncStorage.getItem('recent_contacts')
  .then(value => value ? JSON.parse(value) : [])
}
