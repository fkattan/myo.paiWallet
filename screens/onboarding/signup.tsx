import React, { useEffect } from 'react';
import { View, Button, StyleSheet} from 'react-native';

import * as Random from 'expo-random';

import "@ethersproject/shims";
import { ethers } from 'ethers';

import * as SecureStore from 'expo-secure-store';

const MNEMONIC_KEY = "MNEMONIC_KEY";

export default function Register() {

    useEffect(() => {

        SecureStore.isAvailableAsync()
        .then(isAvailable => {
            if(!isAvailable) {
                throw "SecureStore not available on Device";
            }

            (async () => {
                let mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
                if(!mnemonic) {
                    const randomMnemonic = await createMnemonic();

                    SecureStore.setItemAsync(MNEMONIC_KEY, randomMnemonic)
                    .then(() => {
                        mnemonic = randomMnemonic;
                    })
                    .catch((reason:any) => {
                        throw reason;
                    });
                }
            })();
        });
    }, [])


    const createMnemonic = async () => {
        const randomBytes = await Random.getRandomBytesAsync(16);
        const mnemonic = ethers.utils.entropyToMnemonic(randomBytes)
        return mnemonic;
    }

    return (
        <View style={styles.container}>
            <Button title="Register" onPress={createMnemonic} />
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1, 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    }
})