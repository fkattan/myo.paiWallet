import React from 'react';

import { StatusBar, View, Image, Text, ImageSourcePropType} from 'react-native';
import styles from '../error_styles';

import { SafeAreaView } from 'react-native-safe-area-context';

type OnboardingErrorProps = {
    message:string
    image:ImageSourcePropType
}

const OnboardingError = ({message, image}:OnboardingErrorProps) => {

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar hidden={true} />
            <View style={{flex:9, alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <Text style={styles.title}>Myo.Finance</Text>
                <Text style={styles.subTitle}>Peso Argentino Intangible</Text>
                <Image source={image} style={{resizeMode: 'contain', width: '100%'}} /> 
                <Text style={styles.message}>{message}</Text>
            </View>
        </SafeAreaView>
    );
}

export default OnboardingError;