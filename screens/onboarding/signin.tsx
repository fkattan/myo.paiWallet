import React, { useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

import { StatusBar, View, Text, StyleSheet, Pressable, Image} from 'react-native';
import {useAppContext} from '../../app_context';

const SignIn = () => {

    const [state, dispatch] = useAppContext();

    useEffect(()=> {
        LocalAuthentication.hasHardwareAsync()
        .then((hasHardwareAuth:boolean) => {
            if(!hasHardwareAuth) throw "No Hardware Auth";

            LocalAuthentication.isEnrolledAsync()
            .then((isEnrolled:boolean) => {
                if(!isEnrolled) throw "Not Enrolled to Biometric Auth";
            });
        });
    }, []);

    const handleSignIn = () => {
        LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to Use PAI Wallet"
        })
        .then((result:LocalAuthentication.LocalAuthenticationResult) => {
            if(result.success) {
                dispatch({type: 'auth_success'})
            }
        })
    }

    const AuthButton = () => (
        <Pressable onPress={handleSignIn} style={{marginTop: 18}}>
            <View style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Authenticate</Text>
            </View>
        </Pressable>
    );


    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require("../../assets/authenticate.png")} style={{marginBottom: 40}} /> 
                <Text style={styles.title}>Myo.Finance</Text>
                <Text style={styles.subTitle}>Peso Argentino Intangible</Text>
            </View>
            <View style={{marginBottom: 50}}>
                <AuthButton />
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

    authButton: {
        color: '#FFF',
        backgroundColor: 'white'

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
        fontSize: 19,
        marginBottom: 18,
    }
})

export default SignIn;