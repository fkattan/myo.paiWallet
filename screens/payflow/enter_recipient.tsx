import React, { useEffect, useState } from "react";
import {ethers} from 'ethers';

import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, StatusBar } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { formatCurrency } from "../../utils/currency_helpers";

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Button from '../../components/button';

type EnterRecipientProps = {
    route:any,
    navigation:any
}

const EnterRecipient = ({route, navigation}:EnterRecipientProps) => {

    const [recipient, setRecipient] = useState<string>("");
    const [disabled, setDisabled] = useState<boolean>(true);
    const [hasFocus, setFocus] = useState<boolean>(false);

    useEffect(() => {
        if(recipient && recipient.length > 0) {
            if(ethers.utils.isAddress(recipient)) setDisabled(false);
        } else {
            setDisabled(true);
        }

    }, [recipient]);

    useEffect(() => {
        if(route.params?.recipient) {
            setRecipient(route.params.recipient);
        };
    },[route.params?.recipient])

    const onEnterMessage = () => {
        navigation.navigate("enter_message", {recipient, amount:route.params.amount});
    }

    const onQRScan = () => {
        navigation.navigate("scan")
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={{flex: 0.25, justifyContent: 'flex-end'}}>
                <Text style={styles.amountLegend}>Sending: {formatCurrency(route.params.amount, 2, {prefix: "$"})}</Text>
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <View style={[styles.inputTextContainer, {borderBottomColor: hasFocus ? "#347AF0" : "#CFD2D8"}]}>
                        <TextInput multiline value={recipient} onChangeText={(text) => setRecipient(text)} style={styles.inputField} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
                        <TouchableOpacity onPress={onQRScan}>
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" style={styles.inputIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            <View style={{flex: 2}}>
                <Button title="Add a Message" onPress={onEnterMessage} category="primary" disabled={disabled} />
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