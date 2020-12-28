import React from 'react';

import { StatusBar, View, StyleSheet, Image, Text} from 'react-native';

import {capitalize} from '../../utils/text_helpers';
import i18n from 'i18n-js';

import * as Colors from '../../colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const DeviceNotElegible = () => {

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:9, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <Text style={styles.title}>Myo.Finance</Text>
                <Text style={styles.subTitle}>Peso Argentino Intangible</Text>
                <Image source={require("../../assets/error.png")} style={{resizeMode: 'contain', width: '100%'}} /> 
                <Text style={styles.message}>{capitalize(i18n.t("device_not_elegible"))}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20 
    },

    brand: {
        fontFamily: "Montserrat-Bold",
        fontSize: 16
    },

    title: {
        color: "#0D1F3C",
        fontFamily: 'FugazOne',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 36,
        marginBottom: 5,
    },

    subTitle: {
        color: '#78839C',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 18,
    },

    message: {
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        fontSize: 20,
        lineHeight: 32,
        marginBottom: 20
    }
})

export default DeviceNotElegible;