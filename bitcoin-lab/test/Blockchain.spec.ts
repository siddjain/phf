/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');
import * as bitcoin from "../src";
import { PerformanceObserver, performance } from 'perf_hooks';

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);
const assert = chai.assert;

const EASY_TARGET = 0x1fffffff;
const MEDIUM_TARGET = 0x1effffff;
const DIFFICULT_TARGET = 0x1dffffff;

// transactions in first block
let transactions1 = ["From: Alice, To: Bob, Amount: $1",
"From: Bob, To: George, Amount: $1",
"From: George, To: Jonny, Amount: $1"];

// transactions in second block
let transactions2 = ["From: Johnny, To: Dick, Amount: $1",
"From: Dick, To: Harry, Amount: $1",
"From: Harry, To: Peter, Amount: $1"];

// transactions in third block
let transactions3 = ["From: Peter, To: Dia, Amount: $1",
"From: Dia, To: Sasha, Amount: $1",
"From: Sasha, To: Vivek, Amount: $1"];

function mineBlock(transactions: string[], chain: bitcoin.Blockchain, len: number): bitcoin.Block {
    performance.mark("t0");
    let target = chain.getTarget();
    let last : bitcoin.Block = chain.getLastBlock();
    let lastId: string = null;
    if (!last) {
        lastId = bitcoin.Blockchain.GENESIS_BLOCK_HASH;
    } else {
        lastId = last.getId();
    }
    let block = new bitcoin.Block(transactions, lastId);
    assert(!block.isValid(target));
    block.mineNonce(target);
    assert(block.isValid(target));
    chain.addBlock(block);
    assert(chain.validate());
    assert(chain.getLength() === len);  
    performance.mark("t1");
    performance.measure(`time to mine block #${len}`, "t0", "t1");
    let nonce = block.getHeader().nonce.toString("hex");    
    console.log(`${len} | ${nonce} | ${lastId}`);
    return block;  
}

const obs = new PerformanceObserver((list, observer) => {
    list.getEntries().map(x => console.log(x));
    performance.clearMarks();
    observer.disconnect();
  });
obs.observe({ entryTypes: ['measure'], buffered: true });

function fixChain(chain: bitcoin.Blockchain): bitcoin.Blockchain {
    throw new Error("Not implemented exception");
}

describe('Blockchain', () => {
    it("e2e test", () => {
        let target = EASY_TARGET;
        console.log("target = " + target.toString(16));
        let chain = new bitcoin.Blockchain(target);
        let blocks: bitcoin.Block[] = [];
        console.log("Block | Nonce | PrevBlockId")
        blocks.push(mineBlock(transactions1, chain, 1));
        blocks.push(mineBlock(transactions2, chain, 2));
        blocks.push(mineBlock(transactions3, chain, 3));
        let block = blocks[0]; // the block to hack
        block.transactions[0] = "From: Alice, To: Bob, Amount: 100 BTC";
        assert(!block.isValid(target));
        assert(!chain.validate());    
        let chain2 = fixChain(chain);        
        assert(chain2.validate());
    });    
});