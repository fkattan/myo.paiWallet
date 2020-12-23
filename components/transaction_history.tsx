import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import {Feather} from '@expo/vector-icons';
import * as Colors from '../colors';

import "@ethersproject/shims"
import {ethers} from 'ethers';
import {L2_PROVIDER_URL, L2_PAI_ADDRESS} from '../constants';
import PAI from '../reference/PAI.json';

import TransferEventListItem from './transfer_event_list_item';

import i18n from 'i18n-js';
import {titleize} from '../utils/text_helpers';

const MOCK_DATA = 
[ { blockNumber: 5196629,
    blockHash: '0x19b083ee0752347f0bba9cd1cf19c827fd108c0f5d4973e33719d97a60cf14ca',
    transactionIndex: 1,
    removed: false,
    address: '0xF92298d72afE68300EA065c0EdaDbb1A29804faa',
    data: '0x00000000000000000000000000000000000000000000021e19e0c9bab2400000',
    topics: 
        [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x000000000000000000000000f58e01ac4134468f9ad846034fb9247c6c131d8c' ],
    transactionHash: '0xdad8bc380240548aafecba06bf6cee898513da850bb37859cfea5f93d8dd25da',
    logIndex: 0 },
    { blockNumber: 5301391,
    blockHash: '0x00b7bfeade71c17fd99bcc7c9b684cedad05fede5201e0dbc64614e14b07b07c',
    transactionIndex: 23,
    removed: false,
    address: '0xF92298d72afE68300EA065c0EdaDbb1A29804faa',
    data: '0x00000000000000000000000000000000000000000000000000038d7ea4c68000',
    topics: 
        [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f58e01ac4134468f9ad846034fb9247c6c131d8c',
        '0x0000000000000000000000002d92bce8a6cf0fd32cffcabed026a6cb34ee0e9b' ],
    transactionHash: '0xf4f973b90fea5b32bf09b55166ee106b81cffd9d1ca8dd4752541d927f12dc18',
    logIndex: 33 },
    { blockNumber: 5301417,
    blockHash: '0x474fd08cad1d1ea870b8ed60d39505afd8b6e6be40f72c61581602056d7c8d1f',
    transactionIndex: 0,
    removed: false,
    address: '0xF92298d72afE68300EA065c0EdaDbb1A29804faa',
    data: '0x00000000000000000000000000000000000000000000000000005af3107a4000',
    topics: 
        [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f58e01ac4134468f9ad846034fb9247c6c131d8c',
        '0x0000000000000000000000002d92bce8a6cf0fd32cffcabed026a6cb34ee0e9b' ],
    transactionHash: '0x8fa45694dc0c06b8b447f56221551cdec7987414b127d215d27e992f745d30a8',
    logIndex: 0 },
    { blockNumber: 5321681,
    blockHash: '0x600fad7a526ac89210378b63df96c09b45238a526fc10df42bfd34643d6b3cfa',
    transactionIndex: 24,
    removed: false,
    address: '0xF92298d72afE68300EA065c0EdaDbb1A29804faa',
    data: '0x000000000000000000000000000000000000000000000000000000000000000a',
    topics: 
        [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f58e01ac4134468f9ad846034fb9247c6c131d8c',
        '0x00000000000000000000000015c72944b325a3e1c7a4dbdc6f883bd5948d3d9f' ],
    transactionHash: '0x3518b448d9091b3afa3822c4f7ed2216879bba875078b7cc3499142eb50be828',
    logIndex: 22 },
    { blockNumber: 5326453,
    blockHash: '0x2d709809aa31acc2e047f5d9f2c87aaff958c823725aa3ba7e5cbf5ff5bd7f7a',
    transactionIndex: 33,
    removed: false,
    address: '0xF92298d72afE68300EA065c0EdaDbb1A29804faa',
    data: '0x000000000000000000000000000000000000000000000000000000000000000a',
    topics: 
        [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f58e01ac4134468f9ad846034fb9247c6c131d8c',
        '0x00000000000000000000000015c72944b325a3e1c7a4dbdc6f883bd5948d3d9f' ],
    transactionHash: '0x0e594a0cfc3bd89df75e9e178f1ef63441e950b621d145fdc063123af595a2f5',
    logIndex: 66 },
    { blockNumber: 5326455,
    blockHash: '0x85d1bb0651b8064e367b3958133712774d205039cfc8d25a9234e875e48c9615',
    transactionIndex: 16,
    removed: false,
    address: '0xF92298d72afE68300EA065c0EdaDbb1A29804faa',
    data: '0x000000000000000000000000000000000000000000000000000000000000000a',
    topics: 
        [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f58e01ac4134468f9ad846034fb9247c6c131d8c',
        '0x00000000000000000000000015c72944b325a3e1c7a4dbdc6f883bd5948d3d9f' ],
    transactionHash: '0xf8f2affa3ea09c609dba11b2da4ec0946ae72f269887dd239729c5951f661b21',
    logIndex: 38 },
    { blockNumber: 5326525,
    blockHash: '0xa0b85af06cbed82cfdea7658c21983502c01679efa79142d34470eb58c3ba9a2',
    transactionIndex: 43,
    removed: false,
    address: '0xF92298d72afE68300EA065c0EdaDbb1A29804faa',
    data: '0x000000000000000000000000000000000000000000000000000000000000000a',
    topics: 
        [ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f58e01ac4134468f9ad846034fb9247c6c131d8c',
        '0x00000000000000000000000015c72944b325a3e1c7a4dbdc6f883bd5948d3d9f' ],
    transactionHash: '0xc6a8fa37107ed2bd3d9c07be0c86ff8a83002ab590d296cc3af303f09f68b368',
    logIndex: 122 } ]


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

        pai.on("Approval", (from:string, to:string, amount:ethers.BigNumber, event: ethers.providers.EventType) => {
            console.log("Approved Event Caught", from, to, amount.toString(), new Date());
            console.log("Event: ", event);

            if(transactions === undefined) return;

            // sortByBlockTimestamp(transactions.concat(event), true)

        });


        return () => {
            pai.removeAllListeners("Approval");
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

        const getFilter = (latestBlockNumber:number) => {
            return {
                address: L2_PAI_ADDRESS,
                fromBlock: latestBlockNumber - 10000,
                toBlock: latestBlockNumber,
                topics: [
                    ethers.utils.id("Approval(address,address,uint256)")
        //         ethers.utils.id("TransferTo(address,uint256)")
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
    }
    

    return (
        <FlatList
            data={transactions}
            refreshing={refreshing}
            keyExtractor={(item) => item.transactionHash}
            onRefresh={getTransactions}
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