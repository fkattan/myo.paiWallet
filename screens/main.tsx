import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './home';
import PayflowEntry from './payflow/index';

import AccountInfo from './account_info';

import SignIn from './onboarding/signin';
import { AuthState, useAppContext } from '../app_context';
import  * as Colors from '../colors';

const Stack = createStackNavigator();

const Main = () => {

    const [ state, dispatch ] = useAppContext()
    const { auth, wallet } = state;

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