/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { hash256 } from './utils';

@Info({title: 'AssetContract', description: 'My Smart Contract' })
export class AssetContract extends Contract {
    /* Notice the lines that start with @Transaction - these are functions that define your contract's transactions i.e. the things it allows you to do to interact with the ledger
       The empty brackets in @Transaction() tells us that this function is intended to change the contents of the ledger. Transactions like this are typically submitted (as opposed to evaluated)
    */
    @Transaction(false)
    @Returns('boolean')
    public async assetExists(ctx: Context, assetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(assetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction(false)
    @Returns('string')
    public async getFingerprint(ctx: Context, assetId: string): Promise<string> {
        const buffer = await ctx.stub.getState(assetId);
        if (!!buffer && buffer.length > 0) {
            return buffer.toString();            
        }
        throw new Error("asset does not exist");
    }

    /* Each of them is eligible to a transaction function that is callable by applications. If a function name is prefixed with a _ it will be ignored. For Javascript all the functions
       will be eligible, but for Typescript the functions that are required must have a @Transaction() decorator
    */
    @Transaction()
    public async create(ctx: Context, assetId: string, fingerprint: string): Promise<void> {
        // 1. first check if caller even has permission to create an asset
        // aliter: ctx.stub.getCreator().mspid;
        const mspId = ctx.clientIdentity.getMSPID();
        if (mspId !== "BiotorMSP") {
            throw new Error("you do not have permission to create an asset");
        }

        const exists = await this.assetExists(ctx, assetId);
        if (exists) {
            throw new Error(`The asset ${assetId} already exists`);
        }

        const buffer = Buffer.from(fingerprint);
        await ctx.stub.putState(assetId, buffer);
    }

    @Transaction()
    public async update(ctx: Context, assetId: string, to_fingerprint: string): Promise<void> {        
        const buffer = await ctx.stub.getState(assetId);
        if (!!buffer && buffer.length > 0) {
            const from_fingerprint = buffer.toString();
            const mspId = ctx.clientIdentity.getMSPID();
            // get the key to "unlock" the fingerprint stored on the blockchain
            const transientMap = ctx.stub.getTransient();
            const key = transientMap.get("key");
            const test = Buffer.concat([key, Buffer.from(mspId)]);
            const digest = hash256(test).toString("base64");
            if (digest === from_fingerprint) {
                console.log(`${assetId} belongs to ${mspId}`);
                await ctx.stub.putState(assetId, Buffer.from(to_fingerprint));
            } else {
                throw new Error("You do not have permission to modify this asset");
            }
        } else {
            throw new Error(`The asset ${assetId} does not exist`);
        }
    }    
}
