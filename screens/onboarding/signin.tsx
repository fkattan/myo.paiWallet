import React, { useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { View, Button } from 'react-native';

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
        console.log("TODO: handle Auth");
        LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to Use PAI Wallet"
        })
        .then((result:LocalAuthentication.LocalAuthenticationResult) => {
            if(result.success) {
                dispatch({type: 'auth_success'})
            }
        })
    }

    return (
        <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <Button title="Press to Authenticate" onPress={handleSignIn} />
        </View>
    );
}

export default SignIn;