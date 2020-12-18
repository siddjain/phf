/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import * as fs from 'fs';
import { Wallets, Wallet } from 'fabric-network';
import FabricCAServices = require('fabric-ca-client');
import { TLSOptions } from 'fabric-ca-client';
import https = require('https');

// Main program function
async function main () {
    const url = process.env["URL"];
    const cacert = process.env["TLS_CA_CERT"];
    const caName = process.env["CA_NAME"];
    const password = process.env["PASSWORD"];
    const username = process.env["USERNAME"];
    const profile = process.env["PROFILE"];
    const tlsOptions: TLSOptions = {
        trustedRoots: [fs.readFileSync(cacert)],
        verify: true
    }
    https.globalAgent.options.key = fs.readFileSync('client_tls_key.pem');
    https.globalAgent.options.cert = fs.readFileSync('client_tls_cert.pem');
    const ca = new FabricCAServices(url, tlsOptions, caName);
    // Create a new file system based wallet for managing identities.
    const walletPath = './wallet';
    const wallet = await Wallets.newFileSystemWallet(walletPath);    
    
    // enroll the user, and import the new identity into the wallet.
    console.log("Making enrollment request...");    
    const res = await ca.enroll({
        enrollmentID: username,
        enrollmentSecret: password,
        profile: profile
    });
    const x509Identity = {
        credentials: {
            certificate: res.certificate,
            privateKey: res.key.toBytes()
        },
        mspId: 'BiotorMSP',
        type: 'X.509'
    };
    await wallet.put(username, x509Identity);
    console.log(`Successfully enrolled ${username} and imported it into the wallet`);  
}

main().then(() => {
    console.log('program complete.');
}).catch((e) => {
    console.log('program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});