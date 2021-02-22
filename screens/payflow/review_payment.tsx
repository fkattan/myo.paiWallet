import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//@ts-ignore
import ProgressBar from 'react-native-progress/Bar'; 
import { LinearGradient } from "expo-linear-gradient";
import Button from '../../components/button';
import { StyleSheet, View, Text, StatusBar, Animated } from "react-native";

import { FontAwesome } from '@expo/vector-icons'; 

import { useAppState } from "../../app_context";
import { Recipient, TransactionStatus, usePayflowContext } from "./payflow_context";

import { ethers } from "ethers";
import { L2_ACH_ADDRESS, L2_PAI_ADDRESS } from "../../constants";
import L2_PAI from '../../reference/L2_PAI.json';
import L2_ACH from '../../reference/L2_PAI.json';

import { signPermit, signTransfer }  from "../../utils/eip712_sign";

import {titleize, capitalize} from '../../utils/text_helpers';
import { formatCurrency, toWei } from "../../utils/currency_helpers";

import  * as Colors from '../../colors';

import i18n from 'i18n-js';

type EnterRecipientProps = {
    route:any,
    navigation:any
}

// const RELAYER_URL =  "https://myo-backend-55739.uk.r.appspot.com";
const RELAYER_URL = "http://192.168.7.73:4000/api";

const ReviewMessage = ({navigation}:EnterRecipientProps) => {

    const {wallet} = useAppState();
    const [payflowState, dispatch] = usePayflowContext();
    const {recipient, amount, memo, txStatus, receipt} = payflowState;

    const [progress, setProgress] = useState<number>(0);

    const undefinedOpacity = useRef(new Animated.Value(0)).current;
    const inProgressOpacity = useRef(new Animated.Value(0)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;
    const errorOpacity = useRef(new Animated.Value(0)).current;

    const fadeIn = (value:Animated.Value, duration=1000) => {
        return Animated.timing(value, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        });
    }

    const fadeOut = (value:Animated.Value, duration=1000) => {
        return Animated.timing(value, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true
        });
    }

    const transitionToInProgress = () => {
        fadeOut(undefinedOpacity, 250).start(() => {
            dispatch({type: 'set_tx_status', payload: TransactionStatus.IN_PROGRESS});
        });
    }

    const transitionToSuccess = () => {
        Animated.sequence([
            Animated.delay(300),
            fadeOut(inProgressOpacity, 1250)
        ]).start(() => {
            dispatch({type: 'set_tx_status', payload: TransactionStatus.SUCCESS});
        });
    }

    const transitionToError = () => {
        Animated.sequence([
            Animated.delay(300),
            fadeOut(inProgressOpacity, 1250)
        ]).start(() => {
            dispatch({type: 'set_tx_status', payload: TransactionStatus.ERROR});
        });
    }

    // Keep UI aligned to TX Status
    useEffect(() => {
        switch(txStatus) {
            case TransactionStatus.UNDEFINED:
                fadeIn(undefinedOpacity, 250).start();
                break; 
            
            case TransactionStatus.IN_PROGRESS:
                fadeIn(inProgressOpacity).start();
                break;
            
            case TransactionStatus.SUCCESS: 
                fadeIn(successOpacity).start();
                break;
            
            case TransactionStatus.ERROR:
                fadeIn(errorOpacity).start();
                break;
        }
    }, [txStatus])

    useEffect(() => {
        switch(txStatus) {
            // Execute Payment when TX Status is set to IN_PROGRESS
            // Separate execution from button press, to get better UI performance
            case TransactionStatus.IN_PROGRESS:
                if(!wallet || !amount || !recipient) {
                    console.error("Invalid wallet, amount, or recipient");
                    return;
                }
                processPaymentRequest(wallet, amount, recipient)
                break; 
            
            // Store Memo field locally: associated with this tx's hash
            case TransactionStatus.SUCCESS: 
                if(receipt === undefined || memo === undefined) break;
                AsyncStorage.setItem(receipt.transactionHash, memo);

        }

    }, [txStatus]);


    const onConfirmPayment = () => {

        if(!wallet || !amount || !recipient) {
            console.error("Invalid wallet, amount, or recipient");
            throw "Invalid Signer or Payment Amount";
        }

        transitionToInProgress();
    }

    const processPaymentRequest = async (wallet:ethers.Wallet, amount:string, recipient:Recipient) => {

        setProgress(0.25);

        try {
            const provider = wallet.provider;
            const pai = new ethers.Contract(L2_PAI_ADDRESS, L2_PAI.abi, provider);
            const ach = new ethers.Contract(L2_ACH_ADDRESS, L2_ACH.abi, provider);
            setProgress(0.30);

            const signerAddress = await wallet.getAddress();
            const chainId = await wallet.getChainId();
            const {timestamp} = await provider.getBlock(await provider.getBlockNumber());
            const paiNonce = await pai.nonces(signerAddress);
            const achNonce = await ach.nonces(signerAddress);

            // TX valid for 60 seconds. if it's not sent before that it will be expired. 
            const deadline:string = ((timestamp + 60)).toString();
            const weiAmount = toWei(amount)
            setProgress(0.40);

            // const rsvSignature = await eip712Sign(chainId, signerAddress, recipient, weiAmount, metaNonce.toString(), deadline, wallet);
            const permitSignature = await signPermit(chainId, signerAddress, L2_ACH_ADDRESS, weiAmount, paiNonce.toString(), deadline, wallet);
            const transferSignature = await signTransfer(chainId, signerAddress, recipient.address, weiAmount, "0", achNonce.toString(), deadline, L2_ACH_ADDRESS, wallet );
            setProgress(0.50);

            if(permitSignature === undefined) {
                console.log("Something went wrong; rsvSignature undefined");
                return;
            }

            const controller = new AbortController();
            const fetchTimeout = setTimeout(() => controller.abort(), 35000); // 15s

            console.log("Sending Request to relayer", RELAYER_URL);
            const response = await fetch(RELAYER_URL, {
                signal: controller.signal,
                method: 'POST',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    signerAddress, 
                    recipient: recipient.address,
                    spender: L2_ACH_ADDRESS,
                    wei: weiAmount,
                    fee: "0",
                    nonce: achNonce.toString(),
                    deadline, 
                    permitSignature,
                    transferSignature
                })
            });

            clearTimeout(fetchTimeout);
            console.log(JSON.stringify(response, null, 4));

            if(response.ok) {
                setProgress(1);
                transitionToSuccess();
                // TODO: Set payflow state with appropiate response
                // dispatch({type: 'set_tx_receipt', payload: response});
            } else {
                dispatch({type: 'error', error: `Reverted [status:${response.status}]`});
                transitionToError();
            }

        } catch(e) {
            console.log("Error Processing Payment");
            console.log(JSON.stringify(e));
            transitionToError();
        }
    };

    if(!recipient || !amount) {
        return (
            <View style={styles.container}>
                <Text>Something went wrong</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                <LinearGradient locations={[0.10, 0.90]} colors={[Colors.PRIMARY_BLUE, Colors.PRIMARY_BLUE_MONOCHROME_DARK]} style={{flex:0.35, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <Button 
                            title={[TransactionStatus.SUCCESS, TransactionStatus.ERROR].indexOf(txStatus) !== -1 ? capitalize(i18n.t("back_to_wallet")) : capitalize(i18n.t("back"))} 
                            category="primary" 
                            onPress={() => [TransactionStatus.SUCCESS, TransactionStatus.ERROR].indexOf(txStatus) !== -1 ? navigation.navigate('home') : navigation.goBack()}
                            disabled={[TransactionStatus.SUCCESS, TransactionStatus.ERROR, TransactionStatus.UNDEFINED].indexOf(txStatus) === -1}
                            />
                </LinearGradient>
                <View style={{flex: 1, marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderColor: Colors.BLACK, width: "100%", backgroundColor: Colors.WHITE, paddingTop: 20, paddingBottom: 40}}>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Colors.LIGHT_GRAY, paddingVertical: 20, width: "100%"}}>
                        <Text style={styles.label}>{capitalize(i18n.t("recipient"))}</Text>
                        {recipient.name ? (
                            <Text style={styles.address}>{recipient.name}</Text>
                        ): (
                            <View>
                                <Text style={styles.address}>{recipient.address.slice(0,24)}</Text>
                                <Text style={styles.address}>{recipient.address.slice(24)}</Text>
                            </View>
                        )}
                    </View>

                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',  width: '100%', borderBottomWidth: 1, borderBottomColor: Colors.LIGHT_GRAY, paddingVertical: 20}}>
                        <Text style={styles.label}>{capitalize(i18n.t("memo"))}</Text>
                        <Text style={styles.message}>{memo}</Text>
                    </View>

                    <View style={{flex: 2, marginTop: 40, alignItems: 'center'}}>
                        <Text style={styles.label}>{capitalize(i18n.t("amount"))}</Text>
                        <Text style={styles.amount}>{formatCurrency(amount, 2, {prefix: "$"})}</Text>
                    </View>

                    {txStatus === TransactionStatus.UNDEFINED && (
                        <Animated.View style={{flex: 2, alignItems: 'center', justifyContent: 'center', opacity: undefinedOpacity}}>
                            <Button title={titleize(i18n.t("confirm_payment"))} onPress={() => onConfirmPayment() } category="primary" /> 
                        </Animated.View>
                    )}

                    {txStatus === TransactionStatus.IN_PROGRESS && (
                        <Animated.View style={{flex: 2, alignItems: 'center', justifyContent: 'center', opacity: inProgressOpacity}}>
                            <ProgressBar progress={progress} color={Colors.PRIMARY_BLUE} borderRadius={0} height={2} width={200} borderColor={Colors.LIGHT_GRAY} />
                        </Animated.View>
                    )}

                    {txStatus === TransactionStatus.SUCCESS && (
                        <Animated.View style={{flex: 2, alignItems: 'center', justifyContent: 'center', opacity: successOpacity}}>
                            <FontAwesome name="check-circle" color={Colors.GREEN} size={54} />
                            <Text style={[styles.label, {marginTop: 8}]}>{capitalize(i18n.t('success'))}</Text>
                        </Animated.View>
                    )}

                    {txStatus === TransactionStatus.ERROR && (
                        <Animated.View style={{flex: 2, alignItems: 'center', justifyContent: 'center', opacity: errorOpacity}}>
                            <FontAwesome name="info-circle" color={Colors.RED} size={54} />
                            <Text style={[styles.label, {marginTop: 8}]}>{capitalize(i18n.t('error'))}</Text>
                        </Animated.View>
                    )}
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