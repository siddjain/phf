/*
 * Programming Hyperledger Fabric
 * Siddharth Jain
 * (c) All rights reserved.
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Asset {

    @Property()
    public value: string;

}
