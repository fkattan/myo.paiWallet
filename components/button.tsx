import React from 'react';
import {Pressable, View, Text, StyleSheet, GestureResponderEvent} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import * as Colors from '../colors';

type ButtonProps = {
    onPress: ((event: GestureResponderEvent) => void),
    title: string,
    iconName?: string,
    category?:string,
    disabled?:boolean
}

const Button = ({onPress, category, iconName, title, disabled=false}:ButtonProps) => {

    const getBg = (category:string) => {
        // if(disabled) return {backgroundColor: '#CFD2D8'};

        switch(category) {
            case "primary": return { backgroundColor: Colors.PRIMARY_BLUE }
            case "primary-mono": return { backgroundColor: Colors.PRIMARY_BLUE_MONOCHROME }
            case "success": return { backgroundColor: Colors.GREEN }
            case "danger":  return { backgroundColor: Colors.RED }
            case "warning": return { backgroundColor: Colors.YELLOW }
            case "disabled": return { backgroundColor: Colors.MEDIUM_GRAY}
            default: return { backgroundColor: Colors.MEDIUM_GRAY }
        }
    }
    const getFg = (category:string) => {
        if(disabled) {
            switch(category) {
                case "primary": return  Colors.PRIMARY_BLUE_MONOCHROME
                case "primary-mono": return Colors.PRIMARY_BLUE
                case "success": return  Colors.GRAY
                case "danger":  return  Colors.GRAY
                case "warning": return  Colors.GRAY
                case "disabled": return Colors.DARK_GRAY
                default: return  Colors.GRAY
            }
        }

        switch(category) {
            case "primary": return  Colors.WHITE
            case "primary-mono": return Colors.WHITE
            case "success": return  Colors.WHITE
            case "danger":  return  Colors.BLACK
            case "warning": return  Colors.BLACK
            case "disabled": return Colors.GRAY
            default: return  Colors.WHITE
        }
    }

    const handleOnPress = (event:GestureResponderEvent) => {
        if(disabled === undefined || disabled !== true) {
            onPress(event);
        }
    }

    return (
        <Pressable onPress={handleOnPress} style={{marginTop: 18}}>
            <View style={[styles.buttonContainer, getBg(category|| "primary")]}>
                {iconName && (<View style={{marginRight: 8}}><AntDesign name={iconName} size={18} color={getFg(category || "primary")}/></View>)}
                <Text style={[styles.buttonText, {color: getFg(category || "primary")}]}>{title}</Text>
            </View>
        </Pressable>
    );
}

// Danger: bg: e63946, fg: f1faee
// Primary: bg: 1d3557 fg: f1faee 
// Info: bg: a8dadc fg: 6c757d
// default: bg: e9ecef fg: 6c757d

const styles = StyleSheet.create({
    buttonContainer: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
    },


    buttonText: {
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        fontSize: 18,
    },

})

export default Button;
