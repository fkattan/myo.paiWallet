import React, { useEffect, useState } from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './home';
import ScanScreen from './scanner';
import SignIn from './onboarding/signin';
import { AuthState, useAppContext } from '../app_context';

const Stack = createStackNavigator();

const Main = () => {

    const [ state, dispatch ] = useAppContext()
    const { auth } = state;

    if(auth !== AuthState.success) {
        return(
            <Stack.Navigator initialRouteName="SignIn">
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
                component={HomeScreen} />

            <Stack.Screen
                name="scan"
                component={ScanScreen} />
        </Stack.Navigator>
    );
}

export default Main;