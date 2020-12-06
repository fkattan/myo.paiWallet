import React, { useEffect } from 'react';

import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';

import HomeScreen from './home';
import ScanScreen from './scan_qr';

import EnterAmount from './payflow/enter_amount';
import EnterRecipient from './payflow/enter_recipient';
import EnterMessage from './payflow/enter_message';
import ReviewPayment from './payflow/review_payment';

// import PayScreen from './payflow/init_payment';
import PendingPaymentScreen from './payflow/pending_payment';
import SuccessPaymentScreen from './payflow/success_payment';
import ErrorPaymentScreen from './payflow/error_payment';
import AccountInfo from './account_info';

import SignIn from './onboarding/signin';
import { AuthState, useAppContext } from '../app_context';
import { Button } from 'react-native';
import { ethers } from 'ethers';
import { L2_PROVIDER_URL } from '../constants';


const Stack = createStackNavigator();

const PAIHeaderOptions = (bg:string, fg:string):StackNavigationOptions => ({
    title: 'Peso Argentino Intangible',
    headerLeft: () => undefined,
    headerTitleAlign: 'center',
    headerStyle: {
        backgroundColor: bg,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    headerTintColor: fg,
    headerTitleStyle: {
        fontFamily: "Montserrat-Bold"
    }
});

const Main = () => {

    const [ state, dispatch ] = useAppContext()
    const { auth, wallet } = state;

    useEffect(() => {
        if(wallet === undefined) return; 

        console.log("Registering Listeners for ", wallet.address);
        console.log("ID:", ethers.utils.id("Approval(address,address,uint256)"));

        const filter = {
            address: wallet.address,
            topics: [
                ethers.utils.id("Approval(address,address,uint256)")
            ]
        }

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);

        provider.on(filter, (log, event) => {
            console.log("Log: ", log);
            console.log("Event:", event);
        });

        return () => {
            console.log("Unmount Main");
        }

    }, [wallet])

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
                name="account_info"
                component={AccountInfo}
                options={{
                    title: 'Peso Argentino Intangible',
                    headerTitleAlign: 'center',
                    headerLeft: () => undefined,
                    headerStyle: {
                        backgroundColor: '#EFEFEF',
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 0,
                    },
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    }
                }} 
            />

            <Stack.Screen
                name="enter_amount"
                component={EnterAmount} 
                options={({navigation}) => ({
                    title: "Enter Amount",
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    },
            })} />

            <Stack.Screen
                name="enter_recipient"
                component={EnterRecipient} 
                options={({navigation}) => ({
                    title: "Choose Recipient",
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    },
            })} />

            <Stack.Screen
                name="enter_message"
                component={EnterMessage} 
                options={({navigation}) => ({
                    title: "Enter a Message",
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    },
            })} />

            <Stack.Screen
                name="review_payment"
                component={ReviewPayment} 
                options={({navigation}) => ({
                    title: "Confirm Payment",
                    headerTitleStyle: {
                        fontFamily: "Montserrat-Bold"
                    },
                    headerRight: () => (
                        <Button
                          onPress={() => {navigation.navigate('home')}}
                          title="Cancel"
                        />
                    )
            })} />

            <Stack.Screen
                name="scan"
                component={ScanScreen} 
                options={({navigation}) => ({
                    headerBackTitle: "Cancel",
                    headerRight: () => null
                })} />


            {/* <Stack.Screen
                name="pay"
                component={PayScreen} 
                options={({navigation}) => ({
                    headerRight: () => (
                        <Button
                          onPress={() => {navigation.navigate('home')}}
                          title="Cancel"
                        />
                    )
                })} /> */}

            <Stack.Screen
                name="pending_payment"
                component={PendingPaymentScreen} 
                options={() => PAIHeaderOptions('#efefefef', '#000')}
            />

            <Stack.Screen
                name="success_payment"
                component={SuccessPaymentScreen} 
                options={() => PAIHeaderOptions('#efefefef', '#000')}
            />

            <Stack.Screen
                name="error_payment"
                component={ErrorPaymentScreen} 
                options={() => PAIHeaderOptions('#efefefef', '#000')}
            />

        </Stack.Navigator>
    );
}

export default Main;