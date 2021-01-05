import * as firebase from "firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ethers } from "ethers";

/**
 * retrieves the personal data for the current user
 */
export const readPersonalData = async () => {
  const firstName = await AsyncStorage.getItem("user.first_name");
  const lastName = await AsyncStorage.getItem("user.last_name");
  const phoneNumber = await AsyncStorage.getItem("user.phone_number");
  return { firstName, lastName, phoneNumber };
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
  console.log("snapshots", snapshots);
  return snapshots.map((s) => s.val()).filter((s) => !!s);
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
  data: { phoneNumber: string; firstName: string; lastName: string },
  address: string
): void => {
  console.log("-->storePersonalData");
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
 * removes  the phone number-to-{firstName, lastName, wallet address} mapping
 * @param phone phone number
 */
export const removePersonalData = (phone: string | undefined): void => {
  if (phone === undefined) return;

  console.log("-->removePersonalData");
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
