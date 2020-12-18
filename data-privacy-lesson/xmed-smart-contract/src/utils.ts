/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import * as crypto from 'crypto';

export function sha256(data: Buffer): Buffer {
    return crypto.createHash('sha256').update(data).digest();
}

export function hash256(data: Buffer): Buffer {
    return sha256(sha256(data));
}
