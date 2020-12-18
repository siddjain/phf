/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

// Bring key classes into scope, most importantly Fabric SDK network class
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Wallets, Gateway } from 'fabric-network';
import { Client } from 'fabric-common';

const uuids = ["f4c0cea8-9a93-42c3-a722-e8cce1993d6a",
    "10b26499-59d5-4af9-8436-8c14b2d97aee",
    "fb58b6c7-2aba-4b54-98db-976c4483b596",
    "2e5ccd11-378e-48e9-8909-c4bff1a3c3c2",
    "c2243d78-74ed-492a-bacc-a5ca3f54abeb",
    "74a60a2c-bcdc-4ca9-9b73-a1c1d8284b27",
    "6ef8ab91-a69a-40d1-8b7f-8412559c219b"];

const fingerprints = ["BcPHswkTXhRt5DtdOyTifs0C9WsLoP79VGrIlVG6Izc=",
    "uewBV1A7o8JnBuluUAjwQYa53unXYerSoyNCzQeY0lw=",
    "52qs0QZBYmMpSke3teZ2zpQmmhT+M7nJc/oompQa/6w=",
    "1Ur0AFGKL9WApYplOADq0Zt/qMqObtaKdBlvJwIVqP4=",
    "+JYznSeisydefWfMgIIP66iSau1UmHF47V2Xzqj/Z7o=",
    "tOoACKY21H+DBv6yc1cJBFhTQLALij0z1KafrCOI+1U=",
    "fvjO8D+DZgm1DxgKou4kBjOmw41IKNalZvAPj33CFRs="];

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

        console.log('Submit create transaction.');
        for (var i = 0; i < uuids.length; i++) {
            await contract.submitTransaction('create', uuids[i], fingerprints[i]);
        }

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
