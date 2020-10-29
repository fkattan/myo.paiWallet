import React, { useEffect } from 'react';

import { StatusBar, View, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {useAppContext} from '../../app_context';

const PendingPayment = () => {

    const [state, dispatch] = useAppContext();

    useEffect(()=> {
        // TODO: Listen to transaction confirm / reject navigate to SuccessPayment or ErrorPayment accordingly 
    }, []);


    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require("../../assets/working.png")} style={{marginBottom: 40}} /> 
            </View>
            <View>
                <ActivityIndicator animating={true} />
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
})

export default PendingPayment;