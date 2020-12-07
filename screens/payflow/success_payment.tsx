import React, { useEffect } from 'react';

import { StatusBar, View, StyleSheet, Image, Text, Pressable} from 'react-native';
import {useAppContext} from '../../app_context';

import {capitalize} from '../../utils/text_helpers';
import i18n from 'i18n-js';

type SuccessPaymentScreenProps = {
    route:any,
    navigation:any
};

const PendingPayment = ({navigation}:SuccessPaymentScreenProps) => {

    const [state, dispatch] = useAppContext();

    const ContinueButton = () => (
        <Pressable onPress={() => navigation.navigate("home")} style={{marginTop: 18}}>
            <View style={styles.buttonContainer}>
                <Text style={styles.buttonText}>{capitalize(i18n.t("back_to_wallet"))}</Text>
            </View>
        </Pressable>
    );


    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <Image source={require("../../assets/success.png")} style={{resizeMode: 'contain', width: '100%'}} /> 
                <Text style={styles.message}>{capitalize(i18n.t("your_payment_has_been_processed"))}</Text>
            </View>
            <View>
                <ContinueButton />
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
        paddingHorizontal: 20,
        paddingBottom: 40
    },

    title: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        marginBottom: 20
    },

    message: {
        fontFamily: 'Montserrat-Bold',
        lineHeight: 22,
        fontSize: 16,
        textAlign: 'center'
    },

    buttonContainer: { 
        backgroundColor: '#75bf72',
        paddingVertical: 22,
        paddingHorizontal: 64,
        borderRadius: 6,
    },

    buttonText: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#FFF"
    },
});


export default PendingPayment;