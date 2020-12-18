/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { Wallets } = require('fabric-network');

async function main() {

    // Main try/catch block
    try {

        // A wallet stores a collection of identities
        const wallet = await Wallets.newFileSystemWallet('wallet');

        // Identity to credentials to be stored in the wallet
        const certificate = fs.readFileSync(process.env.PUBLIC_CERT).toString();
        const privateKey = fs.readFileSync(process.env.PRIVATE_KEY).toString();

        // Load credentials into wallet
        const identityLabel = process.env.USER_NAME;

        const identity = {
            credentials: {
                certificate,
                privateKey
            },
            mspId: process.env.MSP_ID,
            type: 'X.509'
        }

        await wallet.put(identityLabel, identity);

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

main().then(() => {
    console.log('done');
}).catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
