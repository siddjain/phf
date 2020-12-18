#!/bin/bash
URL=https://mickey.biotor.com:443 \
CA_NAME=donald-duck \
TLS_CA_CERT=donald_mickey_chain.pem \
PASSWORD='batman' \
USERNAME=orderer0.biotor.com \
PROFILE=tls \
HOSTS=orderer0.biotor.com,foo.biotor.com,bar.biotor.com \
node enroll.js
