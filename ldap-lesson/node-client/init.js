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
    
    console.log("logging in as admin...");
    await client.bind(config.adminDN, config.adminPassword);        
    console.log("adding users group...");
    await addUsersGroup(client);
    console.log("logging out as admin...");
    await client.unbind();
    
    console.log("creating new client...");
    client = await createClient(config);    
    console.log("logging in as " + config.configDN + "...");
    await client.bind(config.configDN, config.configPassword);
    console.log("setting password policy...");
    await setPasswordPolicy(client);
    client.unbind();    // don't forget this!
}

/** This method is unused */
async function addBaseEntry(client) {
	var entry = {
        o: "Biotor",
        objectClass: ['organization', "dcObject"],        
      };
    // the await below is necessary. try removing it and see what happens.
    await client.add(config.baseDN, entry);
}

async function addUsersGroup(client) {
    var entry = {
        objectClass: ["top", "organizationalUnit"]
    }
    await client.add("ou=users," + config.baseDN, entry);
}

async function setPasswordPolicy(client) {
    var change = new ldapjs.Change({
        operation: 'add',
        modification: {
            olcPasswordHash: '{SSHA}'
        }
    });
    // per https://serverfault.com/a/571989/77118
	// this only sets the format in which hashed passwords will be stored
	// it does not enable the hashing of passwords itself
	// this setting will not have any effect if olcPPolicyHashCleartext has not been set to TRUE
	// as explained in http://tutoriels.meddeb.net/openldap-password-policy-managing-users-accounts/
	// also note that {SSHA} is the default setting of hashed passwords so technically this operation
	// will be a no-op. we still do it for illustration purposes
    await client.modify("olcDatabase={-1}frontend,cn=config", change);    
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
