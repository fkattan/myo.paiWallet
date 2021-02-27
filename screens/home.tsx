import React, { useEffect, useState } from "react";

import { StyleSheet, View, Text, StatusBar } from "react-native";
import * as Colors from '../colors';
import Button from '../components/button';
//@ts-ignore
import ProgressBar from 'react-native-progress/Bar'; 

import * as SecureStore from 'expo-secure-store';

import "@ethersproject/shims"
import {ethers} from 'ethers';

import L2_PAI from '../reference/L2_PAI.json';
import {L2_PROVIDER_URL, L2_PAI_ADDRESS} from '../constants';
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
    const [address, setAddress] = useState<string>();

    const [ state, dispatch ] = useAppContext();
    const { wallet, balance, decimals } = state;



    useEffect(() => {

        // Try to recover Private Key from secure store; if it can't be recovered, 
        // try to get mnemonic from secure store, If it can't: generate a new mnemonic
        // and use that to derive private key, signer, and wallet. 
        const initializeWallet = async () => {

            let pk = await SecureStore.getItemAsync("pai.privatekey");
            if(pk === null) {
                
                // Generate a new wallet
                let mnemonic = await SecureStore.getItemAsync("pai.mnemonic");
                if(mnemonic === null) mnemonic = await generateMnemonic();

                const signer = ethers.Wallet.fromMnemonic(mnemonic);
                pk = signer.privateKey;

                SecureStore.setItemAsync("pai.privatekey", signer.privateKey)
                .catch((reason:any) => { throw reason });

                SecureStore.setItemAsync("pai.mnemonic", mnemonic)
                .catch((reason:any) => { throw reason });
            }

            //@ts-ignore
            const signer = new ethers.Wallet(pk);
            const wallet = signer.connect(new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL));
            dispatch({type: 'set_wallet', payload: wallet});

            setInitialized(true);

            return wallet;
        };

        SecureStore.isAvailableAsync()
        .then(isSecureStoreAvailable => {
            if(!isSecureStoreAvailable) throw "SecureStore not available on Device";
            initializeWallet()
            .then((wallet) => {
                if(!address || wallet.address !== address) setAddress(wallet.address);
            });
        })

    }, []);

    // When address becomes available
    // Fetch latest balance and decimals from the network
    useEffect(() => {
        if(address === undefined) return; 

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
        const pai = new ethers.Contract(L2_PAI_ADDRESS, L2_PAI.abi, provider);


        const transferFromMe = pai.filters.Transfer(address);
        const transferToMe = pai.filters.Transfer(null, address);

        pai.on(transferFromMe, () => fetchBalance(pai));
        pai.on(transferToMe, () => fetchBalance(pai));

        setLoading(true);
        Promise.all([
            pai.decimals()
            .then((result:ethers.BigNumber) => dispatch({type: 'set_decimals', payload:result})),

            pai.balanceOf(address)
            .then((balance:ethers.BigNumber) => dispatch({type: "set_balance", payload: ethers.utils.formatUnits(balance, decimals)}))
        ])
        .catch((error:any) => { throw error })
        .finally(() => setLoading(false));

        return () => {
            pai.off(transferToMe, fetchBalance);
            pai.off(transferFromMe, fetchBalance);
        }

    }, [address])

    const fetchBalance = (pai:ethers.Contract) => {
        pai.balanceOf(address)
        .then((balance:ethers.BigNumber) => dispatch({type: "set_balance", payload: ethers.utils.formatUnits(balance, decimals)}))
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content"/>
        <LinearGradient locations={[0.25, 0.95]} colors={[Colors.PRIMARY_BLUE_MONOCHROME_DARK, Colors.PRIMARY_BLUE]} style={[{flex: 4}, styles.hero]}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={styles.label}>{titleize(i18n.t("your_balance"))}</Text>
                <Text style={[styles.balance, {marginBottom: 40}]}>{formatCurrency(balance || "0", 2, {prefix: '$'})}</Text>
                {loading ? (
                    <ProgressBar progress={0} indeterminate={true} color={Colors.PRIMARY_BLUE_TRIADIC_DANGER} borderRadius={0} height={3} width={200} borderWidth={1} borderColor={Colors.PRIMARY_BLUE_MONOCHROME} />
                ): (
                    <ProgressBar progress={0} indeterminate={false} color={Colors.PRIMARY_BLUE} borderRadius={0} height={5} width={200} borderWidth={0} borderColor={Colors.PRIMARY_BLUE} />
                )}
            </View>
        </LinearGradient>

        <View style={[{flex: 6}, styles.actionContainer]}>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{flex: 9}}>
                    <Button category="primary-mono" title={capitalize(i18n.t("send"))} iconName="upload" onPress={() => initialized && !loading && navigation.navigate("payflow")} /> 
                </View>
                <View style={{flex: 2}}><Text>&nbsp;</Text></View>
                <View style={{flex: 9}}>
                    <Button category="primary-mono" title={capitalize(i18n.t("receive"))} iconName="download" onPress={() => {initialized && !loading && navigation.navigate("account_info")}} /> 
                </View>
            </View>
            <View style={[{flex: 3}, styles.transactionHistoryContainer]}>
                <Text style={styles.transactionHistoryTitle}>{titleize(i18n.t("latest_transactions"))}</Text>
                <TransactionHistory />
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