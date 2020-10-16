import React, { useEffect, useState } from "react";

import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import {AntDesign} from '@expo/vector-icons';

import * as SecureStore from 'expo-secure-store';

import ethers from 'ethers';
import PAI from '../reference/PAI.json';
import {L2_PROVIDER_URL, MNEMONIC_KEY, L2_PAI_ADDRESS} from '../constants';
import generateMnemonic from '../utils/generate_mnemonic';

import { useAppContext } from "../app_context";
import { formatCurrency } from "../utils/currency_helpers";


type HomeProps = {
    navigation:any
};

const Home = ({navigation}:HomeProps) => {
    const [address, setAddress] = useState<string>();
    const [balance, setBalance] = useState<string>();
    const [decimals, setDecimals] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
    const [loading, setLoading] = useState<boolean>(false);
    const [initialized, setInitialized] = useState<boolean>(false);

    const [ state, dispatch ] = useAppContext();
    const { signer } = state;

    useEffect(() => {
        SecureStore.isAvailableAsync()
        .then(isSecureStoreAvailable => {
            if(!isSecureStoreAvailable) throw "SecureStore not available on Device";
        })
        .then(async () => {

            let mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
            if(mnemonic === null) {
                mnemonic = await generateMnemonic();
                await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic)
                .catch((reason:any) => { throw reason });
            }

            const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
            const signer = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);

            const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, provider);
            pai.decimals()
            .then((result:ethers.BigNumber) => setDecimals(result))

            // dispatch({type: 'set_provider', payload: provider});
            dispatch({type: 'set_signer', payload: signer});
            setInitialized(true);
        });
    }, []);

    useEffect(() => {
        (async () => {
            if(signer !== undefined) {
                console.log("Fetching Account Balance");
                setLoading(true);

                const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, signer);
                const address = await signer.getAddress()
                console.log("address", address);

                setAddress(address);

                await pai.balanceOf(address)
                .then((balance:ethers.BigNumber) => setBalance(ethers.utils.formatUnits(balance, decimals)))
                .catch((error:any) => { throw error })
                .finally(() => setLoading(false));
            }
        })();
    }, [signer]);


    if(loading || !initialized) return (
        <View style={{flex: 0.8, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24}}>LOADING</Text>
            <ActivityIndicator size="large" color="#000" />
        </View>
    );

    return (
      <View style={styles.container}>
        <View style={[styles.hero, {flex: 1, marginTop: 40 }]}>
            <View>
                <Text style={[styles.label, {marginBottom: 20}]}>PAI Balance</Text>
                <Text style={[styles.balance]}>{formatCurrency(balance || "0", 2, {prefix: '$'})}</Text>
            </View>
        </View>
        <View style={{flex: 0.25, flexDirection: 'row', alignItems: 'flex-start', marginTop: 18, width: '100%'}}>
            <View style={{flex: 1, marginRight: 9}}>
                <AntDesign.Button name="upload" onPress={() => {navigation.navigate("scan")}} size={24}><Text style={styles.buttonText}>Send</Text></AntDesign.Button>
            </View>
            <View style={{flex: 1, marginLeft: 9}}>
                <AntDesign.Button name="download" onPress={()=>{}}size={24}><Text style={styles.buttonText}>Receive</Text></AntDesign.Button>
            </View>
        </View>
        <View style={{flex: 1, marginTop: 15}}>
            <Text>{address || "no network"}</Text>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: {
    backgroundColor: '#FFF', 
    borderRadius: 10,
    width: '100%',
    alignItems: 'center', 
    justifyContent: 'center'
  },

  label: {
      fontSize: 24,
  },


  balance: {
      fontSize: 36,
      fontWeight: 'bold'

  },

  buttonText: {
    fontSize: 17, 
    color: 'white', 
    fontWeight: 'bold' 
  },

});

export default Home;