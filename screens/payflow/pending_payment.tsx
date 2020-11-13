import React, { useEffect } from 'react';

import { StatusBar, View, StyleSheet, Image, ActivityIndicator, Text} from 'react-native';
import {useAppContext} from '../../app_context';

const PendingPayment = () => {

    const [state, dispatch] = useAppContext();

    useEffect(()=> {
        // TODO: Listen to transaction confirm / reject navigate to SuccessPayment or ErrorPayment accordingly 
    }, []);


    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:1, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <Image source={require("../../assets/working.png")} style={{resizeMode: 'contain', width: '70%'}} /> 
                <Text style={styles.title}>Working ...</Text>
                <ActivityIndicator animating={true} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        marginBottom: 20
    }
})

export default PendingPayment;