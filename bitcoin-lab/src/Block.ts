/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import { BlockHeader } from "./BlockHeader";

export class Block {
    // previous block hash - 32 bytes
    public readonly prevHash: Buffer;
    // list of transactions this block contains. For purposes of this exercise let each transaction be a string
    // of the form "From: Alice, To: Bob, Amount: 1 BTC" as example
    // all transactions are protected by digital signatures. so an attacker who wants to hack the blockchain
    // can only change the order of transactions or remove them from the block. But doing so will change
    // the Merkle root and invalidate the block hash.
    public readonly transactions: string[];
    // magic number (4 bytes) so that the block header when hashed is less than a certain number (the difficulty)
    private nonce: Buffer;

    /**
     * Creates a block
     * @param transactions list of transactions this block should contain
     * @param previousBlockId hex string of previous block Id
     */
    constructor(transactions: string[], previousBlockId: string) {
        this.transactions = transactions;
        if (!previousBlockId) {
            throw new Error("previousBlockId is null");
        }
        if (previousBlockId.length !== 64) {
            throw new Error("expected string of length 32 bytes for the previousBlockId");
        }
        this.nonce = Buffer.alloc(4);                            // initialize to zero bytes
        this.prevHash = Buffer.from(previousBlockId, "hex");
    }

    /**
     * A block is valid if its id is less than {@param target}
     * @param target a number that controls how difficult it is to mine a nonce. Lower this number, higher the difficulty.
     * The target is expressed in 4 byte packed representation of a 32 byte number as explained in
     * https://en.bitcoin.it/wiki/Difficulty#How_is_difficulty_stored_in_blocks.3F
     */
    public isValid(target: number): boolean {
        return this.getHeader().checkProofOfWork(target);
    }

    /**
     * The Block header (68 bytes) consist of:
     * 4 byte nonce
     * 32 byte previous block id
     * 32 byte root of Merkle tree of the transactions in this block
     */
    public getHeader(): BlockHeader {
        throw new Error("Not implemented exception");
    }

    /**
     * The block id is nothing but the double sha256 hash of the block header
     */
    public getId(): string {
        throw new Error("Not implemented exception");
    }

    /**
     * return id of the previous block in the chain
     */
    public getPreviousBlockId(): string {
        throw new Error("Not implemented exception");
    }

    /**
     * Find a nonce such that the block header hashes to less than @param target
     * @param target expressed as 4 bytes packed representation. see https://en.bitcoin.it/wiki/Difficulty#How_is_difficulty_stored_in_blocks.3F
     * @returns true if a nonce has been found, false if no solution exists for given @param target
     */
    public mineNonce(target: number): boolean {
        throw new Error("Not implemented exception");
    }
}
