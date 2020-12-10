import React, { useEffect, useState } from "react";

import { StyleSheet, View, Text, ActivityIndicator, StatusBar } from "react-native";
import * as Colors from '../colors';
import Button from '../components/button';

import * as SecureStore from 'expo-secure-store';

import "@ethersproject/shims"
import {ethers} from 'ethers';

import PAI from '../reference/PAI.json';
import {L2_PROVIDER_URL, MNEMONIC_KEY, L2_PAI_ADDRESS} from '../constants';
import generateMnemonic from '../utils/generate_mnemonic';

import { useAppContext } from "../app_context";
import { formatCurrency } from "../utils/currency_helpers";
import TransactionHistory from "../components/transaction_history";

import i18n from 'i18n-js';

import {titleize, capitalize} from '../utils/text_helpers';
import { LinearGradient } from "expo-linear-gradient";

type HomeProps = {
    navigation:any
};

const Home = ({navigation}:HomeProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [initialized, setInitialized] = useState<boolean>(false);

    const [ state, dispatch ] = useAppContext();
    const { wallet, balance, decimals } = state;

    useEffect(() => {

        console.log("Querying SecureStore", new Date().getTime());

        SecureStore.isAvailableAsync()
        .then(isSecureStoreAvailable => {
            if(!isSecureStoreAvailable) throw "SecureStore not available on Device";
            console.log("Secure Store Available !!", new Date().getTime());
        })
        .then(async () => {

            console.log("Querying Mnemonic", new Date().getTime());
            let mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
            if(mnemonic === null) {
                mnemonic = await generateMnemonic();
                await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic)
                .catch((reason:any) => { throw reason });
            }
            console.log("Got Mnemonic", mnemonic, new Date().getTime());

            const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);

            console.log("Got Connected Wallet", new Date().getTime());

            const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, provider);
            console.log("Got PAI Contract (L2)", new Date().getTime());

            pai.decimals()
            .then((result:ethers.BigNumber) => {
                dispatch({type: 'set_decimals', payload:result})
            });
            console.log("Got Decimals", new Date().getTime());

            const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
            console.log("Got Wallet", new Date().getTime());
            dispatch({type: 'set_wallet', payload: wallet});
            setInitialized(true);
        })
        .catch(reason => {
            console.error("Error: ", reason);
        })
    }, []);

    useEffect(() => {
        if(decimals === undefined || wallet === undefined) return; 

        (async () => {

            const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, wallet);
            const address = await wallet.getAddress()

            setLoading(true);
            pai.balanceOf(address)
            .then((balance:ethers.BigNumber) => {
                console.log("Got Balance");
                dispatch({type: "set_balance", payload: ethers.utils.formatUnits(balance, decimals)});
            })
            .catch((error:any) => { throw error })
            .finally(() => setLoading(false));

        })();
    }, [wallet, decimals]);

    useEffect(() => {
        navigation.setOptions({headerStyle: {
            backgroundColor: loading ? Colors.RED_MONOCHROME : Colors.PRIMARY_BLUE_MONOCHROME_DARK,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0, 
        }});
    }, [loading])


    if(loading || !initialized) return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.RED_MONOCHROME}}>
            <StatusBar hidden={true} />
            <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24, fontFamily: "FugazOne", color: '#f1faee'}}>{i18n.t("loading").toUpperCase()}</Text>
            <ActivityIndicator size="large" color="#f1faee" />
        </View>
    );

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>
        <LinearGradient locations={[0.25, 0.95]} colors={[Colors.PRIMARY_BLUE_MONOCHROME_DARK, Colors.PRIMARY_BLUE]} style={[{flex: 4}, styles.hero]}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={styles.label}>{titleize(i18n.t("your_balance"))}</Text>
                <Text style={[styles.balance, {marginBottom: 40}]}>{formatCurrency(balance || "0", 2, {prefix: '$'})}</Text>
            </View>
        </LinearGradient>

        <View style={[{flex: 6}, styles.actionContainer]}>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{flex: 9}}>
                    <Button category="default" title={capitalize(i18n.t("send"))} iconName="upload" onPress={() => navigation.navigate("payflow")} /> 
                </View>
                <View style={{flex: 2}}><Text>&nbsp;</Text></View>
                <View style={{flex: 9}}>
                    <Button category="default" title={capitalize(i18n.t("receive"))} iconName="download" onPress={() => {navigation.navigate("account_info")}} /> 
                </View>
            </View>
            <View style={[{flex: 3}, styles.transactionHistoryContainer]}>
                <Text style={styles.transactionHistoryTitle}>{titleize(i18n.t("latest_transactions"))}</Text>
                <TransactionHistory address={wallet?.address} />
            </View>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  hero: {
    padding: 8,
    borderTopWidth: 0,
    width: '100%',
    alignItems: 'center', 
    justifyContent: 'center'
  },

  actionContainer: {
    marginTop: -20,
    paddingTop: 10,
    paddingHorizontal: 30,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: Colors.PRIMARY_BLUE_MONOCHROME_DARK
  },

  transactionHistoryTitle: {
      color: Colors.WHITE, 
      marginBottom: 12,
      fontFamily: 'Montserrat-Bold',
      fontSize: 16
  },

  transactionHistoryContainer: {
    marginBottom: 40
  },

  label: {
      fontSize: 18,
      fontFamily: "Montserrat-Bold",
      color: Colors.WHITE,
      marginBottom: 5,
  },

  balance: {
      fontSize: 42,
      fontWeight: 'bold',
      color: Colors.WHITE,

  },

  buttonText: {
    fontSize: 17, 
    color: Colors.WHITE,
    fontWeight: 'bold' 
  },


});

export default Home;