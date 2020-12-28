import {StyleSheet} from 'react-native';

export default StyleSheet.create({
    container: {
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20 
    },

    brand: {
        fontFamily: "Montserrat-Bold",
        fontSize: 16
    },

    title: {
        color: "#0D1F3C",
        fontFamily: 'FugazOne',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 36,
        marginBottom: 5,
    },

    subTitle: {
        color: '#78839C',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 18,
    },

    message: {
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        fontSize: 20,
        lineHeight: 32,
        marginBottom: 20
    }
})