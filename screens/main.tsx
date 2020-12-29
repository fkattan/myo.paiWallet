import React from 'react';
import i18n from 'i18n-js';

import HomeScreen from './home';
import PayflowEntry from './payflow/index';
import AccountInfo from './account_info';
import ErrorScreen from './error_screen';
import SignIn from './onboarding/signin';

import { AuthState, useAppState, AppErrorCodes } from '../app_context';

import  * as Colors from '../colors';

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const Main = () => {

    const { auth, error } = useAppState();

    if(error !== undefined) {
        switch (error.code) {
            case AppErrorCodes.device_not_elegible:
                return (<ErrorScreen message={i18n.t("device_not_elegible")} image={require("../assets/error.png")} />)

            case AppErrorCodes.biometric_auth_user_not_enrolled:
                return (<ErrorScreen message={i18n.t("biometric_auth_user_not_enrolled")} image={require('../assets/error.png')} />)
            
            default: 
                return (<ErrorScreen message={i18n.t("app_error")} image={require('../assets/error.png')} />)
        }
    }

    if(auth !== AuthState.success) {
        return (
            <Stack.Navigator initialRouteName="SignIn" headerMode="none">
                <Stack.Screen
                    name="SignIn"
                    component={SignIn} />
            </Stack.Navigator>
        )
    }

    
    return (
        <Stack.Navigator initialRouteName="home">
            <Stack.Screen
                name="home"
                component={HomeScreen}
                options={({navigation}) => ({
                    title: 'Peso Argentino Intangible',
                    headerTitleAlign: 'center',
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                        backgroundColor: Colors.PRIMARY_BLUE_MONOCHROME_DARK,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0
                    },
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    }
                })} 
            />

            <Stack.Screen
                name="payflow"
                component={PayflowEntry}
                options={{
                    headerShown: false
                }}
            />

            <Stack.Screen
                name="account_info"
                component={AccountInfo}
                options={({navigation}) => ({
                    title: 'Peso Argentino Intangible',
                    headerTitleAlign: 'center',
                    headerLeft: () => undefined,
                    headerStyle: {
                        backgroundColor: Colors.OFF_WHITE,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    }
                })} 
            />


        </Stack.Navigator>
    );
}

export default Main;