import React, { useEffect, useState } from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './home';
import ScanScreen from './scan_qr';
import PayScreen from './payflow/init_payment';
import PendingPaymentScreen from './payflow/pending_payment';

import SignIn from './onboarding/signin';
import { AuthState, useAppContext } from '../app_context';
import { Button } from 'react-native';

const Stack = createStackNavigator();


const Main = () => {

    const [ state, dispatch ] = useAppContext()
    const { auth } = state;

    if(auth !== AuthState.success) {
        return(
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
                options={{
                    title: 'Peso Argentino Intangible',
                    headerTitleAlign: 'center',
                    headerStyle: {
                        backgroundColor: '#2961EC',
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTintColor: '#FFF',
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    }
                }} 
            />

            <Stack.Screen
                name="scan"
                component={ScanScreen} 
                options={({navigation}) => ({
                    headerRight: () => (
                        <Button
                          onPress={() => {navigation.navigate('home')}}
                          title="Cancel"
                        />
                    )
                })} />

            <Stack.Screen
                name="pay"
                component={PayScreen} 
                options={({navigation}) => ({
                    headerRight: () => (
                        <Button
                          onPress={() => {navigation.navigate('home')}}
                          title="Cancel"
                        />
                    )
                })} />

            <Stack.Screen
                name="pending_payment"
                component={PendingPaymentScreen} 
                options={{
                    header: (props) => (undefined) 
                }}/>

        </Stack.Navigator>
    );
}

export default Main;