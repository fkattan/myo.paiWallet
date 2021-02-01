import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import i18n from 'i18n-js';

import { AntDesign } from "@expo/vector-icons";

import HomeScreen from './home';
import PayflowEntry from './payflow/index';
import AccountInfo from './account_info';
import ErrorScreen from './error_screen';
import SignIn from './onboarding/signin';

import { AuthState, useAppState, AppErrorCodes } from '../app_context';

import  * as Colors from '../colors';

import { createStackNavigator } from '@react-navigation/stack';
import { capitalize } from '../utils/text_helpers';

const Stack = createStackNavigator();

const Main = () => {

    const { auth, error } = useAppState();

    if(error !== undefined) {
        switch (error.code) {
            case AppErrorCodes.device_not_elegible:
                return (<ErrorScreen message={i18n.t("device_not_elegible")} description={i18n.t("device_not_elegible_description")} image={require("../assets/error.png")} bgColor={Colors.RED}/>)

            case AppErrorCodes.biometric_auth_user_not_enrolled:
                return (<ErrorScreen message={i18n.t("biometric_auth_user_not_enrolled")} description={i18n.t("biometric_auth_user_not_enrolled_description")} image={require('../assets/error.png')} bgColor={Colors.DARK_GREEN} />)
            
            default: 
                return (<ErrorScreen message={i18n.t("app_error")} description={i18n.t("app_error_description")} image={require('../assets/error.png')} />)
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
                    headerBackTitle: capitalize(i18n.t("back")),
                    headerTintColor: Colors.WHITE,
                    headerStyle: {
                        backgroundColor: Colors.PRIMARY_BLUE_MONOCHROME_DARK,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold",
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
                    headerLeft: () => null, 
                    headerRight: () => (
                        <TouchableOpacity style={{marginRight: 25}} onPress={() => navigation.navigate('home')}>
                            <AntDesign name="closecircle" size={24} color={Colors.OFF_WHITE} />
                        </TouchableOpacity>
                    ),
                    headerBackTitleStyle: {color: Colors.WHITE},
                    headerLeftContainerStyle: {backgroundColor: Colors.PRIMARY_BLUE},
                    headerStyle: {
                        backgroundColor: Colors.PRIMARY_BLUE,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold",
                        color: Colors.WHITE
                    }
                })} 
            />
        </Stack.Navigator>
    );
}

export default Main;