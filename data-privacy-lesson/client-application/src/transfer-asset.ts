/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */


// Bring key classes into scope, most importantly Fabric SDK network class
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Wallets, Gateway } from 'fabric-network';
import { Client } from 'fabric-common';

const assetId = process.argv[2];
const key = process.argv[3];
const newFingerprint = process.argv[4];

// Main program function
async function main () {
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
            // read about the discovery service here: 
            // https://github.com/hyperledger/fabric-sdk-node/blob/v2.1.0/docs/tutorials/discovery-fabric-network.md
            discovery: { enabled: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');
        await gateway.connect(connectionProfile, connectionOptions);

        // Access tracktrace channel
        console.log('Use network channel: tracktrace.');

        const network = await gateway.getNetwork('tracktrace');
        
        const chaincodeId = 'privacy';        
        console.log(`Use ${chaincodeId} smart contract.`);
        const contract = await network.getContract(chaincodeId);

        console.log('Submit update transaction.');
        const tx = contract.createTransaction("update");
        tx.setTransient({
            "key": Buffer.from(key)
        });
        const result = await tx.submit(assetId, newFingerprint);
        console.log(result.toString());
        console.log('Transaction complete.');
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
