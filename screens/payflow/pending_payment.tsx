import React, { useEffect } from 'react';
import "@ethersproject/shims"
import { ethers } from 'ethers';

import { StatusBar, View, StyleSheet, Image, ActivityIndicator, Text} from 'react-native';
import {useAppContext} from '../../app_context';
import { L2_PROVIDER_URL } from '../../constants';

import {capitalize} from '../../utils/text_helpers';
import i18n from 'i18n-js';

type PendingPaymentScreenProps = {
    route:any,
    navigation:any
};

const PendingPayment = ({route, navigation}:PendingPaymentScreenProps) => {

    const [state, dispatch] = useAppContext();

    useEffect(()=> {

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);

        const {txHash} = route.params;

        // TODO: Listen to transaction confirm / reject navigate to SuccessPayment or ErrorPayment accordingly 
        provider.waitForTransaction(txHash).then((receipt:ethers.providers.TransactionReceipt) => {
            if(receipt.status !== 1) {
                // Reverted
                navigation.navigate("error_payment");
                return;
            }
            navigation.navigate("success_payment");
        });
    }, []);


    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <Image source={require("../../assets/working.png")} style={{resizeMode: 'contain', width: '100%'}} /> 
                <Text style={styles.title}>{capitalize(i18n.t("working"))} ...</Text>
                <ActivityIndicator animating={true} size="large" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        marginBottom: 20
    }
})

export default PendingPayment;