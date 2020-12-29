import {StyleSheet} from 'react-native';

import * as Colors from './colors';

export default StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },

    brand: {
        color: Colors.WHITE,
        fontFamily: 'FugazOne',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 32,
        marginBottom: 5,
    },

    subTitle: {
        color: Colors.OFF_WHITE,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 18,
    },

    message: {
        fontFamily: 'Montserrat-Bold',
        color: Colors.WHITE,
        fontSize: 20,
        lineHeight: 32,
        textAlign: 'center',
    },

    description: {
        fontFamily: 'Montserrat',
        color: Colors.WHITE,
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'center',
        marginTop: 20
    }
})