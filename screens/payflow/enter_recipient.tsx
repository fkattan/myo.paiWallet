import React, { useEffect, useState } from "react";
import {ethers} from 'ethers';

import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, StatusBar } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { formatCurrency } from "../../utils/currency_helpers";

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Button from '../../components/button';
import i18n from 'i18n-js';
import { titleize, capitalize } from "../../utils/text_helpers";
import { usePayflowContext } from "./payflow_context";

import * as Colors from '../../colors';
import { LinearGradient } from "expo-linear-gradient";

type EnterRecipientProps = {
    route:any,
    navigation:any
}

const EnterRecipient = ({route, navigation}:EnterRecipientProps) => {

    const [recipientValue, setRecipientValue] = useState<string>("");
    const [disabled, setDisabled] = useState<boolean>(true);
    const [hasFocus, setFocus] = useState<boolean>(false);

    const [payflowState, payflowDispatch] = usePayflowContext();
    const { amount, recipient} = payflowState;

    useEffect(() => {
        if(recipient !== undefined) setRecipientValue(recipient);
    }, [recipient])

    useEffect(() => {
        if(recipientValue && recipientValue.length > 0) {
            if(ethers.utils.isAddress(recipientValue)) setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [recipientValue]);

    const onEnterMessage = () => {
        payflowDispatch({type: 'set_recipient', payload: recipientValue})
        navigation.navigate("enter_message");
    }

    const onQRScan = () => {
        navigation.navigate("scan")
    }

    return (
        <LinearGradient style={styles.container} colors={[Colors.LIGHT_GRAY, Colors.WHITE]} locations={[0, 0.5]}>
            <StatusBar barStyle="dark-content" />
            <View style={{flex: 0.25, justifyContent: 'flex-end'}}>
                <Text style={styles.amountLegend}>{capitalize(i18n.t("amount_to_send"))}: {formatCurrency(amount || "0", 2, {prefix: "$"})}</Text>
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <View style={[styles.inputTextContainer, {borderBottomColor: hasFocus ? "#347AF0" : "#CFD2D8"}]}>
                        <TextInput multiline value={recipientValue} onChangeText={(text) => setRecipientValue(text)} style={styles.inputField} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
                        <TouchableOpacity onPress={onQRScan}>
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" style={styles.inputIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            <View style={{flex: 2}}>
                <Button title={titleize(i18n.t("continue"))} onPress={onEnterMessage} category="primary" disabled={disabled} />
            </View>
        </LinearGradient>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    inputTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1, 
        padding: 5
    },

    inputField: {
        flex: 1,
        fontFamily: 'Montserrat-Bold',
        fontSize: 18, 
        padding: 8, 
        borderTopRightRadius: 3, 
        borderTopLeftRadius: 3,
    },

    inputIcon: {
        paddingVertical: 8, 
    },

    amountLegend: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 24,
        color: "#3783F5"
    }

});

export default EnterRecipient;