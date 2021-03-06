import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, StatusBar, Share, Clipboard } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Feather } from '@expo/vector-icons'; 

import QRCode from 'react-native-qrcode-svg';

import { useAppContext } from "../app_context";
import { shortenAddress } from "../utils/address_helpers";
import { capitalize, titleize } from '../utils/text_helpers';
import i18n from 'i18n-js';
import * as Colors from "../colors";
import { LinearGradient } from "expo-linear-gradient";


type AccountInfoProps = {
    navigation:any
}

const AccountInfo = ({navigation}:AccountInfoProps) => {

    const [accountAddress, setAccountAddress] = useState<string>('');

    const [ state, dispatch ] = useAppContext();
    const { wallet } = state;

    useEffect(() => {
        if(wallet === undefined) return;
        (async () => {
            const address = await wallet.getAddress();
            setAccountAddress(address);
        })();
    }, [wallet])

    const onCopy = () => {
        Clipboard.setString(accountAddress);
    }

    const onShare = async () => {
        const result = await Share.share({
            message: accountAddress
        });
    }

    if(accountAddress === undefined) {
        return (
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large"/>
            </View>
        )
    }

    return (
        <LinearGradient style={styles.container} colors={[Colors.OFF_WHITE, Colors.LIGHT_GRAY]} locations={[0.50, 1]}>
            <StatusBar barStyle="dark-content"/>

            <View style={{flex: 2, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{padding:40, borderRadius: 20, backgroundColor: '#FFF'}}>
                    <QRCode value={`ethereum:${accountAddress}`} size={240} />
                </View>
            </View>

            <View style={{flex:1}}>

                <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontFamily: 'FugazOne', fontSize: 18}}>{titleize(i18n.t("account_address"))}</Text>
                    <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 18}}>{shortenAddress(accountAddress || "").toLowerCase() || titleize(i18n.t("no_network"))}</Text>
                </View>

                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <TouchableOpacity onPress={onCopy} style={[styles.buttonContainer, {marginTop:40}]}>
                        <Feather name="copy" size={18} color='#347AF0'/>
                        <Text style={{marginLeft: 8, fontSize: 18, fontFamily: 'Montserrat-Bold', color: '#347AF0'}}>{capitalize(i18n.t("copy"))}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={onShare} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop:40 }}>
                        <Text style={[styles.buttonText, {marginHorizontal: 18}]}>&nbsp;</Text>
                        <Feather name="share-2" size={18} color='#347AF0'/>
                        <Text style={[styles.buttonText, {marginLeft: 8}]}>{capitalize(i18n.t("share"))}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{display: 'flex', flexDirection: "row", alignItems:"center", justifyContent: 'center', paddingBottom: 40, width: "100%"}}>
                <TouchableOpacity onPress={() => {navigation.navigate("home")}} style={styles.buttonContainerFilled}>
                    <Feather name="arrow-left" size={18} color='#FFF'/>
                    <Text style={[styles.buttonText, {color: "#FFF", marginLeft: 8}]}>{capitalize(i18n.t("back"))}</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
    },

    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonContainerFilled: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingVertical: 12, 
        borderRadius: 8, 
        backgroundColor: '#347AF0',
        width: '100%'
    },

    buttonText: {
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        color: '#347AF0'
    },

})

export default AccountInfo; 