import React from 'react';

import { capitalize, titleize } from '../../utils/text_helpers';
import i18n from 'i18n-js';

import { AntDesign } from "@expo/vector-icons";

import EnterAmount from './enter_amount';
import EnterRecipient from './enter_recipient';
import EnterMessage from './enter_message';
import ReviewPayment from './review_payment';
import ScanScreen from '../scan_qr';

import { PayflowProvider } from './payflow_context';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import * as Colors  from '../../colors';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

type PayflowIndexProps = {
    navigation: any
}

const Index = ({navigation: rootNavigation}:PayflowIndexProps) => {

    const DefaultHeaderOptions = (bg:string, fg:string):StackNavigationOptions => ({
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

    const flatHeaderStyle = {
        backgroundColor: Colors.LIGHT_GRAY,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    }

    return (
        <PayflowProvider>
            <Stack.Navigator initialRouteName="enter_amount">
                <Stack.Screen
                    name="enter_amount"
                    component={EnterAmount} 
                    options={({navigation}) => ({
                        title: titleize(i18n.t("enter_amount")),
                        headerBackTitle: capitalize(i18n.t("cancel")),
                        headerStyle: flatHeaderStyle,
                        headerTitleStyle: {
                            fontFamily: "Montserrat-Bold"
                        },
                })} />

                <Stack.Screen
                    name="enter_recipient"
                    component={EnterRecipient} 
                    options={({navigation}) => ({
                        title: titleize(i18n.t("choose_recipient")),
                        headerBackTitle: capitalize(i18n.t("back")),
                        headerStyle: flatHeaderStyle,
                        headerTitleStyle: {
                            fontFamily: "Montserrat-Bold"
                        },
                })} />

                <Stack.Screen
                    name="enter_message"
                    component={EnterMessage} 
                    options={({navigation}) => ({
                        title: titleize(i18n.t("enter_message")),
                        headerBackTitle: capitalize(i18n.t("back")),
                        headerStyle: flatHeaderStyle,
                        headerTitleStyle: {
                            fontFamily: "Montserrat-Bold"
                        },
                })} />

                <Stack.Screen
                    name="review_payment"
                    component={ReviewPayment} 
                    options={({navigation}) => ({
                        title: titleize(i18n.t("confirm_payment")),
                        headerLeft: undefined,
                        headerStyle: {
                            backgroundColor: Colors.PRIMARY_BLUE,
                            elevation: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 0,
                        },
                        headerTitleStyle: {
                            fontFamily: "Montserrat-Bold",
                            color: Colors.WHITE
                        },
                        headerRight: () => (
                            <TouchableOpacity onPress={() => navigation.navigate('home')} style={{marginRight: 25}}>
                                <AntDesign name="closecircle" size={24} color={Colors.OFF_WHITE} />
                            </TouchableOpacity>
                        )
                })} />

                <Stack.Screen
                    name="scan"
                    component={ScanScreen} 
                    options={({navigation}) => ({
                        title: capitalize(i18n.t("scan_qr")),
                        headerBackTitle: capitalize(i18n.t("back")),
                        headerRight: () => null 
                    })} />

            </Stack.Navigator>
        </PayflowProvider>
    )
}

export default Index;