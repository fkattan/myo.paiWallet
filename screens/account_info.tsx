import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Share,
  Clipboard,
  Platform,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import * as ImagePicker from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";

import { useAppContext } from "../app_context";
import { capitalize } from "../utils/text_helpers";
import i18n from "i18n-js";
import * as Colors from "../colors";
import PersonalDataCollector from "../components/personal_data_collector";
import {
  storePersonalData,
  removePersonalData,
  readPersonalData,
  storeProfileImage,
  removeProfileImage,
} from "../services/data_service";
import Button from "../components/button";

type AccountInfoProps = {
  navigation: any;
};

const AccountInfo = ({ navigation }: AccountInfoProps) => {
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [showDataCollector, setShowDataCollector] = useState<boolean>(false);
  const [state, dispatch] = useAppContext();
  const { wallet, firstName, lastName, phoneNumber, image } = state;
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined
  );
  const { showActionSheetWithOptions } = useActionSheet();

  const loadPersonalData = async () => {
    const data = await readPersonalData();

    data.firstName &&
      dispatch({
        type: "set_user_details",
        payload: {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phoneNumber: data.phoneNumber || "",
        },
      });
    data.image && dispatch({ type: "set_profile_image", payload: data.image });
  };

  useEffect(() => {
    loadPersonalData();
    (async () => {
      if (Platform.OS !== "web") {
        let response = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (response.status !== "granted") {
          alert(capitalize(i18n.t("need_camera_roll_access")));
        }

        response = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (response.status !== "granted") {
          alert(capitalize(i18n.t("need_camera_access")));
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (profileImage === "") {
        const response = await removeProfileImage();
        dispatch({ type: "clear_profile_image", payload: undefined });
      } else if (profileImage) {
        const response = await storeProfileImage(profileImage);
        dispatch({ type: "set_profile_image", payload: profileImage });
      }
    })();
  }, [profileImage]);

  useEffect(() => {
    if (wallet === undefined) return;
    (async () => {
      const address = await wallet.getAddress();
      setAccountAddress(address);
    })();
  }, [wallet]);

  const onCopy = () => {
    Clipboard.setString(accountAddress);
  };

  const onShare = async () => {
    const result = await Share.share({
      message: accountAddress,
    });
  };

  const onUseCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
    }
  };

  const onUseCameraRoll = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
    }
  };

  const onDeleteProfileImage = () => {
    setProfileImage("");
  };

  const onDisplayPhotoOptions = () => {
    let destructiveButtonIndex = -1;
    let cancelButtonIndex = 2;
    const options = [
      capitalize(i18n.t("take_photo")),
      capitalize(i18n.t("choose_photo")),
      capitalize(i18n.t("cancel")),
    ];
    if (image) {
      destructiveButtonIndex = 0;
      cancelButtonIndex += 1;
      options.unshift(capitalize(i18n.t("delete_photo")));
    }

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            image ? onDeleteProfileImage() : onUseCamera();
            break;
          case 1:
            image ? onUseCamera() : onUseCameraRoll();
            break;
          case 2:
            image ? onUseCameraRoll() : null;
            break;
        }
      }
    );
  };
  const onPersonalDataCollected = (data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => {
    storePersonalData(data, accountAddress);
    dispatch({ type: "set_user_details", payload: data });
    setShowDataCollector(false);
  };

  const onRemovePersonalData = () => {
    onDeleteProfileImage();
    removePersonalData(phoneNumber);
    dispatch({ type: "clear_user_details", payload: undefined });
  };

  if (accountAddress === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.PRIMARY_BLUE, Colors.PRIMARY_BLUE_MONOCHROME]}
      locations={[0.5, 1]}
    >
      <StatusBar barStyle="dark-content" />

      <View style={{ flex: 3, alignItems: "center", justifyContent: "center" }}>
        {firstName && lastName && phoneNumber && (
          <View
            style={{
              display: "flex",
              marginBottom: -36,
              zIndex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.LIGHT_GRAY,
              width: 72,
              height: 72,
              borderRadius: 36,
            }}
          >
            <TouchableOpacity onPress={onDisplayPhotoOptions}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: 72, height: 72, borderRadius: 36 }}
                />
              ) : (
                <Ionicons
                  name="ios-person"
                  size={48}
                  color={Colors.MEDIUM_GRAY}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
        <View
          style={{ padding: 40, borderRadius: 20, backgroundColor: "#FFF" }}
        >
          {firstName && lastName && phoneNumber && (
            <View
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={styles.nameText}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.phoneText}>{phoneNumber}</Text>
            </View>
          )}
          <QRCode value={`ethereum:${accountAddress}`} size={240} />
        </View>
      </View>

      <PersonalDataCollector
        show={showDataCollector}
        onCancel={() => {
          setShowDataCollector(false);
        }}
        onConfirm={(data) => onPersonalDataCollected(data)}
      />
      <View style={{ flex: 1 }}>
        {phoneNumber ? (
          <TouchableOpacity
            onPress={onRemovePersonalData}
            style={[
              {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="account-minus"
              size={18}
              color={Colors.RED_MONOCHROME}
            />
            <Text
              style={[
                styles.buttonText,
                { marginLeft: 8 },
                { color: Colors.RED_MONOCHROME },
              ]}
            >
              {capitalize(i18n.t("clear_account_details"))}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setShowDataCollector(true);
            }}
            style={[
              {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            <MaterialCommunityIcons name="account" size={18} color={Colors.WHITE} />
            <Text style={[styles.buttonText, { marginLeft: 8, color: Colors.WHITE }]}>
              {capitalize(i18n.t("enter_account_details"))}
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={onCopy}
            style={[styles.buttonContainer, { marginTop: 40 }]}
          >
            <Feather name="copy" size={18} color={Colors.WHITE} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 18,
                fontFamily: "Montserrat-Bold",
                color: Colors.WHITE,
              }}
            >
              {capitalize(i18n.t("copy"))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShare}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 40,
            }}
          >
            <Text style={[styles.buttonText, { marginHorizontal: 18 }]}>
              &nbsp;
            </Text>
            <Feather name="share-2" size={18} color={Colors.WHITE} />
            <Text style={[styles.buttonText, { marginLeft: 8, color: Colors.WHITE
             }]}>
              {capitalize(i18n.t("share"))}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 40,
          width: "100%",
        }}
      >
        <Button category="primary-mono" title={capitalize(i18n.t("back"))} iconName="arrowleft" onPress={() => navigation.navigate("home")} /> 
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContainerFilled: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    height: 50,
    backgroundColor: "#347AF0",
    width: "100%",
  },

  buttonText: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "#347AF0",
  },
  nameText: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: Colors.BLACK,
  },
  phoneText: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: "Montserrat",
    color: Colors.MEDIUM_GRAY,
  },
});

export default AccountInfo;
