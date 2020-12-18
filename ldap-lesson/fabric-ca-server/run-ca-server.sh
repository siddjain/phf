#!/bin/bash
# Prerequisites: The Docker network biotor_net must be setup before this script is run.
set -e

CONTAINER_NAME=${CONTAINER_NAME:-mickey.biotor.com}
SRC=${SRC:-src}
WORKDIR=${WORKDIR:-'/home'}
NETWORK=${NETWORK:-biotor_net}
HOST_PORT=${HOST_PORT:-443}
CONTAINER_PORT=${CONTAINER_PORT:-6000}
DATA_DIR=${DATA_DIR:-"$PWD/data"}

docker container create \
--name $CONTAINER_NAME \
--network $NETWORK \
-p $HOST_PORT:$CONTAINER_PORT \
--workdir $WORKDIR \
--volume $DATA_DIR:$WORKDIR \
--env FABRIC_CA_HOME=$WORKDIR \
--env GODEBUG=netdns=go \
hyperledger/fabric-ca:1.4.6 \
fabric-ca-server start

# copy contents of SRC into WORKDIR
docker cp $SRC/. $CONTAINER_NAME:$WORKDIR

docker start $CONTAINER_NAME
