#!/bin/bash
CRYPTO_DIR=${PWD}/../three-org-network/crypto-config \
docker-compose -f docker-compose.yaml up -d --no-recreate