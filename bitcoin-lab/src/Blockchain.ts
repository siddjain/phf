/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import { Block } from "./Block";

export class Blockchain {
    public static GENESIS_BLOCK_HASH: string = Buffer.alloc(32).toString("hex");
    // the chain of blocks
    private blocks: { [id: string]: Block };
    // the last block in the chain
    private lastBlock: Block;
    // the blockchain difficulty expressed as 4 byte target. In the real world, the Bitcoin block difficulty
    // changes with time but we use a constant difficulty in this exercise.
    private readonly target: number;

    constructor(target: number) {
        this.target = target;
        this.blocks = {};
    }

    /**
     * check if this chain is valid
     */
    public validate(): boolean {
        let len = 0;
        if (this.lastBlock) {
            let id = this.lastBlock.getId();
            while (id !== Blockchain.GENESIS_BLOCK_HASH) {
                const block = this.blocks[id];
                if (block && block.isValid(this.target)) {
                    len++;
                } else {
                    return false;
                }
                id = block.getPreviousBlockId();
            }
        }
        if (len === this.getLength()) {
            return true;
        } else {
            return false;
        }
    }

     /**
      * returns the number of blocks in this chain. The return value from
      * this method should be trusted only if this chain is valid.
      * If the chain is invalid, the return value does not mean anything.
      */
    public getLength(): number {
        throw new Error("Not implemented exception");
    }

    /**
     * Adds given block to the chain of blocks
     * @param block the block to add
     */
    public addBlock(block: Block): void {
        throw new Error("Not implemented exception");
    }

    public getLastBlock(): Block {
        throw new Error("Not implemented exception");
    }

    public getTarget(): number {
        throw new Error("Not implemented exception");
    }

    /**
     * return block corresponding to given @param id
     * @param id id of the block you want
     */
    public getBlockById(id: string): Block {
        throw new Error("Not implemented exception");
    }
}
