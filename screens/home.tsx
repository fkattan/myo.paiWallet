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


type HomeProps = {
    navigation:any
};

const Home = ({navigation}:HomeProps) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [initialized, setInitialized] = useState<boolean>(false);

    const [ state, dispatch ] = useAppContext();
    const { wallet, balance, decimals } = state;

    useEffect(() => {

        console.log("Querying SecureStore");

        SecureStore.isAvailableAsync()
        .then(isSecureStoreAvailable => {
            if(!isSecureStoreAvailable) throw "SecureStore not available on Device";
            console.log("Secure Store Available !!");
        })
        .then(async () => {

            console.log("Querying Mnemonic");
            let mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
            if(mnemonic === null) {
                mnemonic = await generateMnemonic();
                await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic)
                .catch((reason:any) => { throw reason });
            }
            console.log("Got Mnemonic", mnemonic);

            const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
            const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

            const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, provider);

            pai.decimals()
            .then((result:ethers.BigNumber) => {
                dispatch({type: 'set_decimals', payload:result})
            });

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
            backgroundColor: loading ? '#e63946' : '#2961EC', 
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0, 
        }});
    }, [loading])


    if(loading || !initialized) return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e63946'}}>
            <StatusBar hidden={true} />
            <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24, fontFamily: "FugazOne", color: '#f1faee'}}>LOADING</Text>
            <ActivityIndicator size="large" color="#f1faee" />
        </View>
    );

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>
        <View style={[{flex: 4}, styles.hero]}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={styles.label}>Your Balance</Text>
                <Text style={[styles.balance, {marginBottom: 40}]}>{formatCurrency(balance || "0", 2, {prefix: '$'})}</Text>
            </View>
        </View>

        <View style={[{flex: 6}, styles.actionContainer]}>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{flex: 9}}>
                    <Button category="default" title="Send" iconName="upload" onPress={() => navigation.navigate("enter_amount")} /> 
                </View>
                <View style={{flex: 2}}><Text>&nbsp;</Text></View>
                <View style={{flex: 9}}>
                    <Button category="default" title="Receive" iconName="download" onPress={() => {navigation.navigate("account_info")}} /> 
                </View>
            </View>
            <View style={{flex: 3, backgroundColor: Colors.OFF_WHITE,  borderWidth: 0, borderRadius: 8, padding: 8, marginBottom: 40}}>
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
    backgroundColor: '#2961EC',
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
    backgroundColor: '#1951DC'
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