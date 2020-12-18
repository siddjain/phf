/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Asset } from './asset';

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
    @Returns('boolean')
    public async verify(ctx: Context, assetId: string, owner: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(assetId);
        if (!!buffer && buffer.length > 0) {
            const asset = JSON.parse(buffer.toString()) as Asset;
            // return true if actual owner is same as argument passed to the method
            return asset.owner === owner;
        }

        return false;
    }

    /* Each of them is eligible to a transaction function that is callable by applications. If a function name is prefixed with a _ it will be ignored. For Javascript all the functions
       will be eligible, but for Typescript the functions that are required must have a @Transaction() decorator
    */
    @Transaction()
    public async create(ctx: Context, assetId: string, metadata: string): Promise<void> {
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

        const asset = new Asset();
        asset.id = assetId;
        asset.owner = mspId;
        asset.metadata = metadata;
        
        // https://fabric-shim.github.io/master/fabric-shim.ClientIdentity.html#getID__anchor
        // for a X.509 certificate, this will return a string in the format: "x509::{subject DN}::{issuer DN}"
        // for Idemix there will be an error
        asset.createdBy = asset.lastModifiedBy = ctx.clientIdentity.getID();
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(assetId, buffer);
    }

    @Transaction()
    public async update(ctx: Context, assetId: string, newOwner: string): Promise<void> {
        const buffer = await ctx.stub.getState(assetId);
        if (!!buffer && buffer.length > 0) {
            const asset = JSON.parse(buffer.toString()) as Asset;
            const mspId = ctx.clientIdentity.getMSPID();
            if (asset.owner === mspId) {
                if (mspId !== newOwner) {
                    asset.owner = newOwner;
                    asset.lastModifiedBy = ctx.clientIdentity.getID();
                    await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
                }
            } else {
                throw new Error("You do not have permission to modify this asset");
            }
        } else {
            throw new Error(`The asset ${assetId} does not exist`);
        }
    }
}
