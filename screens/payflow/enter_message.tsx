import React, { useEffect, useState } from "react";
import {ethers} from 'ethers';

import { StyleSheet, View, Text, StatusBar } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { formatCurrency } from "../../utils/currency_helpers";

import Button from '../../components/button';
import i18n from 'i18n-js';
import { titleize } from "../../utils/text_helpers";

type EnterRecipientProps = {
    route:any,
    navigation:any
}

const EnterMessage = ({route, navigation}:EnterRecipientProps) => {

    const [message, setMessage] = useState<string>("");
    const [hasFocus, setFocus] = useState<boolean>(false);


    const onReviewPayment = () => {
        navigation.navigate("review_payment", {message, amount: route.params.amount, recipient: route.params.recipient});
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content"/>
            <View style={{flex: 1, justifyContent: 'center'}}>
                <View style={[styles.inputTextContainer, {borderBottomColor: hasFocus ? "#347AF0" : "#CFD2D8", backgroundColor: "#CFCFCF50"}]}>
                    <TextInput
                        multiline
                        textAlignVertical="top" 
                        value={message} 
                        onChangeText={(text) => setMessage(text)} 
                        placeholder={titleize(i18n.t("optionally_leave_a_message"))}
                        style={styles.inputField} 
                        onFocus={() => setFocus(true)} 
                        onBlur={() => setFocus(false)} />
                </View>

            </View>

            <View style={{flex: 2}}>
                <Button title={titleize(i18n.t("review_payment"))} onPress={onReviewPayment} category="primary" />
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },

    inputTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1, 
        padding: 5,
    },

    inputField: {
        flex: 1,
        fontFamily: 'Montserrat',
        fontSize: 20, 
        padding: 8, 
        borderTopRightRadius: 3, 
        borderTopLeftRadius: 3,
    },

    inputIcon: {
        paddingVertical: 8, 
    },

    amountLegend: {
        fontFamily: 'Montserrat',
        fontSize: 14,
        color: "#485068"
    }

});

export default EnterMessage;