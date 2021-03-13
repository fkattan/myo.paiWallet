import React, { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

import { StatusBar, View, Text, StyleSheet, Pressable, Image, ActivityIndicator} from 'react-native';
import {AppErrorCodes, AuthState, useAppContext} from '../../app_context';

import { capitalize } from '../../utils/text_helpers';
import i18n from 'i18n-js';

import * as firebase from 'firebase';

import * as Colors from '../../colors';

const SignIn = () => {

    const [state, dispatch] = useAppContext();
    const [ready, setReady] = useState<boolean>(false);

    useEffect(()=> {
        LocalAuthentication.hasHardwareAsync()
        .then((hasHardwareAuth:boolean) => {
            if(!hasHardwareAuth) {
                dispatch({type: "error", error: {code: AppErrorCodes.device_not_elegible, description: "No biometric authentication hardware on device"}})
                return Promise.reject();
            }
        })

        .then(() => {
            LocalAuthentication.isEnrolledAsync()
            .then((isEnrolled:boolean) => {
                if(!isEnrolled) {
                    dispatch({type: "error", error: {code: AppErrorCodes.biometric_auth_user_not_enrolled, description: "User not enrolled to use biometric auth"}});
                    return Promise.reject();
                }
                setReady(true);
            });
        })

        .catch(() => {
            setReady(false);
        });

    }, []);

    useEffect(() => {

        if(state.auth === AuthState.success) {
            firebase.auth().signInAnonymously()
            .then(() => {
                console.log("Firebase Auth Success")
            })
            .catch((error) => {
                console.error(error.code, error.message);
            });
        }

    }, [state.auth])

    const handleSignIn = () => {
        LocalAuthentication.authenticateAsync({
            promptMessage: i18n.t('auth_prompt_message')
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
                <Text style={styles.buttonText}>{capitalize(i18n.t("authenticate"))}</Text>
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
                {ready && (<AuthButton />)}
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