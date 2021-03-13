import React, { useState } from 'react';

import "@ethersproject/shims"
import { ethers } from 'ethers';

import { L2_PAI_ADDRESS, L2_PROVIDER_URL } from '../../constants';
import L2_PAI from '../../reference/L2_PAI.json';

import { TextInput, View, StyleSheet, Text, Button, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Pressable } from 'react-native';
import { shortenAddress } from '../../utils/address_helpers';

import {useAppContext} from '../../app_context';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import {toWei} from '../../utils/currency_helpers';
// import { _TypedDataEncoder } from 'ethers/lib/utils';

type PayProps = {
    route:any,
    navigation: any
}

const Pay = ({route, navigation}:PayProps) => {
    const [amount, setAmount] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const {recipient} = route.params;

    const [state, dispatch] = useAppContext();
    const {wallet} = state;

    const handleAmountChange = (value:string):void => {setAmount(value)};

    const eip712Sign = async (chainId:number, signerAddress:string, recipient:string, wei:string, nonce:string, deadline:string) => {
        if(wallet === undefined) return undefined; 

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
        const walletProvider = wallet.connect(provider);

        const domain = {
            name: "Peso Argentino Intangible",
            version: "1",
            chainId,
            verifyingContract: L2_PAI_ADDRESS 
        };

        const values:Record<string, any> = {
            owner: signerAddress, 
            spender: recipient, 
            value: wei,
            nonce,
            deadline
        };
        
        const types = {
            Permit: [
                {name: "owner", type: "address"},
                {name: "spender", type: "address"},
                {name: "value", type: "uint256"},
                {name: "nonce", type: "uint256"},
                {name: "deadline", type: "uint256"},
            ]
        };

        const signature = await walletProvider._signTypedData(domain, types, values);
        const rsvSignature = ethers.utils.splitSignature(signature);

        return rsvSignature;
    }

    const onPayPress = async () => {
        if(!wallet || !amount) throw "Invalid Signer or Payment Amount";

        setLoading(true);

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
        const walletProvider = wallet.connect(provider);

        const pai = new ethers.Contract(L2_PAI_ADDRESS, L2_PAI.abi, walletProvider);

        const signerAddress = await walletProvider.getAddress();
        const chainId = await walletProvider.getChainId();
        const {timestamp} = await provider.getBlock(await provider.getBlockNumber());
        const nonce = await walletProvider.getTransactionCount();
        const metaNonce = await pai.nonces(signerAddress);
        const deadline:string = ((timestamp + 1000) * 1000).toString();
        const weiAmount = toWei(amount)

        const rsvSignature = await eip712Sign(chainId, signerAddress, recipient, weiAmount, metaNonce.toString(), deadline);

        if(rsvSignature === undefined) {
            console.log("Something went wrong; rsvSignature undefined");
            return;
        }

        // TODO: Send to relayer.
        const tx = await pai.permit(signerAddress, recipient, weiAmount, deadline, rsvSignature.v, rsvSignature.r, rsvSignature.s, {nonce, gasLimit: 90000, gasPrice: 2000000000})
        .then(async (response:ethers.providers.TransactionResponse) => {
            navigation.navigate("pending_payment", {txHash: response.hash})
        })
        .catch((error:any) => console.log(error))
        .finally(() => setLoading(false));
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS !== 'ios' ? 'height': 'padding'}>
                <ActivityIndicator size="large" color="#f1faee" animating={loading} />
                <View style={[styles.hero, {flex: 2}]}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={[styles.beneficiary, {fontSize: 32}]}>Beneficiary</Text>
                        <Text style={styles.account}>{recipient ? shortenAddress(recipient) : "No Account"}</Text>
                    </TouchableWithoutFeedback>
                </View>
            </KeyboardAvoidingView>

                <View style={{flex: 1, marginTop: 24 }}>
                    <Text style={styles.label}>PAI Amount to Pay</Text>
                    <TextInput value={amount} onChangeText={handleAmountChange} placeholder="$0.00" keyboardType="default" style={styles.input} />
                    <Text style={[styles.info, {textAlign: 'right'}]}>Your Balance: [balance]</Text>
                </View>

                <View style={{flex: 1, justifyContent: 'flex-end', paddingBottom: 20}}>
                    <Button title="Pay" onPress={onPayPress} />
                </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        flexDirection: 'column',
        padding: 18,
    }, 

    hero: {
        backgroundColor: '#2961EC',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },

    beneficiary: {
        fontWeight: 'bold', 
        fontSize: 20, 
        color: '#FFFFFF',
        marginBottom: 18,
        marginTop: 18
    },

    label: {
        fontSize: 16, 
        marginBottom: 8,
        marginTop: 18,
        color: '#B5BBc9'
    },

    info: {
        fontSize: 16,
        textAlign: 'right',
        color: '#B5bbc9'
    },

    account: {
        fontWeight: 'bold', 
        fontFamily: 'Montserrat',
        fontSize: 16,
        color: '#FFFFFF',
    },

    input: {
        padding: 8, 
        borderBottomWidth: 2, 
        fontSize: 36,
        borderColor: '#3d4c63', 
        width: "100%",
        marginBottom: 8
    }
});

export default Pay; 