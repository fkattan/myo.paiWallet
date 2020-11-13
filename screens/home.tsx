import React, { useEffect, useState } from "react";

import { StyleSheet, View, Text, ActivityIndicator, StatusBar } from "react-native";
import {AntDesign} from '@expo/vector-icons';

import PaiButton from '../components/button';

import * as SecureStore from 'expo-secure-store';

import "@ethersproject/shims"
import ethers from 'ethers';

import PAI from '../reference/PAI.json';
import {L1_PROVIDER_URL, MNEMONIC_KEY, L1_PAI_ADDRESS} from '../constants';
import generateMnemonic from '../utils/generate_mnemonic';

import { useAppContext } from "../app_context";
import { formatCurrency } from "../utils/currency_helpers";
import { shortenAddress } from "../utils/address_helpers";


type HomeProps = {
    navigation:any
};

const Home = ({navigation}:HomeProps) => {
    const [address, setAddress] = useState<string>();
    const [balance, setBalance] = useState<string>();
    const [decimals, setDecimals] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
    const [loading, setLoading] = useState<boolean>(true);
    const [initialized, setInitialized] = useState<boolean>(false);

    const [ state, dispatch ] = useAppContext();
    const { wallet } = state;

    useEffect(() => {
        SecureStore.isAvailableAsync()
        .then(isSecureStoreAvailable => {
            if(!isSecureStoreAvailable) throw "SecureStore not available on Device";
        })
        .then(async () => {

            let mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
            if(mnemonic === null) {
                console.log("Generating new Wallet");
                mnemonic = await generateMnemonic();
                await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic)
                .catch((reason:any) => { throw reason });
            }

            const provider = new ethers.providers.JsonRpcProvider(L1_PROVIDER_URL);
            const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

            const pai = new ethers.Contract(L1_PAI_ADDRESS, PAI.abi, provider);
            pai.decimals()
            .then((result:ethers.BigNumber) => setDecimals(result))

            // dispatch({type: 'set_provider', payload: provider});
            dispatch({type: 'set_wallet', payload: wallet});
            setInitialized(true);
        });
    }, []);

    useEffect(() => {
        if(decimals === undefined) return; 

        (async () => {
            if(wallet !== undefined) {
                console.log("Fetching Account Balance");
                setLoading(true);

                const pai = new ethers.Contract(L1_PAI_ADDRESS, PAI.abi, wallet);
                const address = await wallet.getAddress()
                console.log("address", address);

                setAddress(address);

                console.log("Fetching Account Balance");
                await pai.balanceOf(address)
                .then((balance:ethers.BigNumber) => {
                    console.log("decimals", decimals);
                    console.log("Balance", balance.toString(), ethers.utils.formatUnits(balance, decimals));
                    setBalance(ethers.utils.formatUnits(balance, decimals))
                })
                .catch((error:any) => { throw error })
                .finally(() => setLoading(false));
            }
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
        <View style={[styles.hero, {flex: 1}]}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end'}}>
                <Text style={[styles.balance]}>{formatCurrency(balance || "0", 2, {prefix: '$'})}</Text>
            </View>

            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', marginTop: 8, marginBottom: 18, paddingHorizontal: 30, width: '100%'}}>
                <View style={{flex: 1, marginRight: 9}}>
                    <PaiButton category="danger" title="Send" iconName="upload" onPress={() => navigation.navigate("scan")} /> 
                </View>
                <View style={{flex: 1, marginLeft: 9}}>
                    <PaiButton category="success" title="Receive" iconName="download" onPress={() => {}} /> 
                </View>
            </View>
        </View>

        <View style={{flex: 1, width: "100%", paddingBottom: 40, alignItems: 'center', justifyContent: 'flex-end'}}>
            <Text style={{fontFamily: 'FugazOne', fontSize: 16}}>Account</Text>
            <Text style={{fontFamily: 'FugazOne', fontSize: 16}}>{shortenAddress(address || "").toLowerCase() || "no network"}</Text>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: "#dee2e6"
  },

  brand: {
      fontFamily: 'FugazOne',
      fontSize: 18,
      color:'#e63946' 
  },

  tagLine: {
      fontFamily: "Montserrat-Bold",
      marginTop: 5,
      fontSize: 14,
      color:'#f1faee' 
  },

  hero: {
    padding: 8,
    backgroundColor: '#2961EC',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopWidth: 0,
    width: '100%',
    alignItems: 'center', 
    justifyContent: 'center'
  },

  label: {
      fontSize: 34,
      fontFamily: "Montserrat-Bold",
      color: "#f1faee",
  },


  balance: {
      fontSize: 42,
      fontWeight: 'bold',
      color: "#f1faee",

  },

  buttonText: {
    fontSize: 17, 
    color: 'white', 
    fontWeight: 'bold' 
  },

});

export default Home;