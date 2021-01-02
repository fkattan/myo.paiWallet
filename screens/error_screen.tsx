import React from 'react';

import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, Image, Text, ImageSourcePropType, View} from 'react-native';
import styles from '../error_styles';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as Colors from '../colors';

type OnboardingErrorProps = {
    message:string,
    description:string,
    image:ImageSourcePropType,
    bgColor?:string
}

const OnboardingError = ({message, description, image, bgColor}:OnboardingErrorProps) => {

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: bgColor || Colors.MIDNIGHT_BLUE}}>
            <StatusBar hidden={true} />
            <SafeAreaView style={styles.container}>

                <View style={{flex: 1, justifyContent: 'center'}}>
                    <Text style={styles.brand}>Myo.Finance</Text>
                    <Text style={styles.subTitle}>Peso Argentino Intangible</Text>
                </View>

                <Image source={image} style={{flex: 1, resizeMode: 'contain', marginVertical: 40}} /> 

                <View style={{flex: 2}}>
                    <Text style={[styles.message, {marginHorizontal: 20}]}>{message}</Text>
                    <Text style={[styles.description, {marginHorizontal: 20}]}>{description}</Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

export default OnboardingError;