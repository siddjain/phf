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
  var username = argv[0];
  if (username) {
    ok = true;
    console.log(opts);
    
    // uncomment this when you want to test in vs code debugger
    // main(username).then(()=> console.log("done"));
    
    // comment out rl section if you want to test in vs code debugger    
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });      
    rl.question('Continue? (y/n) ', (answer) => {
        rl.close();
        if (answer === "y") {
          main(username)
          .then(() => { console.log("done"); })
          .catch((e) => {
            console.log(e);
            console.log(e.stack);
            process.exit(-1);
          });                      
        }        
    });
        
  }  
}

if (!ok) {
  console.log("Usage: node get-entry.js <username>");
  console.log('E.g.,: node get-entry.js bob');
}

async function main(username) {
    // Reading a user's details does not require us to bind 
    // This is how we have confiured the server
     var user = getDN(username, opts.baseDN);
     var client = await createClient(opts);
     var entry = await client.getEntry(user);
     console.log(entry);
     await client.unbind(); // we still hane to unbind
}

function getDN(username, baseDN) {
    return "uid=" + username + ",ou=users," + baseDN;
}