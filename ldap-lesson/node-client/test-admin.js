/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

const { createConnectionOpts, createClient } = require("./ldapjs-client");
var opts = createConnectionOpts("config.yaml");
console.log(opts);
    
  main()
  .then(() => { console.log("done"); })
  .catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
  });                      

async function main() {
     var client = await createClient(opts);
     await client.bind(opts.adminDN, opts.adminPassword);
     console.log(`${opts.adminDN} successfully authenticated!`);
     await client.unbind();
}