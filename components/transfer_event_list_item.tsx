import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../app_context';

import { View, Text } from 'react-native';
import {Feather} from '@expo/vector-icons';

import * as Contacts from 'expo-contacts';

import * as Colors from '../colors';

import "@ethersproject/shims"
import {ethers} from 'ethers';
import {L2_PROVIDER_URL} from '../constants';

import { formatCurrency } from '../utils/currency_helpers';
import { capitalize } from '../utils/text_helpers';

import i18n from 'i18n-js';
import { Recipient } from '../screens/payflow/payflow_context';
import { shortenAddress } from '../utils/address_helpers';
import { findByAddress } from '../services/data_service';
import firebase from 'firebase';

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
    const [contact, setContact] = useState<Contacts.Contact|undefined>();
    const [recipient, setRecipient] = useState<Recipient>();

    const [fromAddress, setFromAddress] = useState<string>();
    const [toAddress, setToAddress] = useState<string>();

    const [ state ] = useAppContext();
    const { decimals, wallet } = state;

    // Parse Smart Contract's Event Log. 
    useEffect(() => {
        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);

        const ABI = [ "event Transfer(address indexed from, address indexed to, uint256 value)" ];
        const iface = new ethers.utils.Interface(ABI);
        const event:ethers.utils.LogDescription = iface.parseLog(log);

        setAmount(event.args[2]);
        setDirection(event.args[1] === wallet?.address ? DirectionEnum.IN : DirectionEnum.OUT)
        setFromAddress(event.args[0]);
        setToAddress(event.args[1]);

        // setRecipient({address: event.args[0], name: 'unknown'});

        // Get Block so we can parse timestamp
        // and get TX time.
        provider.getBlock(log.blockNumber)
        .then((value:ethers.providers.Block) => setBlock(value));
    }, []);

    useEffect(() => {
        if(!direction) return; 

        // If it's an outgoing transfer; augment data with LocalStorage Info.
        if(direction === DirectionEnum.OUT) {

            // Get Memo and Recipient Info from LocalStorage (we would not have it for Incoming TXs)
            // Data is stored with this format: {recipient:Recipient, memo:string}
            AsyncStorage.getItem(log.transactionHash)
            .then((item:string|null) => item ? JSON.parse(item) : undefined)
            .then((value:{recipient:Recipient, memo:string}|undefined) => {
                if(!value) return undefined; 

                setDescription(value.memo);
                setRecipient(value.recipient);
                return value.recipient.id;
            })

            // If we have an ID let's get the contact
            // so we can display additonal info (i.e. photo)
            .then((id:string|undefined) => {
                if(!id) return Promise.resolve(undefined);
                return Contacts.getContactByIdAsync(id);
            })
            .then((value:Contacts.Contact|undefined) => setContact(value))

            // If any error let's log it and clear
            // the TX state. 
            .catch((error) => {
                setDescription("");
                setRecipient(undefined);
                setContact(undefined);
            });
        }

    }, [direction])

    // For incoming transfers attempt
    // to fetch sender's identity from 
    // firebase.
    useEffect(() => {
        if(direction !== DirectionEnum.IN || !fromAddress) return;

        // Use Firebase Filter mechanism
        // to try to find a match in registered
        // addresses. 
        findByAddress(fromAddress)
        .then((result:firebase.database.DataSnapshot|null|void) => {
            if(!result) return undefined;

            // Extract the response data from the FB Snapshot
            const dbEntry:any = Object.values(result.val())[0];

            // Most probably we will get a result, not necesarly it's a match. 
            if(dbEntry.walletAddress === fromAddress) {
                setRecipient({address: dbEntry.walletAddress, name: [dbEntry.firstName, dbEntry.lastName].join(' ')});
            } 
        });
    }, [direction, fromAddress]);

    // Set Transaction time based on block's timestamp
    useEffect(() => {
        if(block === undefined) return; 
        setTxDate(new Date(block.timestamp * 1000));
    }, [block])

    const recipientDisplayName = (contact:Contacts.Contact|undefined, recipient:Recipient|undefined, address:string|undefined) => {
        if(contact) return contact.name;
        if(recipient) return recipient.name || shortenAddress(recipient.address);
        if(address && ethers.utils.isAddress(address)) return shortenAddress(address);

        return i18n.t("annonymous");
    }

    if(amount?.eq(0)) return null;

    return(
        <View style={itemContainerStyles}>
            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: direction === DirectionEnum.OUT ? Colors.RED : Colors.GREEN, marginRight: 8}}>
                <Feather name={direction === DirectionEnum.OUT ? "arrow-up-left" : "arrow-down-right"} size={15} color={direction === DirectionEnum.OUT ? Colors.RED : Colors.GREEN}/>
            </View>
            <View style={{flex:4, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={{flex: 6, fontSize: 14, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 3, ...textStyles}}>
                    {recipientDisplayName(contact, recipient, fromAddress)}
                </Text>
                    <Text style={{flex: 5, textAlign: 'right', fontFamily: 'Montserrat-Bold', ...textStyles}}>
                        {amount ? formatCurrency(ethers.utils.formatUnits(amount, decimals || 18), 2, {prefix: "$"}) : "--"}
                    </Text>
                </View>
                    <Text style={{flex: 6, fontSize: 12, marginBottom: 3, ...textStyles}}>
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

                <Text style={{flex: 1, fontSize: 12, ...textStyles, color: Colors.MEDIUM_GRAY}}>
                    {description || capitalize(i18n.t("no_description_available"))}
                </Text>
            </View>
        </View>
    )
}

export default TransferEventListItem;