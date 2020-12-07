import React, { useState } from "react";

import { StyleSheet, View, Text, StatusBar, ActivityIndicator } from "react-native";
import { formatCurrency, toWei } from "../../utils/currency_helpers";

import Button from '../../components/button';
import { ethers } from "ethers";
import { useAppState } from "../../app_context";

import { L2_PAI_ADDRESS, L2_PROVIDER_URL } from "../../constants";
import L2_PAI from '../../reference/L2_PAI.json';

import eip712Sign from "../../utils/eip712_sign";

import i18n from 'i18n-js';
import {titleize, capitalize} from '../../utils/text_helpers';

type EnterRecipientProps = {
    route:any,
    navigation:any
}

const ReviewMessage = ({route, navigation}:EnterRecipientProps) => {
    const {recipient, amount, message}:{recipient:string, amount:string, message:string} = route.params;

    const [isLoading, setLoading] = useState<boolean>(false);

    const {wallet} = useAppState();

    const onConfirmPayment = async () => {

        console.log("onPayPress", wallet === undefined, amount)
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

        const rsvSignature = await eip712Sign(chainId, signerAddress, recipient, weiAmount, metaNonce.toString(), deadline, wallet);

        if(rsvSignature === undefined) {
            console.log("Something went wrong; rsvSignature undefined");
            return;
        }

        // TODO: Send to relayer.
        const tx = await pai.permit(signerAddress, recipient, weiAmount, deadline, rsvSignature.v, rsvSignature.r, rsvSignature.s, {nonce, gasLimit: 90000, gasPrice: 2000000000})
        .then(async (response:ethers.providers.TransactionResponse) => {
            console.log(response)
            navigation.navigate("pending_payment", {txHash: response.hash})
        })
        .catch((error:any) => console.log(error))
        .finally(() => setLoading(false));
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8, padding: 20, width: '100%'}}>
                {isLoading && (
                    <View style={{flex: 0.25, alignItems: 'center', justifyContent: 'center'}}>
                        <ActivityIndicator size="large" />
                    </View>
                )}
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: "#CFD2D8", paddingVertical: 20, width: "100%"}}>
                    <Text style={styles.label}>{capitalize(i18n.t("recipient"))}</Text>
                    <Text style={styles.address}>{recipient.slice(0,24)}</Text>
                    <Text style={styles.address}>{recipient.slice(24)}</Text>
                </View>

                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',  width: '100%', borderBottomWidth: 1, borderBottomColor: "#CFD2D8", paddingVertical: 20}}>
                    <Text style={styles.label}>{capitalize(i18n.t("memo"))}</Text>
                    <Text style={styles.message}>{message}</Text>
                </View>

                <View style={{flex: 2, marginTop: 40, alignItems: 'center'}}>
                    <Text style={styles.label}>{capitalize(i18n.t("amount"))}</Text>
                    <Text style={styles.amount}>{formatCurrency(amount, 2, {prefix: "$"})}</Text>
                </View>

                <View style={{flex: 1}}>
                    <Button title={titleize(i18n.t("confirm_payment"))} onPress={onConfirmPayment} category="primary" disabled={isLoading} />
                </View>
            </View>

        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 40,
        backgroundColor: "#FFF"
    },

    label: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 16, 
        color: "#B5BBC9",
        marginBottom: 8
    },

    address: {
        fontSize: 14
    },

    amount: {
        fontSize: 44,
        fontFamily: 'Montserrat', 
    },
    
    message: {
        fontSize: 14,
        fontFamily: 'Montserrat',
        color: "#485068",
        textAlign: 'center'
    }
});

export default ReviewMessage;