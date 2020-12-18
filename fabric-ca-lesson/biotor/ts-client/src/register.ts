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

async function loadIdentity(wallet: Wallet, username: string) {
    const identity = await wallet.get(username);
    if (!identity) {
        throw `Could not find ${username} in the wallet`;   
    }
    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(identity.type);
    return await provider.getUserContext(identity, username);
}

// Main program function
async function main () {
    const url = process.env["URL"];
    const cacert = process.env["TLS_CA_CERT"];
    const caName = process.env["CA_NAME"];
    const registrar = process.env["REGISTRAR"];
    const username = process.env["USERNAME"];
    const affiliation = process.env["AFFILIATION"];
    const type = process.env["TYPE"];
    const email = process.env["EMAIL"];
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
    const adminUser = await loadIdentity(wallet, registrar);
    
    // Register the user, enroll the user, and import the new identity into the wallet.
    console.log("Making registration request...");
    const secret = await ca.register({
        affiliation: affiliation,
        enrollmentID: username,
        role: type,
        attrs: [{name: "email", value: email, ecert: true}] // just for demonstration
    }, adminUser);

    console.log(`Successfully registered ${username} with password ${secret}`);
}

main().then(() => {
    console.log('program complete.');
}).catch((e) => {
    console.log('program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});