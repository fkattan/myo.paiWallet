import * as firebase from "firebase";
import { ethers } from "ethers";
/**
 * TODO: think about what to return and how to deal with exceptions
 * stores the hashed phone number to wallet address in the datastore (firebase)
 * @param phone phone number
 * @param address wallet address
 */
export const storePhoneMapping = (phone: string, address: string): void => {
  console.log("-->storePhoneMapping");
  const hashedPhone = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(phone));
  console.log(`\nabout to store ${phone}'s hash ${hashedPhone}`);
  try {
    firebase
      .database()
      .ref("phone-numbers/" + hashedPhone)
      .set({
        walletAddress: address,
      });
  } catch (error) {
    console.log("FIREBASE DB ERROR:", error);
  }
};

/**
 * removes  the phone number-to-wallet address mapping
 * @param phone phone number
 */
export const removePhoneMapping = (phone: string): void => {
  console.log("-->removePhoneMapping");
  const hashedPhone = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(phone));
  try {
    firebase
      .database()
      .ref("phone-numbers/" + hashedPhone)
      .remove();
  } catch (error) {
    console.log("FIREBASE DB ERROR:", error);
  }
};
