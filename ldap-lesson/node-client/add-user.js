/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

/*
 * This code sample will demonstrate various LdapJS APIs:
 * - Bind
 * - Search
 * - Add
 * - Delete
 * - Unbind 
 */

const { createConnectionOpts, createClient } = require("./ldapjs-client");
const assert = require("assert");
const fs = require("fs");
const readline = require("readline");
var opts = createConnectionOpts("config.yaml");
var argv = process.argv.slice(2);
var ok = false;
if (argv.length === 3) {
  var username = argv[0];
  var password = argv[1];
  var fullName = argv[2];
  if (username && password && fullName) {
    ok = true;
    console.log(opts);
    
    // uncomment this when you want to test in vs code debugger
    // main(username, password, fullName).then(()=> console.log("done"));
    
    // comment out rl section if you want to test in vs code debugger    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });      
    rl.question('Continue? (y/n) ', (answer) => {
        if (answer === "y") {
          main(username, password, fullName)
          .then(() => { console.log("done"); })
          .catch((e) => {
            console.log(e);
            console.log(e.stack);
            process.exit(-1);
          });                      
        }
        rl.close();                
    });    
  }  
}

if (!ok) {
  console.log("Usage: node add-user.js <username> <password> <full name>");
  console.log('E.g.,: node add-user.js siddjain superman "Siddharth Jain"');
}

async function main(username, passwd, fullName) {
  try
  {
    var user = getDN(username, opts.baseDN);
    var adminDN = opts.adminDN;
    var adminPassword = opts.adminPassword;
    var client = await createClient(opts);     
    await client.bind(adminDN, adminPassword);
    console.log("logged in as admin");
    var exists = await client.exists(user);
    if (exists) {
      console.log(user + " already exists");
      console.log("deleting " + user);
      await client.del(user);
    }
    await addUser(client, username, passwd, fullName, opts.baseDN);
    console.log("added " + username);
    await client.unbind();

    // Note that you have to create a new client. Trying to reuse the existing client will abruptly exit without any warning or message.
    client = await createClient(opts);
    var userEntry = await client.bind(user, passwd);
    console.log("tested logging with " + username + " credentials");    
    await client.unbind(); // if you don't unbind the process won't exit even though main method will exit
  } catch (e) {
      console.error(e);
  }
}

async function addUser(client, username, passwd, fullName, baseDN) {
  // cn and sn fields are required for inetorgperson
  var newUser = {
    cn: fullName,
    sn: getSurname(fullName),
    uid: username,
    objectClass: 'inetOrgPerson',
    userPassword: passwd
  };
  // the await below is necessary. try removing it and see what happens.
	await client.add(getDN(username, baseDN), newUser);
}

function getDN(username, baseDN) {
  return "uid=" + username + ",ou=users," + baseDN;
}

function getSurname(fullName) {
  var words = fullName.split(" ");
  return words[words.length - 1];
}