import React, { useEffect } from 'react';

import { StatusBar, View, StyleSheet, Image, Text, Pressable} from 'react-native';
import {useAppContext} from '../../app_context';

const PendingPayment = () => {

    const [state, dispatch] = useAppContext();

    const ContinueButton = () => (
        <Pressable onPress={() => {}} style={{marginTop: 18}}>
            <View style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Continue</Text>
            </View>
        </Pressable>
    );


    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require("../../assets/error.png")} style={{marginBottom: 40}} /> 
            </View>
            <View>
                <Text>An error has occurred, your payment has not been processed</Text>
                <ContinueButton />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
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
})

export default PendingPayment;