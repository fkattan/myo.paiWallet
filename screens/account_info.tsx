import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Share,
  Clipboard,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";

import { useAppContext } from "../app_context";
import { capitalize } from "../utils/text_helpers";
import i18n from "i18n-js";
import * as Colors from "../colors";
import PersonalDataCollector from "../components/personal_data_collector";
import {
  storePersonalData,
  removePersonalData,
  readPersonalData,
} from "../services/data_service";

type AccountInfoProps = {
  navigation: any;
};

const AccountInfo = ({ navigation }: AccountInfoProps) => {
  const [accountAddress, setAccountAddress] = useState<string>("");
  const [showDataCollector, setShowDataCollector] = useState<boolean>(false);
  const [state, dispatch] = useAppContext();
  const { wallet, firstName, lastName, phoneNumber } = state;

  const loadPersonalData = async () => {
    const data = await readPersonalData();
    data.firstName && dispatch({ type: "set_user_details", payload: {firstName: data.firstName || "", lastName: data.lastName || "", phoneNumber: data.phoneNumber || ""} });
  };

  useEffect(() => {
    loadPersonalData();
  }, []);

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
      colors={[Colors.OFF_WHITE, Colors.LIGHT_GRAY]}
      locations={[0.5, 1]}
    >
      <StatusBar barStyle="dark-content" />

        <View style={{ flex: 3, alignItems: "center", justifyContent: "center" }}>
          {firstName && lastName && phoneNumber && (
            <View style={{display: 'flex',  marginBottom: -36, zIndex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.LIGHT_GRAY, width: 72, height: 72, borderRadius: 36}}>
                <Ionicons name="ios-person" size={48} color={Colors.MEDIUM_GRAY} />
            </View>
          )}
          <View style={{ padding: 40, borderRadius: 20, backgroundColor: "#FFF" }} >
            {firstName && lastName && phoneNumber && (
              <View style={{display: 'flex', alignItems: 'center', marginBottom: 20}}>
                <Text style={styles.nameText}>{firstName} {lastName}</Text>
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
            <MaterialCommunityIcons name="account" size={18} color="#347AF0" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>
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
            <Feather name="copy" size={18} color="#347AF0" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 18,
                fontFamily: "Montserrat-Bold",
                color: Colors.PRIMARY_BLUE
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
            <Feather name="share-2" size={18} color="#347AF0" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>
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
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("home");
          }}
          style={styles.buttonContainerFilled}
        >
          <Feather name="arrow-left" size={18} color="#FFF" />
          <Text style={[styles.buttonText, { color: "#FFF", marginLeft: 8 }]}>
            {capitalize(i18n.t("back"))}
          </Text>
        </TouchableOpacity>
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
    alignItems: "stretch",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
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
