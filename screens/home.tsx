import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import {AntDesign} from '@expo/vector-icons';

import * as SecureStore from 'expo-secure-store';
import * as Random from 'expo-random';

import "@ethersproject/shims";
import { ethers } from 'ethers';

const Network = require('@maticnetwork/meta/network');
const Matic = require('@maticnetwork/maticjs').default;

import {MATIC_PROVIDER_URL, MNEMONIC_KEY, L1_PROVIDER_URL, MATIC_PAI_ADDRESS} from '../constants';

import { useAppContext } from "../app_context";

import PAI from '../reference/PAI.json';

const PAI_MATIC_ADDRESS = "";

type HomeProps = {
    navigation:any
};

const Home = ({navigation}:HomeProps) => {
    const [address, setAddress] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const [ state, dispatch ] = useAppContext();
    const { signer } = state;

    useEffect(() => {
        setLoading(true);

        SecureStore.isAvailableAsync()
        .then(isAvailable => {
            if(!isAvailable) {
                throw "SecureStore not available on Device";
            }

            (async () => {
                let mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
                if(mnemonic === null) {
                    console.info("Creating new mnemonic");
                    const randomMnemonic = await createMnemonic();

                    SecureStore.setItemAsync(MNEMONIC_KEY, randomMnemonic)
                    .then(() => {
                        mnemonic = randomMnemonic;
                    })
                    .catch((reason:any) => {
                        throw reason;
                    });
                }
                console.log("Got Mnemonic ...", mnemonic);

                const provider = new ethers.providers.JsonRpcProvider(MATIC_PROVIDER_URL)

                console.log("Creating Wallet");
                //@ts-ignore
                const wallet = ethers.Wallet.fromMnemonic(mnemonic);
                const signer = wallet.connect(provider);
                dispatch({type: 'set_signer', payload: signer});
                setLoading(false);
            })();
        });
    }, [])

    useEffect(() => {
        console.log("Signer", signer);
        (async () => {
            if(signer !== undefined) {
                const signerAddress = await signer.getAddress();
                setAddress(signerAddress);

                const network = new Network("testnet", "mumbai");
                const matic = new Matic({
                    network: network, 
                    maticProvider: MATIC_PROVIDER_URL,
                    parentProvider: L1_PROVIDER_URL
                });

                const balance = await matic.balanceOfERC20(signerAddress, PAI_MATIC_ADDRESS);
                console.log("Balance", balance);

            }
        })();
    }, [signer]);

    const createMnemonic = async () => {
        const randomBytes = await Random.getRandomBytesAsync(16);
        const mnemonic = ethers.utils.entropyToMnemonic(randomBytes)
        return mnemonic;
    }

    if(loading) return (
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
                <Text style={[styles.balance]}>$1,560,340.56</Text>
            </View>
        </View>
        <View style={{flex: 0.25, flexDirection: 'row', alignItems: 'flex-start', marginTop: 18, width: '100%', backgroundColor: '#CCC'}}>
            <View style={{flex: 1, marginRight: 9}}>
                <AntDesign.Button name="qrcode" onPress={()=>{navigation.navigate("scan")}}>QR</AntDesign.Button>
            </View>
            <View style={{flex: 1, marginLeft: 9, marginRight: 9}}>
                <AntDesign.Button name="upload" onPress={()=>{}}>Send</AntDesign.Button>
            </View>
            <View style={{flex: 1, marginLeft: 9}}>
                <AntDesign.Button name="download" onPress={()=>{}}>Receive</AntDesign.Button>
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
});

export default Home;