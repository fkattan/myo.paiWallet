import React, { useState } from 'react';

import "@ethersproject/shims"
import { ethers } from 'ethers';
// import { TypedData, TypedDataUtils, encodeTypedDataDigest } from 'ethers-eip712'
import { L1_PAI_ADDRESS, L1_PROVIDER_URL } from '../../constants';
import L2_PAI from '../../reference/L2_PAI.json';

import { TextInput, View, StyleSheet, Text, Button, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Pressable } from 'react-native';
import { shortenAddress } from '../../utils/address_helpers';

import {useAppContext} from '../../app_context';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import {toWei} from '../../utils/currency_helpers';
import { _TypedDataEncoder } from 'ethers/lib/utils';

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
    const {wallet} = state;

    const handleAmountChange = (value:string):void => {setAmount(value)};

    // const getEIP712Message = (chainId:number, owner:string, spender:string, value:string, nonce:string, deadline:string):TypedData => (

    //     {
    //         types: {
    //             EIP712Domain: [
    //                 {name: "name", type: "string"},
    //                 {name: "version", type: "string"},
    //                 {name: "chainId", type: "uint256"},
    //                 {name: "verifyingContract", type: "address"},
    //             ],
    //             Permit: [
    //                 {name: "owner", type: "address"},
    //                 {name: "spender", type: "address"},
    //                 {name: "value", type: "uint256"},
    //                 {name: "nonce", type: "uint256"},
    //                 {name: "deadline", type: "uint256"},
    //             ]
    //         },
    //         primaryType: 'Permit' as const,
    //         domain: {
    //             name: "Peso Argentino Intangible",
    //             version: "1",
    //             chainId: chainId,
    //             verifyingContract: L1_PAI_ADDRESS 
    //         }, 
    //         message: {
    //             owner,
    //             spender,
    //             value,
    //             nonce,
    //             deadline
    //         }
    //     }
    // );

    const eip712Sign = async (chainId:number, signerAddress:string, recipient:string, wei:string, nonce:string, deadline:string) => {
        if(wallet === undefined) return undefined; 

        const provider = new ethers.providers.JsonRpcProvider(L1_PROVIDER_URL);
        wallet.connect(provider);

        const domain = {
            name: "Peso Argentino Intangible",
            version: "1",
            chainId,
            verifyingContract: L1_PAI_ADDRESS 
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

        const values:Record<string, any> = {
            owner: signerAddress, 
            spender: recipient, 
            value: wei,
            nonce,
            deadline
        };

        console.log("Payload", _TypedDataEncoder.getPayload(domain, types, values));

        const signature = await wallet._signTypedData(domain, types, values);
        console.log("Signature", signature);

        const rsvSignature = ethers.utils.splitSignature(signature);
        console.log("Signature RSV", rsvSignature);

        console.log("Domain Hash", _TypedDataEncoder.hashDomain(domain));

        return rsvSignature;
    }

    const onPayPress = async () => {
        console.log("onPayPress", wallet === undefined, amount)
        if(!wallet || !amount) throw "Invalid Signer or Payment Amount";

        setLoading(true);

        const signerAddress = await wallet.getAddress();
        console.log("Signer Address", signerAddress);

        const provider = new ethers.providers.JsonRpcProvider(L1_PROVIDER_URL);
        wallet.connect(provider);

        const chainId = await wallet.getChainId();

        const {number, timestamp} = await provider.getBlock(await provider.getBlockNumber());
        console.log("Block Timestamp", timestamp);
        console.log("Bock Number", number);

        // const nonce = await provider.getTransactionCount(signerAddress, number);
        const nonce = await wallet.getTransactionCount("pending");
        console.log("Nonce", nonce);

        const pai = new ethers.Contract(L1_PAI_ADDRESS, L2_PAI.abi, wallet);
        const metaNonce:ethers.BigNumber = await pai.nonces(signerAddress);
        console.log("Meta-Nonce", metaNonce.toString());

        const deadline:string = ((timestamp + 1000) * 1000).toString();
        console.log("Deadline: ", deadline);

        const weiAmount = toWei(amount)
        console.log("WEI Amount", weiAmount);

        const rsvSignature = await eip712Sign(chainId, signerAddress, recipient, weiAmount, metaNonce.toString(), deadline);

        if(rsvSignature === undefined) {
            console.log("Something went wrong; rsvSignature undefined");
            return;
        }


        // const chainId = await wallet.getChainId();
        // console.log("ChainID", chainId);

        // const typedMessage = getEIP712Message(chainId, signerAddress, recipient, weiAmount, metaNonce.toString(), deadline);
        // console.log("typedMessage", typedMessage);

        // console.log("Encoded Type", TypedDataUtils.encodeType(typedMessage.types, "Permit"))
        // console.log("Type Hash", ethers.utils.hexlify(TypedDataUtils.typeHash(typedMessage.types, "Permit")).toString());
        // console.log("Message Hash", ethers.utils.hexlify(TypedDataUtils.hashStruct(typedMessage, "Permit", typedMessage.message)).toString());

        // console.log("Encoded Domain Type", TypedDataUtils.encodeType(typedMessage.types, "EIP712Domain"));
        // console.log("Encoded Domain Type Hash", ethers.utils.hexlify(TypedDataUtils.typeHash(typedMessage.types, "EIP712Domain")).toString());
        // console.log("Domain Hash", ethers.utils.hexlify(TypedDataUtils.hashStruct(typedMessage, "EIP712Domain", typedMessage.domain)).toString());

        // // EIP712 Typed Message + Signature
        // const digest = encodeTypedDataDigest(typedMessage);
        // console.log("Digest", ethers.utils.hexlify(digest).toString());

        // const signature = await wallet.signMessage(digest);

        // const rsvSignature = ethers.utils.splitSignature(signature);
        // console.log("Signature RSV", rsvSignature);
        
        // console.log("Recovered Address", ethers.utils.verifyMessage(digest, signature));



        // TODO: Send to relayer.
        const tx = await pai.permit(signerAddress, recipient, weiAmount, deadline, rsvSignature.v, rsvSignature.r, rsvSignature.s, {nonce, gasLimit: 90000, gasPrice: 2000000000})
        .then(async (response:ethers.providers.TransactionResponse) => {
            console.log(response)
            navigation.navigate("pending_payment", {txHash: response.hash})
            // await response.wait(2)
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