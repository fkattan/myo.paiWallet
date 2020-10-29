import React, { useState } from 'react';

import "@ethersproject/shims"
import { ethers } from 'ethers';
import { TypedData, TypedDataUtils } from 'ethers-eip712'
import { L2_PAI_ADDRESS, L2_PROVIDER_URL } from '../constants';
import L2_PAI from '../reference/L2_PAI.json';

import { TextInput, View, StyleSheet, Text, Button, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { shortenAddress } from '../utils/address_helpers';

import {useAppContext} from '../app_context';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import {toWei} from '../utils/currency_helpers';

const BN = ethers.BigNumber;

type PayProps = {
    route:any,
    navigation: any
}

const Pay = ({route, navigation}:PayProps) => {
    const [amount, setAmount] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const {recipient} = route.params;

    const [state, dispatch] = useAppContext();
    const {signer} = state;

    const handleAmountChange = (value:string):void => {setAmount(value)};

    const getEIP712Message = (chainId:number, owner:string, spender:string, value:string, nonce:string, deadline:string):TypedData => (

        {
            types: {
                EIP712Domain: [
                    {name: "name", type: "string"},
                    {name: "version", type: "string"},
                    {name: "chainId", type: "uint256"},
                    {name: "verifyingContract", type: "address"},
                ],
                Permit: [
                    {name: "owner", type: "address"},
                    {name: "spender", type: "address"},
                    {name: "value", type: "uint256"},
                    {name: "nonce", type: "uint256"},
                    {name: "deadline", type: "uint256"},
                ]
            },
            primaryType: 'Permit' as const,
            domain: {
                name: "Peso Argentino Intangible",
                version: "1",
                chainId: chainId,
                verifyingContract: L2_PAI_ADDRESS 
            }, 
            message: {
                owner,
                spender,
                value,
                nonce,
                deadline
            }
        }
    );

    const onPayPress = async () => {
        console.log("onPayPress", signer === undefined, amount)
        if(!signer || !amount) throw "Invalid Signer or Payment Amount";

        setLoading(true);


        const signerAddress = await signer.getAddress();
        console.log("Signer Address", signerAddress);

        const nonce = await signer.getTransactionCount("pending");
        console.log("Nonce", nonce);

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
        signer.connect(provider);

        const timestamp = await (await provider.getBlock(await provider.getBlockNumber())).timestamp;
        console.log("Timestamp", timestamp);

        const pai = new ethers.Contract(L2_PAI_ADDRESS, L2_PAI.abi, signer);
        const metaNonce:ethers.BigNumber = await pai.nonces(signerAddress);

        const chainId = await signer.getChainId();

        const typedMessage = getEIP712Message(chainId, signerAddress, recipient, amount, metaNonce.toString(), "0");
        console.log("typedMessage", typedMessage);

        const digest = TypedDataUtils.encodeDigest(typedMessage);
        const digestHex = ethers.utils.hexlify(digest).toString();
        console.log("Digest", digestHex.toString());

        const signature = await signer.signMessage(digest);

        const rsvSignature = ethers.utils.splitSignature(signature);
        console.log("Signature RSV", rsvSignature);

        // TODO: Send to relayer.
        // EIP712 Typed Message + Signature
        const tx = await pai.permit(signerAddress, recipient, toWei(amount), timestamp + 1000, rsvSignature.v, rsvSignature.r, rsvSignature.s, {nonce, gasLimit: 90000, gasPrice: 2000000000})
        .then(async (response:ethers.providers.TransactionResponse) => {
            console.log(response)
            await response.wait(2)
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