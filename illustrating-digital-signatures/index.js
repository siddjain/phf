/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

const bitcoin = require('bitcoinjs-lib');
const secp256k1 = require('secp256k1');
const keyPair = bitcoin.ECPair.makeRandom();                    
const messageSent = 'From: Bob, To: George, Amount: 1BTC';      
const messageReceived = messageSent;                            
const digest = bitcoin.crypto.hash256(messageSent);             
const sigObj = secp256k1.ecdsaSign(digest, keyPair.privateKey);      
const observed = bitcoin.crypto.hash256(messageReceived);       
console.log(secp256k1.ecdsaVerify(sigObj.signature, observed, keyPair.publicKey)) 

