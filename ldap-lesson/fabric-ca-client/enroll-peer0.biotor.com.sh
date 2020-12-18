#!/bin/bash
URL=https://mickey.biotor.com:443 \
CA_NAME=donald-duck \
TLS_CA_CERT=donald_mickey_chain.pem \
PASSWORD='captain america' \
USERNAME=peer0.biotor.com \
PROFILE=tls \
HOSTS=peer0.biotor.com,spam.biotor.com,eggs.biotor.com \
node enroll.js
