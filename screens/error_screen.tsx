import React from 'react';

import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, Image, Text, ImageSourcePropType, View} from 'react-native';
import styles from '../error_styles';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as Colors from '../colors';

type OnboardingErrorProps = {
    message:string
    image:ImageSourcePropType
}

const OnboardingError = ({message, image}:OnboardingErrorProps) => {

    return (
        <LinearGradient colors={[Colors.WHITE, Colors.LIGHT_GRAY]} locations={[0.6,0.9]} style={{flex:9, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
            <StatusBar hidden={true} />
            <SafeAreaView style={styles.container}>
                <View style={{flex: 1}}>
                    <Text style={styles.title}>Myo.Finance</Text>
                    <Text style={styles.subTitle}>Peso Argentino Intangible</Text>
                </View>

                <Image source={image} style={{resizeMode: 'contain', width: "100%"}} /> 

                <View style={{flex: 1}}>
                    <Text style={[styles.message, {marginHorizontal: 20}]}>{message}</Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

export default OnboardingError;