/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public id: string;
    @Property()
    public owner: string;
    @Property()
    public createdBy: string;
    @Property()
    public lastModifiedBy: string;
    @Property()
    public metadata: string;
}
