import React, { useEffect, useState } from "react";

import { StyleSheet, View, Text, StatusBar } from "react-native";

import Button from '../../components/button';
import NumericKeypad from "../../components/numeric_keypad";
import { formatCurrency } from "../../utils/currency_helpers";

import { useAppContext } from "../../app_context";
import { ethers } from "ethers";

import i18n from 'i18n-js';
import { capitalize, titleize } from '../../utils/text_helpers';

type EnterAmountProps = {
    navigation: any
}

const EnterAmount = ({navigation}:EnterAmountProps) => {

    const [amount, setAmount] = useState<string>("0");
    const [overdraft, setOverdraft] = useState<boolean>(false);
    const [isZero, setZero] = useState<boolean>(true);

    const handleChangeAmount = (value:string) => setAmount(value);

    const [state] = useAppContext();
    const {balance, decimals} = state;

    useEffect(() => {
        if(balance.length === 0) return; 

        const balanceBn = ethers.utils.parseUnits(balance, decimals);
        const amountBn = ethers.utils.parseUnits(amount || "0", decimals);

        setOverdraft(amountBn.gt(balanceBn) ? true : false);
        setZero(amountBn.eq(ethers.BigNumber.from("0")) ? true : false);
        console.log("isZero: ", isZero, amountBn.toString());

    }, [amount]);

    const onEnterRecipient = () => {
        navigation.navigate("enter_recipient", {amount});
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={{flex:0.5, alignItems: 'center', justifyContent: 'flex-end', width: '100%'}}>
                <Text style={styles.balance}>{capitalize(i18n.t("available"))} {formatCurrency(balance, 2, {prefix: '$'})}</Text>
            </View>

            <View style={{flex:1, alignItems: 'center', justifyContent: 'flex-end'}}>
                <Text style={[styles.amount, overdraft ? styles.red : styles.blue]}>{formatCurrency(amount || "0", 2, {prefix: '$'})}</Text>
            </View>

            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <Button title={titleize(i18n.t("enter_recipient"))} onPress={onEnterRecipient} category="primary" disabled={overdraft || isZero ? true : false} />
            </View>

            <View style={[styles.keypadContainer, {flex:3}]}>
                <NumericKeypad onChange={handleChangeAmount}/>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },

    keypadContainer: {
        backgroundColor: '#DEDEDE60',
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 60,
    },

    balance: {
        fontFamily: "Montserrat",
        fontSize: 18,
        color: "#485068",
        marginBottom: 8
    },

    blue: {
        color: "#3783F5"
    },

    red: {
        color: "#DF5060"
    },

    amount:{
        fontSize: 42,
        fontFamily: 'Montserrat-Bold',
    }
});

export default EnterAmount;