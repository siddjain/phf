#!/bin/bash
function volumeExists {
    # the name does a regex match so we use caret and dollar to achieve an exact match
    # the backslash is used to escape the dollar ^mysql$
    if [ "$(docker volume ls -q -f name=^$1\$)" ]; then
        # in bash 0 indicates success
        return 0
    else
        return 1
    fi
}

LDAP_VOLUME=${LDAP_VOLUME:-ldap.biotor.com}
if volumeExists $LDAP_VOLUME; then
    docker volume rm $LDAP_VOLUME
    echo "removed $LDAP_VOLUME"
fi

if [ -d certs ] ; then
  rm -rf certs
fi

if [ -d data ] ; then
  rm -rf data
fi

if [ -d backup ] ; then
  rm -rf backup
fi

if [ -d config ] ; then
  rm -rf config
fi

