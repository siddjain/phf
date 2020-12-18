/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import * as bitcoin from "bitcoinjs-lib";

export class BlockHeader {
    public readonly nonce: Buffer;
    public readonly prevHash: Buffer;
    public readonly merkleRoot: Buffer;
    public readonly blockHash: Buffer;

    constructor(nonce: Buffer, previousHash: Buffer, merkleRoot: Buffer) {
        this.setProperty("nonce", 4, nonce);
        this.setProperty("prevHash", 32, previousHash);
        this.setProperty("merkleRoot", 32, merkleRoot);
        this.blockHash = bitcoin.crypto.hash256(Buffer.concat([nonce, previousHash, merkleRoot]));
    }

    /**
     * checks to see if the block header hashes to less than @param target
     * @param target the target expressed as 4 byte packed representation as explained in
     * https://en.bitcoin.it/wiki/Difficulty#How_is_difficulty_stored_in_blocks.3F
     * The lower the number, the more stringent (i.e., difficult to pass) is the check
     */
    public checkProofOfWork(target: number): boolean {
        return this.blockHash.compare(bitcoin.Block.calculateTarget(target)) <= 0;
    }

    /**
     * This block id differs from the block id as computed by bitcoin. E.g., see:
     * https://github.com/bitcoinjs/bitcoinjs-lib/blob/3f6f5ef97a1ee1b8337865209282c0095e22b2e7/ts_src/block.ts#L171
     * The only difference is that bitcoin actually reverses the block hash to get the Id. But that is merely due to
     * a historical accident. see https://learnmeabitcoin.com/guide/txid.
     * We will not make the same mistake here.
     */
    public getId(): string {
        return this.blockHash.toString("hex");
    }

    private setProperty(name: string, len: number, buf: Buffer) {
        if (!buf) {
            throw new Error(`${name} is null`);
        }
        if (buf.length !== len) {
            throw new Error(`${name} should be of ${len} bytes length`);
        }
        this[name] = buf; // for performance reasons, we do not make a copy of the passed in buffer (note)
    }
}
