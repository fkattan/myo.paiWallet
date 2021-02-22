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

type  TransactionHistoryProps = {
    address?: string,
    onRefresh?: Function
}

type TxHistoryItem = {
    log: ethers.providers.Log,
    block: ethers.providers.Block
}

const TransactionHistory = ({address, onRefresh}:TransactionHistoryProps) => {
    const [transactions, setTransactions] = useState<Array<ethers.providers.Log>>();
    const [refreshing, setRefreshing] = useState<boolean>(false);


    useEffect(() => {

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
        const pai = new ethers.Contract(L2_PAI_ADDRESS, PAI.abi, provider)

        pai.on("Transfer", (from:string, to:string, amount:ethers.BigNumber, event: ethers.providers.EventType) => {
            console.log("Transfer Event Caught", from, to, amount.toString(), new Date());
            console.log("Event: ", event);

            if(transactions === undefined) return;

            // sortByBlockTimestamp(transactions.concat(event), true)
        });

        return () => {
            pai.removeAllListeners("Transfer");
        }

    }, []);


    useEffect(() => {
        if(address === undefined) return; 

        getTransactions()
        .then((data:Array<ethers.providers.Log>) => {

            // Augment Log with Block info, and reverse sort 
            augmentLogsWithBlockInfo(data)
            .then((data => {
                setTransactions(
                    data.sort((a:TxHistoryItem, b:TxHistoryItem):number => {
                        return b.block.timestamp - a.block.timestamp;
                    })
                    .map((a:TxHistoryItem) => {
                        return a.log
                    })
                );
            }));
        })
        .catch((error:any) => { throw error });


    }, [address])

    const augmentLogsWithBlockInfo = async (data:Array<ethers.providers.Log>) => {

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);

        return Promise.all(data.map(async (log:ethers.providers.Log) => {
            const block = await provider.getBlock(log.blockNumber);
            return {log, block}
        }));
    }

    const sortByBlockTimestamp = (logs: Array<ethers.providers.Log>, reverse:boolean):Promise<void|Array<ethers.providers.Log>> => {

        return augmentLogsWithBlockInfo(logs)
        .then(augmentedLogs => {
            augmentedLogs.sort((a:TxHistoryItem, b:TxHistoryItem):number => {
                return reverse ? (b.block.timestamp - a.block.timestamp) : (a.block.timestamp - b.block.timestamp);
            })
            .map((a:TxHistoryItem) => {
                return a.log
            })
        })
    }

    const getTransactions = async ():Promise<Array<ethers.providers.Log>> => {

        console.log("getTransactions Called")

        const getFilter = (latestBlockNumber:number) => {
            return {
                address: L2_PAI_ADDRESS,
                fromBlock: latestBlockNumber - 10000,
                toBlock: latestBlockNumber,
                topics: [
                    ethers.utils.id("Transfer(address,address,uint256)")
                ]
            }
        }

        const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);

        let blockHeight = await provider.getBlockNumber();

        setRefreshing(true);

        let data:Array<ethers.providers.Log> = [];
        for(let i = 1; i <= 3; i++) {
            const result:void|Array<ethers.providers.Log> = await provider.getLogs(getFilter(blockHeight))
                .catch((e) => console.error(e))

            if(result) data = data.concat(result);
            blockHeight = blockHeight - 10000 - 1;
        }

        setRefreshing(false);

        return data;
        // return data.filter((val, idx, self) => self.findIndex(t => (t.transactionHash === val.transactionHash)) === idx);
    }
    

    return (
        <FlatList
            data={transactions}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={getTransactions.bind(this)}
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