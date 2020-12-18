/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

// Bring key classes into scope, most importantly Fabric SDK network class
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Wallets, Gateway, Network } from 'fabric-network';
import { Client } from 'fabric-common';
const {	BlockDecoder } = require('fabric-common');

async function queryBlock(network: Network, blockNum: number) {
    const channelName = network.getChannel().name;
    try {
        // Get the contract from the network.
        const contract = network.getContract('qscc');
        const resultByte = await contract.evaluateTransaction(
            'GetBlockByNumber',
            channelName,
            String(blockNum)
        );
        // see hyperledger/fabric-samples/off_chain_data/blockProcessing.js
        // for how to process this further
        return BlockDecoder.decode(resultByte);        
    } catch (error) {
        console.error(
            `Failed to get block ${blockNum} from channel ${channelName} : `,
            error
        );
        return null;
    }
}

// Main program function
async function main () {
    const blockNum = parseInt(process.argv[2]);
    const filename = process.argv[3];

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('wallet');

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();
    
    // Main try/catch block
    try {
        // Specify userName for network access
        const userName = 'Alice';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('Biotor-connection.yaml', 'utf8')) as Client;

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await gateway.connect(connectionProfile, connectionOptions);

        // Access tracktrace channel
        console.log('Use network channel: tracktrace.');
        const network = await gateway.getNetwork('tracktrace');        
        const data = await queryBlock(network, blockNum);
        fs.writeFileSync(filename, JSON.stringify(data));
    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
    } finally {
        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();
    }
}

main().then(() => {
    console.log('program complete.');
}).catch((e) => {
    console.log('program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
