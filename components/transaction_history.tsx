import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControlComponent, RefreshControl } from 'react-native';
import {Feather} from '@expo/vector-icons';
import * as Colors from '../colors';

import "@ethersproject/shims"
import {ethers} from 'ethers';
import {L2_PROVIDER_URL, L2_PAI_ADDRESS} from '../constants';
import PAI from '../reference/PAI.json';

import TransferEventListItem from './transfer_event_list_item';

import i18n from 'i18n-js';
import {titleize} from '../utils/text_helpers';
import { useAppContext } from '../app_context';

type  TransactionHistoryProps = {
    onRefresh?: Function
}

type TxHistoryItem = {
    log: ethers.providers.Log,
    block: ethers.providers.Block
}

const TransactionHistory = ({onRefresh}:TransactionHistoryProps) => {
    const [transactions, setTransactions] = useState<ethers.Event[]>();
    const [refreshing, setRefreshing] = useState<boolean>(false);


    const [state, dispatch] = useAppContext();

    useEffect(() => {

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
        const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, provider)

        const transferFromMe = pai.filters.Transfer(state.wallet?.address);
        const transferToMe = pai.filters.Transfer(null, state.wallet?.address);

        const onBalanceChange:()=>void = () => {
            getTransactions(state.wallet?.address).then(tx => {
                setTransactions(tx);
            });
        };

        pai.on(transferFromMe, onBalanceChange); 
        pai.on(transferToMe, onBalanceChange);

        return () => {
            pai.off(transferFromMe, onBalanceChange);
            pai.off(transferToMe, onBalanceChange);
        }

    }, []);


    useEffect(() => {

        getTransactions(state.wallet?.address)
        .then((data:Array<ethers.Event>) => {
            setTransactions(data);
        })
        .catch((error:any) => { throw error });
        
    }, [state.wallet])


    const getTransactions = async (address:string|undefined):Promise<ethers.Event[]> => {

        if(!address || !ethers.utils.isAddress(address)) return []; 

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
        const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, provider);

        setRefreshing(true);

        let data:ethers.Event[] = [];
        let blockHeight = await provider.getBlockNumber();

        for(let i = 1; i <= 3; i++) {

            const fromMe = await pai.queryFilter(pai.filters.Transfer(address), blockHeight - 10000, blockHeight);
            const toMe = await pai.queryFilter(pai.filters.Transfer(null, address), blockHeight - 10000, blockHeight);

            data = data.concat(fromMe).concat(toMe)
            blockHeight = blockHeight - 10000 - 1;
        }

        setRefreshing(false);

        return data.sort((a:ethers.Event, b:ethers.Event) => b.blockNumber - a.blockNumber);
    }

    return (
        <FlatList
            data={transactions}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => getTransactions(state.wallet?.address)}
                    title=""
                    tintColor="#FFF"
                    titleColor="#FFF"/>
            }
            keyExtractor={(item) => item.transactionHash + ":" + item.logIndex}
            renderItem={({item}) => {
                return (<TransferEventListItem log={item} itemContainerStyles={styles.item} textStyles={styles.itemText} />);
            }} 

            ListEmptyComponent={() => (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
                    <Feather name="inbox" size={48} color={Colors.WHITE} />
                    <Text style={styles.noActivityText}>{titleize(i18n.t("no_activity"))}</Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({

  item: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: Colors.PRIMARY_BLUE,
      borderRadius: 6,
      marginBottom: 12

  },

  itemText: {
      color: Colors.WHITE
  },

  noActivityText: {
    fontFamily: 'FugazOne',
    fontSize:20,
    color: Colors.OFF_WHITE,
    marginTop:8
  }

});

export default TransactionHistory;