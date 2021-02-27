import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../app_context';

import { View, Text } from 'react-native';
import {Feather} from '@expo/vector-icons';
import * as Colors from '../colors';

import "@ethersproject/shims"
import {ethers} from 'ethers';
import {L2_PROVIDER_URL} from '../constants';

import { formatCurrency } from '../utils/currency_helpers';
import { capitalize } from '../utils/text_helpers';

import i18n from 'i18n-js';

const MONTHS_3LETTER = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

type  TransferEventListItem = {
    log: ethers.Event,
    itemContainerStyles:any,
    textStyles?:any
}

enum DirectionEnum {
    "IN",
    "OUT"
};

const TransferEventListItem = ({log, itemContainerStyles, textStyles}:TransferEventListItem) => {
    const [block, setBlock] = useState<ethers.providers.Block>();
    const [txDate, setTxDate] = useState<Date>();
    const [amount, setAmount] = useState<ethers.BigNumber>();
    const [description, setDescription] = useState<string>("");
    const [direction, setDirection] = useState<DirectionEnum>();

    const [ state ] = useAppContext();
    const { decimals, wallet } = state;

    useEffect(() => {
        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);

        (async () => {
            const block:ethers.providers.Block = await provider.getBlock(log.blockNumber);
            setBlock(block);

            const item = await AsyncStorage.getItem(log.transactionHash);
            if(item !== null) {
                setDescription(item)
            }
        })();

        const ABI = [ "event Transfer(address indexed from, address indexed to, uint256 value)" ];
        const iface = new ethers.utils.Interface(ABI);
        const event:ethers.utils.LogDescription = iface.parseLog(log);

        setDirection(event.args[1] === wallet?.address ? DirectionEnum.IN : DirectionEnum.OUT)
        setAmount(event.args[2]);
    }, []);

    useEffect(() => {
        if(block === undefined) return; 
        setTxDate(new Date(block.timestamp * 1000));
    }, [block])

    if(amount?.eq(0)) return null;

    return(
        <View style={itemContainerStyles}>
            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: direction === DirectionEnum.OUT ? Colors.PRIMARY_BLUE_TRIADIC_DANGER : Colors.PRIMARY_BLUE_TRIADIC_SUCCESS, marginRight: 8}}>
                <Feather name={direction === DirectionEnum.OUT ? "arrow-up-left" : "arrow-down-right"} size={15} color={direction === DirectionEnum.OUT ? Colors.PRIMARY_BLUE_TRIADIC_DANGER : Colors.PRIMARY_BLUE_TRIADIC_SUCCESS}/>
            </View>
            <View style={{flex:4, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Text style={{flex: 6, fontSize: 14, ...textStyles}}>
                        {txDate ? (
                            txDate.getDate() + " " +
                            MONTHS_3LETTER[txDate.getMonth()] + " " +
                            txDate.getFullYear().toString() + " " + 
                            txDate.getHours() + ":" +
                            txDate.getMinutes().toString().padStart(2,'0')
                        ) : (
                            "--"
                        )}
                    </Text>
                    <Text style={{flex: 5, textAlign: 'right', fontFamily: 'Montserrat-Bold', ...textStyles}}>
                        {amount ? formatCurrency(ethers.utils.formatUnits(amount, decimals || 18), 2, {prefix: "$"}) : "--"}
                    </Text>
                </View>
                <Text style={{flex: 1, fontSize: 12, color: '#3D4C63', ...textStyles,}}>{description || capitalize(i18n.t("no_description_available"))}</Text>
            </View>
        </View>
    )
}

export default TransferEventListItem;