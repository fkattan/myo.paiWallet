import React from 'react';
import {Pressable, View, Text, StyleSheet, GestureResponderEvent} from 'react-native';
import {AntDesign} from '@expo/vector-icons';

type ButtonProps = {
    onPress: ((event: GestureResponderEvent) => void),
    title: string,
    iconName?: string,
    category?:string,
}

const Button = ({onPress, category, iconName, title}:ButtonProps) => {

    const getBg = (category:string) => {
        switch(category) {
            case "primary": return { backgroundColor: '#347AF0' }
            case "success": return { backgroundColor: '#75BF72' }
            case "danger":  return { backgroundColor: '#DF5060' }
            case "warning": return { backgroundColor: '#FDB32A' }
            default: return { backgroundColor: '#78839C' }
        }
    }
    const getFg = (category:string) => {
        switch(category) {
            case "primary": return  '#FFF'
            case "success": return  '#FFF'
            case "danger":  return  '#FFF'
            case "warning": return  '#000'
            default: return  '#FFF'
        }
    }

    return (
        <Pressable onPress={onPress} style={{marginTop: 18}}>
            <View style={[styles.buttonContainer, getBg(category|| "primary")]}>
                {iconName && (<View style={{marginRight: 8}}><AntDesign name={iconName} size={20} color={getFg(category || "primary")}/></View>)}
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
        borderRadius: 6,
    },


    buttonText: {
        fontFamily: 'Montserrat-Bold',
        textAlign: 'center',
        fontSize: 18,
    },

})

export default Button;
