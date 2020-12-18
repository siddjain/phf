/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

const { createConnectionOpts, createClient } = require("./ldapjs-client");
const assert = require("assert");
const fs = require("fs");
const readline = require("readline");
var opts = createConnectionOpts("config.yaml");
var argv = process.argv.slice(2);
var ok = false;
if (argv.length >= 1) {
  var distinguishedName = argv[0];
  if (distinguishedName) {
    ok = true;
    console.log(opts);
    
    // uncomment this when you want to test in vs code debugger
    main(distinguishedName).then(()=> console.log("done")).catch((e) => {
      console.log(e);
      console.log(e.stack);
      process.exit(-1);
    });
    
    // comment out rl section if you want to test in vs code debugger    
    /*
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });      
    rl.question('Continue? (y/n) ', (answer) => {
        rl.close();
        if (answer === "y") {
          main(distinguishedName)
          .then(() => { console.log("done"); })
          .catch((e) => {
            console.log(e);
            console.log(e.stack);
            process.exit(-1);
          });                      
        }        
    });
      */  
  }  
}

if (!ok) {
  console.log("Usage: node get-entry.js <dn>");
  console.log('E.g.,: node get-entry.js uid=bob,ou=users,dc=biotor,dc=com');
}

async function main(dn) {
     // we do not check the dn to see if its a config dn.
     // we just assume that it is. Reading config requires
     // us to bind with credentials of config admin
     var client = await createClient(opts);
     await client.bind(opts.configDN, opts.configPassword);
     var entry = await client.getEntry(dn);
     console.log(entry);
     await client.unbind(); // this is still necessary to close the connection
}
