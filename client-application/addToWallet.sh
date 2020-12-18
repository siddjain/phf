#!/bin/bash
USER_NAME=Alice \
PUBLIC_CERT=${PWD}/../three-org-network/crypto-config/peerOrganizations/biotor.com/users/User1\@biotor.com/msp/signcerts/User1\@biotor.com-cert.pem \
PRIVATE_KEY=${PWD}/../three-org-network/crypto-config/peerOrganizations/biotor.com/users/User1\@biotor.com/msp/keystore/priv_sk \
MSP_ID=BiotorMSP \
HFC_LOGGING='{"debug":"console","info":"console","warn":"console","error":"console"}' \
node addToWallet.js
