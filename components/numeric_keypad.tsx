import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons'; 

type NumericKeypadProps = {
    onChange: Function
}

const NumericKeypad = ({onChange}:NumericKeypadProps) => {

    const [value, setValue] = useState<string>("0");

    useEffect(() => {
        onChange(value);
    }, [value]);

    const append = (value:string) => {
       setValue((prevState:string) => {

           if(value === "." && prevState.indexOf(".") !== -1) return prevState;

           var newState = prevState + value;
           newState = newState.replace(/^0*/, "")
           return newState;
       }) 
    }

    const del = () => {
        setValue((prevState:string) => {
            if(prevState.length === 0) return "";
            return prevState.slice(0, prevState.length - 1);
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("1")}>
                    <Text style={styles.key}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("2")}>
                    <Text style={styles.key}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("3")}>
                    <Text style={styles.key}>3</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("4")}>
                    <Text style={styles.key}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("5")}>
                    <Text style={styles.key}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("6")}>
                    <Text style={styles.key}>6</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("7")}>
                    <Text style={styles.key}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("8")}>
                    <Text style={styles.key}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("9")}>
                    <Text style={styles.key}>9</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append(".")}>
                    <Text style={styles.key}>.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => append("0")}>
                    <Text style={styles.key}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keyContainer} onPress={() => del()}>
                    <Text style={styles.key}><Feather name="delete" size={32} /></Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
    },

    row: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        marginTop: 5 
    },

    keyContainer: {
        width: 64, 
        height: 64, 
        borderRadius: 32, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#DCDCDC',
    },

    key: {
        textAlign: 'center',
        fontFamily: 'Montserrat',
        fontSize: 48,
        marginLeft: 1
    }
})

export default NumericKeypad;