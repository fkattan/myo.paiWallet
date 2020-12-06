import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {Feather} from '@expo/vector-icons';
import * as Colors from '../colors';

import {ethers} from 'ethers';
import {L2_PROVIDER_URL} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../app_context';
import { formatCurrency } from '../utils/currency_helpers';

const MONTHS_3LETTER = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

type  TransferEventListItem = {
    log: ethers.providers.Log,
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
                const txLocalInfo = JSON.parse(item);
                setDescription(txLocalInfo.description)
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

    return(
        <View style={itemContainerStyles} key={"TrasferItem_" + log.transactionHash}>
            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: direction === DirectionEnum.OUT ? Colors.RED : Colors.DARK_GREEN, marginRight: 8}}>
                <Feather name={direction === DirectionEnum.OUT ? "arrow-up-left" : "arrow-down-right"} size={15} color={direction === DirectionEnum.OUT ? Colors.RED : Colors.DARK_GREEN}/>
            </View>
            <View style={{flex:4, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Text style={{flex: 1, fontSize: 14, ...textStyles}}>{txDate ? txDate.getDay() : '--'} {txDate ? MONTHS_3LETTER[txDate.getMonth()-1] : '--'}, {txDate ? txDate.getFullYear().toString() : "--"}</Text>
                    <Text style={{flex: 2, textAlign: 'right', fontFamily: 'Montserrat-Bold', ...textStyles}}>
                        {amount ? formatCurrency(ethers.utils.formatUnits(amount, decimals || 18), 2, {prefix: "$"}) : "--"}
                    </Text>
                </View>
                <Text style={{flex: 1, ...textStyles, fontSize: 12, color: '#3D4C63'}}>{description || "No description available"}</Text>
            </View>
        </View>
    )
}

export default TransferEventListItem;