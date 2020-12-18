/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

// Examples:
// node verify-password.js Nrru4JImzicE0wYy9867t5/YnTS/Q/cv "magic mushrooms"
// node verify-password.js GuUGr6USlAyXV2skA6+X30HRRufboD3O 'captain america'
// node verify-password.js WsPMoBcg3orn/5G2PDiNQu/jsWigif6g batman
var crypto = require('crypto');
var argv = process.argv.slice(2);
let hashedPassword = argv[0];
let actualPassword = argv[1];
let buf1 = Buffer.from(hashedPassword, 'base64');
let observed = Buffer.allocUnsafe(20);
buf1.copy(observed, 0, 0, 20);
let n = buf1.length - 20;
let salt = Buffer.allocUnsafe(n);
buf1.copy(salt, 0, 20, buf1.length);
let buf2 = Buffer.from(actualPassword);
let shasum = crypto.createHash('sha1');
shasum.update(buf2);
shasum.update(salt);
let expected = shasum.digest();
console.log(expected.equals(observed));
