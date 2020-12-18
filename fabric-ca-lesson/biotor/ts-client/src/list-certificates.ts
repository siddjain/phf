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
    // load identity from the wallet
    const identity = await wallet.get(username);
    if (!identity) {
        throw `Could not find ${username} in the wallet`;   
    }
    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(identity.type);
    // getUserContext creates a SigningIdentity
    return await provider.getUserContext(identity, username);
}

// Main program function
async function main () {
    const url = process.env["URL"];
    const cacert = process.env["TLS_CA_CERT"];
    const caName = process.env["CA_NAME"];
    const registrarName = process.env["REGISTRAR"];
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
    const registrar = await loadIdentity(wallet, registrarName);
    const cs = ca.newCertificateService();
    const res = await cs.getCertificates(null, registrar);
    console.log(JSON.stringify(res));
}

main().then(() => {
    console.log('program complete.');
}).catch((e) => {
    console.log('program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});