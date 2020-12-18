/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

const { createConnectionOpts, createClient, ldapjs } = require("./ldapjs-client");
const fs = require("fs");
const readline = require("readline");
const config = createConnectionOpts("config.yaml");

async function main() {
    var client = await createClient(config); 
    
    console.log("logging in as config admin...");
    await client.bind(config.configDN, config.configPassword);
    
    console.log("updating password policy...");
    await setPasswordPolicy(client);

    console.log("logging out...");
    await client.unbind(); // always remember to unbind!    
}


async function setPasswordPolicy(client) {
    // this will cause OpenLDAP to use the crypt function
    // to hash passwords. The behavior of the crypt function can vary
    // from system to system.
    var change = new ldapjs.Change({
        operation: 'replace',
        modification: { olcPasswordHash: '{CRYPT}' }
    });
    await client.modify("olcDatabase={-1}frontend,cn=config", change);

    // this will change the hash algorithm to SHA512 with 8 byte salt
    //     ID  | Method
    //     ─────────────────────────────────────────────────────────
    //     1   | MD5
    //     2a  | Blowfish (not in mainline glibc; added in some
    //         | Linux distributions)
    //     5   | SHA-256 (since glibc 2.7)
    //     6   | SHA-512 (since glibc 2.7)    
    change = new ldapjs.Change({
        operation: 'add',
        modification: { olcPasswordCryptSaltFormat: '$6$%.8s' }
    });
    await client.modify("cn=config", change);
}

console.log(config);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
rl.question('Continue? (y/n) ', (answer) => {
    if (answer === "y") {
        main().then(() => console.log("done") )
        .catch((e) => {
            console.log(e);
            console.log(e.stack);
            process.exit(-1);
          });
    }
    rl.close();
});
